import secrets
from datetime import UTC, datetime, timedelta
from decimal import ROUND_HALF_UP, Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.models import User
from app.common.exceptions import BadRequestError, ForbiddenError, NotFoundError
from app.config import settings
from app.listings.models import Listing
from app.trade.models import Transaction
from app.trade.state import check_transition


def _check_transition(tx: Transaction, target: str) -> None:
    check_transition(tx.delivery_type, tx.status, target)


def calculate_fees(amount: Decimal) -> tuple[Decimal, Decimal]:
    fee = (amount * settings.platform_fee_percent / 100).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    seller_amount = amount - fee
    return fee, seller_amount


async def create_transaction(db: AsyncSession, buyer: User, listing_id: int) -> Transaction:
    result = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = result.scalar_one_or_none()
    if listing is None:
        raise NotFoundError("Listing not found")
    if listing.status != "active":
        raise BadRequestError("Listing is not available")
    if listing.seller_id == buyer.id:
        raise BadRequestError("Cannot buy your own listing")

    amount = Decimal(str(listing.price))
    fee, seller_amount = calculate_fees(amount)

    transaction = Transaction(
        listing_id=listing.id,
        buyer_id=buyer.id,
        seller_id=listing.seller_id,
        amount=amount,
        platform_fee=fee,
        seller_amount=seller_amount,
        security_code=secrets.token_hex(4).upper(),
        delivery_type=listing.delivery_type,
    )

    listing.status = "reserved"
    db.add(transaction)
    await db.commit()
    await db.refresh(transaction)

    try:
        from app.payment.service import create_pix_charge
        if buyer.asaas_customer_id:
            charge_data = await create_pix_charge(transaction, buyer.asaas_customer_id)
            transaction.payment_id = charge_data.get("id")
            transaction.pix_qr_code = charge_data.get("_pixQrCode")
            transaction.pix_copy_paste = charge_data.get("_pixPayload")
            await db.commit()
            await db.refresh(transaction)
    except Exception:
        import logging
        logging.getLogger(__name__).exception(
            "create_pix_charge failed for transaction %s", transaction.id
        )

    return transaction


async def advance_to_paid(db: AsyncSession, transaction_id: int, payment_id: str) -> Transaction:
    """Mark a transaction as paid and dispatch to the correct delivery flow.

    Each delivery flow has its own state machine — this function is the single
    boundary where webhook payment events route into either the trade or gift
    flow. After dispatching, the trade and gift state machines never overlap.
    """
    tx = await _get_transaction(db, transaction_id)
    _check_transition(tx, "paid")
    tx.status = "paid"
    tx.payment_id = payment_id
    await db.commit()

    if tx.delivery_type == "gift":
        from app.trade.gift_service import advance_to_seller_confirming
        return await advance_to_seller_confirming(db, transaction_id)
    return await advance_to_trade_pending(db, transaction_id)


async def advance_to_trade_pending(db: AsyncSession, transaction_id: int) -> Transaction:
    tx = await _get_transaction(db, transaction_id)
    _check_transition(tx, "trade_pending")
    tx.status = "trade_pending"
    tx.trade_deadline = datetime.now(UTC) + timedelta(hours=settings.trade_deadline_hours)
    await db.commit()
    await db.refresh(tx)
    return tx


async def mark_trade_sent(db: AsyncSession, user: User, transaction_id: int) -> Transaction:
    tx = await _get_transaction(db, transaction_id)
    if tx.seller_id != user.id:
        raise ForbiddenError("Only the seller can mark the trade as sent")
    _check_transition(tx, "trade_sent")
    tx.status = "trade_sent"
    await db.commit()
    await db.refresh(tx)
    return tx


async def confirm_offer(db: AsyncSession, user: User, transaction_id: int, trade_offer_id: str) -> Transaction:
    tx = await _get_transaction(db, transaction_id)
    if tx.buyer_id != user.id:
        raise ForbiddenError("Only the buyer can confirm the trade offer")
    _check_transition(tx, "offer_confirmed")
    tx.status = "offer_confirmed"
    tx.trade_offer_id = trade_offer_id
    await db.commit()
    await db.refresh(tx)
    return tx


