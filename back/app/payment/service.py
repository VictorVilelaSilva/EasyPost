import hmac
import logging
import traceback as tb
from decimal import Decimal

import httpx
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import User
from app.common.exceptions import BadRequestError
from app.config import settings
from app.database import async_session
from app.payment.models import PaymentEvent, PaymentProcessingError
from app.trade.models import Transaction
from app.trade.service import advance_to_paid

logger = logging.getLogger(__name__)


async def _persist_processing_error(payload: dict, exc: Exception) -> None:
    event_type = payload.get("event") if isinstance(payload, dict) else None
    payment_data = payload.get("payment", {}) if isinstance(payload, dict) else {}
    external_ref = payment_data.get("externalReference") if isinstance(payment_data, dict) else None

    transaction_id: int | None = None
    if external_ref:
        try:
            transaction_id = int(str(external_ref))
        except (TypeError, ValueError):
            pass

    error = PaymentProcessingError(
        transaction_id=transaction_id,
        event_type=event_type,
        error_type=type(exc).__name__,
        error_message=str(exc),
        traceback="".join(tb.format_exception(exc)),
        payload=payload if isinstance(payload, dict) else None,
    )
    try:
        async with async_session() as db:
            db.add(error)
            await db.commit()
    except Exception:
        logger.exception("Failed to persist payment processing error to database")


async def create_asaas_customer(name: str, email: str, cpf: str) -> str:
    """Create a customer in Asaas and return the customer ID."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{settings.asaas_base_url}/customers",
            headers={"access_token": settings.asaas_api_key},
            json={
                "name": name,
                "email": email,
                "cpfCnpj": cpf,
            },
        )
        if not resp.is_success:
            data = resp.json()
            errors = data.get("errors", [])
            msg = errors[0].get("description", "Asaas customer creation failed") if errors else "Asaas customer creation failed"
            raise ValueError(msg)
        return resp.json()["id"]


async def create_pix_charge(transaction: Transaction, asaas_customer_id: str) -> dict:
    from datetime import UTC, datetime, timedelta

    due_date = (datetime.now(UTC) + timedelta(hours=24)).strftime("%Y-%m-%d")

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{settings.asaas_base_url}/payments",
            headers={"access_token": settings.asaas_api_key},
            json={
                "customer": asaas_customer_id,
                "billingType": "PIX",
                "value": float(transaction.amount),
                "dueDate": due_date,
                "description": f"Trade #{transaction.id} - Item purchase",
                "externalReference": str(transaction.id),
            },
        )
        if not resp.is_success:
            raise ValueError(f"Asaas payment creation failed [{resp.status_code}]: {resp.text}")
        payment = resp.json()

        # QR code is not included in the create response — requires a separate call
        payment_id = payment.get("id")
        if payment_id:
            qr_resp = await client.get(
                f"{settings.asaas_base_url}/payments/{payment_id}/pixQrCode",
                headers={"access_token": settings.asaas_api_key},
            )
            if qr_resp.status_code == 200:
                qr_data = qr_resp.json()
                payment["_pixQrCode"] = qr_data.get("encodedImage")
                payment["_pixPayload"] = qr_data.get("payload")

        return payment


_TRANSFER_FAILED_EVENTS = {"TRANSFER_FAILED", "TRANSFER_BLOCKED", "TRANSFER_CANCELLED"}


async def _handle_transfer_event(db: AsyncSession, event_type: str, payload: dict) -> None:
    transfer_data = payload.get("transfer", {})
    if not isinstance(transfer_data, dict):
        return

    transfer_id = transfer_data.get("id")
    if not transfer_id:
        return

    from app.trade.models import Transaction
    result = await db.execute(select(Transaction).where(Transaction.payout_transfer_id == transfer_id))
    tx = result.scalar_one_or_none()
    if tx is None:
        logger.warning("Transfer webhook %s: no transaction found for payout_transfer_id=%s", event_type, transfer_id)
        return

    if event_type == "TRANSFER_DONE":
        logger.info("Transaction %d: Pix payout %s confirmed (TRANSFER_DONE)", tx.id, transfer_id)

    elif event_type in _TRANSFER_FAILED_EVENTS:
        fail_reason = transfer_data.get("failReason", "unknown")
        logger.error(
            "Transaction %d: Pix payout %s failed (%s, reason=%s) — crediting seller balance as fallback",
            tx.id, transfer_id, event_type, fail_reason,
        )
        from app.auth.models import User
        seller_result = await db.execute(select(User).where(User.id == tx.seller_id))
        seller = seller_result.scalar_one()
        seller.balance += tx.seller_amount
        await db.commit()


async def process_webhook(db: AsyncSession, payload: dict) -> None:
    event_type = payload.get("event", "")

    if event_type.startswith("TRANSFER_"):
        await _handle_transfer_event(db, event_type, payload)
        return

    payment_data = payload.get("payment", {})
    if not isinstance(payment_data, dict):
        return

    external_ref = payment_data.get("externalReference")
    if not external_ref:
        return

    try:
        transaction_id = int(str(external_ref))
    except (TypeError, ValueError):
        logger.warning("Ignoring webhook with invalid externalReference: %r", external_ref)
        return

    # Webhooks have at-least-once delivery, so we should ignore duplicate payloads.
    event_id = payload.get("id")
    payment_id = payment_data.get("id")
    recent_events_result = await db.execute(
        select(PaymentEvent.payload)
        .where(
            PaymentEvent.transaction_id == transaction_id,
            PaymentEvent.event_type == event_type,
        )
        .order_by(PaymentEvent.id.desc())
        .limit(50)
    )
    recent_payloads = recent_events_result.scalars().all()
    for stored_payload in recent_payloads:
        if not isinstance(stored_payload, dict):
            continue
        if event_id and stored_payload.get("id") == event_id:
            logger.info("Ignoring duplicate webhook event id=%s", event_id)
            return

        stored_payment = stored_payload.get("payment", {})
        if (
            payment_id
            and isinstance(stored_payment, dict)
            and stored_payment.get("id") == payment_id
            and stored_payload.get("event") == event_type
        ):
            logger.info("Ignoring duplicate webhook payment id=%s event=%s", payment_id, event_type)
            return

    event = PaymentEvent(
        transaction_id=transaction_id,
        event_type=event_type,
        payload=payload,
    )
    db.add(event)
    await db.commit()

    if event_type == "PAYMENT_RECEIVED":
        # Asaas retries webhooks; only the first PAYMENT_RECEIVED should advance
        # the transaction. Replays for transactions already in the trade or gift
        # flow must not collide with their state machines.
        tx_result = await db.execute(
            select(Transaction).where(Transaction.id == transaction_id)
        )
        tx = tx_result.scalar_one_or_none()
        if tx is None:
            return
        if tx.status != "pending_payment":
            logger.info(
                "Ignoring PAYMENT_RECEIVED replay for transaction %d (status=%s)",
                transaction_id,
                tx.status,
            )
            return

        payment_id = payment_data.get("id", "")
        await advance_to_paid(db, transaction_id, payment_id)


async def process_webhook_in_background(payload: dict) -> None:
    async with async_session() as db:
        try:
            await process_webhook(db, payload)
        except Exception as exc:
            await db.rollback()
            await _persist_processing_error(payload, exc)
            logger.exception("Failed to process Asaas webhook in background")


def verify_webhook_signature(token: str) -> bool:
    # Asaas sends the configured token as plain text in the asaas-access-token header
    if not settings.asaas_webhook_token:
        return False
    return hmac.compare_digest(settings.asaas_webhook_token, token)


async def send_pix_transfer(amount: Decimal, pix_key: str, pix_key_type: str, description: str, external_reference: str) -> dict:
    """Transfer funds from our Asaas account to a Pix key."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{settings.asaas_base_url}/transfers",
            headers={"access_token": settings.asaas_api_key},
            json={
                "value": float(amount),
                "pixAddressKey": pix_key,
                "pixAddressKeyType": pix_key_type,
                "description": description,
                "externalReference": external_reference,
            },
        )
        resp.raise_for_status()
        return resp.json()


async def request_withdrawal(db: AsyncSession, user: User, amount: Decimal, pix_key: str) -> dict:
    if user.balance < amount:
        raise BadRequestError("Insufficient balance")

    # Calculate held balance (completed transactions still within hold period)
    from datetime import UTC, datetime
    now = datetime.now(UTC)
    result = await db.execute(
        select(func.coalesce(func.sum(Transaction.seller_amount), 0)).where(
            Transaction.seller_id == user.id,
            Transaction.status == "completed",
            Transaction.seller_payout_after.isnot(None),
            Transaction.seller_payout_after > now,
        )
    )
    held_amount = Decimal(str(result.scalar_one()))

    available_balance = user.balance - held_amount
    if available_balance < amount:
        raise BadRequestError(
            f"Insufficient available balance. ${held_amount:.2f} is held until payout period ends."
        )

    user.balance -= amount
    await db.commit()

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{settings.asaas_base_url}/transfers",
            headers={"access_token": settings.asaas_api_key},
            json={
                "value": float(amount),
                "pixAddressKey": pix_key,
                "description": f"Withdrawal for user {user.id}",
            },
        )
        resp.raise_for_status()
        return resp.json()