async def complete_transaction(db: AsyncSession, transaction_id: int) -> Transaction:
    import logging
    logger = logging.getLogger(__name__)

    tx = await _get_transaction(db, transaction_id)
    _check_transition(tx, "completed")
    tx.status = "completed"

    result = await db.execute(select(User).where(User.id == tx.seller_id))
    seller = result.scalar_one()

    result = await db.execute(select(Listing).where(Listing.id == tx.listing_id))
    listing = result.scalar_one()
    listing.status = "sold"

    if seller.pix_key and seller.pix_key_type:
        await db.commit()
        await db.refresh(tx)
        try:
            from app.payment.service import send_pix_transfer
            transfer = await send_pix_transfer(
                amount=tx.seller_amount,
                pix_key=seller.pix_key,
                pix_key_type=seller.pix_key_type,
                description=f"Venda #{tx.id} - TangoShop",
                external_reference=f"payout_{tx.id}",
            )
            tx.payout_transfer_id = transfer.get("id")
            await db.commit()
            await db.refresh(tx)
            logger.info("Transaction %d: Pix transfer %s initiated for seller %d", tx.id, tx.payout_transfer_id, seller.id)
        except Exception:
            # Transfer failed — credit balance as fallback with the standard hold period
            logger.exception("Transaction %d: Pix transfer creation failed, crediting balance as fallback", tx.id)
            tx.seller_payout_after = datetime.now(UTC) + timedelta(hours=settings.payout_hold_hours)
            seller.balance += tx.seller_amount
            await db.commit()
            await db.refresh(tx)
    else:
        tx.seller_payout_after = datetime.now(UTC) + timedelta(hours=settings.payout_hold_hours)
        seller.balance += tx.seller_amount
        await db.commit()
        await db.refresh(tx)

    return tx


async def cancel_transaction(db: AsyncSession, transaction_id: int) -> Transaction:
    tx = await _get_transaction(db, transaction_id)
    _check_transition(tx, "cancelled")
    tx.status = "cancelled"

    result = await db.execute(select(Listing).where(Listing.id == tx.listing_id))
    listing = result.scalar_one()
    listing.status = "active"

    await db.commit()
    await db.refresh(tx)
    return tx


async def mark_refunded(db: AsyncSession, transaction_id: int) -> Transaction:
    tx = await _get_transaction(db, transaction_id)
    _check_transition(tx, "refunded")
    tx.status = "refunded"
    await db.commit()
    await db.refresh(tx)
    return tx


async def get_transaction_by_id(db: AsyncSession, user: User, transaction_id: int) -> Transaction:
    tx = await _get_transaction(db, transaction_id)
    if tx.buyer_id != user.id and tx.seller_id != user.id:
        raise ForbiddenError("Not your transaction")
    return tx


_ACTIVE_STATUSES = {
    "pending_payment", "paid", "trade_pending", "trade_sent",
    "seller_confirming", "friend_pending", "friendship_cooling",
    "gift_pending", "gift_sent",
}


async def get_user_transactions(
    db: AsyncSession,
    user_id: int,
    page: int = 1,
    limit: int = 8,
    role: str | None = None,
    status_filter: str | None = None,
) -> tuple[list[Transaction], int]:
    if role == "buyer":
        role_clause = Transaction.buyer_id == user_id
    elif role == "seller":
        role_clause = Transaction.seller_id == user_id
    else:
        role_clause = (Transaction.buyer_id == user_id) | (Transaction.seller_id == user_id)

    filters = [role_clause]
    if status_filter == "active":
        filters.append(Transaction.status.in_(_ACTIVE_STATUSES))
    elif status_filter == "completed":
        filters.append(Transaction.status == "completed")
    elif status_filter == "cancelled":
        filters.append(Transaction.status.in_(["cancelled", "refunded"]))

    count_result = await db.execute(select(func.count()).select_from(Transaction).where(*filters))
    total = count_result.scalar_one()

    result = await db.execute(
        select(Transaction)
        .options(
            selectinload(Transaction.buyer),
            selectinload(Transaction.listing),
        )
        .where(*filters)
        .order_by(Transaction.id.desc())
        .limit(limit)
        .offset((page - 1) * limit)
    )
    return list(result.scalars().all()), total


async def _get_transaction(db: AsyncSession, transaction_id: int) -> Transaction:
    result = await db.execute(
        select(Transaction)
        .options(selectinload(Transaction.buyer))
        .where(Transaction.id == transaction_id)
    )
    tx = result.scalar_one_or_none()
    if tx is None:
        raise NotFoundError("Transaction not found")
    return tx
