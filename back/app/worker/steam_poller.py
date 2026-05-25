import asyncio
import logging
from datetime import UTC, datetime, timedelta

import httpx
from sqlalchemy import select

from app.auth.models import User
from app.config import settings
from app.database import async_session
from app.listings.models import Listing
from app.trade.gift_service import _check_item_delivered, _fetch_friend_since
from app.trade.models import Transaction
from app.trade.service import _check_transition, cancel_transaction, complete_transaction, mark_refunded

logger = logging.getLogger(__name__)

# Steam TradeOfferState enum
TRADE_STATE_ACCEPTED = 3
TRADE_STATE_DECLINED = 7
TRADE_STATE_CANCELED = 6
TRADE_STATE_EXPIRED = 11
TRADE_STATE_INVALID_ITEMS = 8

FAILED_STATES = {TRADE_STATE_DECLINED, TRADE_STATE_CANCELED, TRADE_STATE_EXPIRED, TRADE_STATE_INVALID_ITEMS}


async def poll_steam_trades() -> None:
    async with async_session() as db:
        result = await db.execute(
            select(Transaction).where(
                Transaction.status == "offer_confirmed",
                Transaction.trade_offer_id.isnot(None),
            )
        )
        transactions = result.scalars().all()

        for tx in transactions:
            try:
                seller_result = await db.execute(select(User).where(User.id == tx.seller_id))
                seller = seller_result.scalar_one()
                api_key = seller.steam_api_key or settings.steam_api_key

                state = await _get_trade_offer_state(api_key, tx.trade_offer_id)

                if state == TRADE_STATE_ACCEPTED:
                    await complete_transaction(db, tx.id)
                    logger.info("Transaction %d completed (trade accepted)", tx.id)
                elif state in FAILED_STATES:
                    await cancel_transaction(db, tx.id)
                    logger.info("Transaction %d cancelled (trade state %d)", tx.id, state)
            except Exception:
                logger.exception("Error polling trade for transaction %d", tx.id)


async def check_trade_deadlines() -> None:
    async with async_session() as db:
        result = await db.execute(
            select(Transaction).where(
                Transaction.status == "trade_pending",
                Transaction.trade_deadline < datetime.now(UTC),
            )
        )
        expired = result.scalars().all()

        for tx in expired:
            try:
                await cancel_transaction(db, tx.id)
                logger.info("Transaction %d cancelled (deadline expired)", tx.id)
            except Exception:
                logger.exception("Error cancelling expired transaction %d", tx.id)


async def process_refunds() -> None:
    async with async_session() as db:
        result = await db.execute(
            select(Transaction).where(Transaction.status == "cancelled")
        )
        cancelled = result.scalars().all()

        for tx in cancelled:
            try:
                if tx.payment_id:
                    await _refund_via_asaas(tx.payment_id)
                await mark_refunded(db, tx.id)
                logger.info("Transaction %d refunded", tx.id)
            except Exception:
                logger.exception("Error refunding transaction %d", tx.id)


async def _get_trade_offer_state(api_key: str, trade_offer_id: str) -> int | None:
    url = "https://api.steampowered.com/IEconService/GetTradeOffer/v1/"
    params = {"key": api_key, "tradeofferid": trade_offer_id}
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params, timeout=10.0)
        data = resp.json()
    offer = data.get("response", {}).get("offer", {})
    return offer.get("trade_offer_state")


async def _refund_via_asaas(payment_id: str) -> None:
    async with httpx.AsyncClient() as client:
        await client.post(
            f"{settings.asaas_base_url}/payments/{payment_id}/refund",
            headers={"access_token": settings.asaas_api_key},
        )


async def poll_friend_requests() -> None:
    """Detect when seller and buyer become friends and advance friend_pending transactions."""
    async with async_session() as db:
        result = await db.execute(
            select(Transaction).where(Transaction.status == "friend_pending")
        )
        transactions = result.scalars().all()

        for tx in transactions:
            try:
                seller_result = await db.execute(select(User).where(User.id == tx.seller_id))
                seller = seller_result.scalar_one()
                buyer_result = await db.execute(select(User).where(User.id == tx.buyer_id))
                buyer = buyer_result.scalar_one()

                api_key = seller.steam_api_key or settings.steam_api_key
                friend_since = await _fetch_friend_since(api_key, seller.steam_id, buyer.steam_id)

                if friend_since is None:
                    continue

                tx.friendship_accepted_at = datetime.fromtimestamp(friend_since, tz=UTC)
                threshold = datetime.now(UTC) - timedelta(days=30)

                if tx.friendship_accepted_at <= threshold:
                    _check_transition(tx, "gift_pending")
                    tx.status = "gift_pending"
                    tx.trade_deadline = datetime.now(UTC) + timedelta(days=3)
                    logger.info("Transaction %d: friends >=30d, advancing to gift_pending", tx.id)
                else:
                    _check_transition(tx, "friendship_cooling")
                    tx.status = "friendship_cooling"
                    logger.info("Transaction %d: friends since %s, advancing to friendship_cooling", tx.id, tx.friendship_accepted_at)

                await db.commit()
            except Exception:
                logger.exception("Error polling friend request for transaction %d", tx.id)


async def check_friendship_cooling() -> None:
    """Advance friendship_cooling to gift_pending when 30 days of friendship have elapsed."""
    async with async_session() as db:
        result = await db.execute(
            select(Transaction).where(Transaction.status == "friendship_cooling")
        )
        transactions = result.scalars().all()

        for tx in transactions:
            try:
                if tx.friendship_accepted_at is None:
                    continue
                threshold = datetime.now(UTC) - timedelta(days=30)
                fa = tx.friendship_accepted_at
                if fa.tzinfo is None:
                    fa = fa.replace(tzinfo=UTC)
                if fa <= threshold:
                    _check_transition(tx, "gift_pending")
                    tx.status = "gift_pending"
                    tx.trade_deadline = datetime.now(UTC) + timedelta(days=3)
                    await db.commit()
                    logger.info("Transaction %d advanced to gift_pending (30d friendship elapsed)", tx.id)
            except Exception:
                logger.exception("Error checking friendship_cooling for transaction %d", tx.id)


async def poll_gift_deliveries() -> None:
    """Detect when the gift has been delivered to the buyer's inventory."""
    async with async_session() as db:
        result = await db.execute(
            select(Transaction).where(Transaction.status == "gift_sent")
        )
        transactions = result.scalars().all()

        for tx in transactions:
            try:
                seller_result = await db.execute(select(User).where(User.id == tx.seller_id))
                seller = seller_result.scalar_one()
                buyer_result = await db.execute(select(User).where(User.id == tx.buyer_id))
                buyer = buyer_result.scalar_one()

                listing_result = await db.execute(
                    select(Listing).where(Listing.id == tx.listing_id)
                )
                listing = listing_result.scalar_one()

                delivered = await _check_item_delivered(
                    buyer_steam_id=buyer.steam_id,
                    seller_steam_id=seller.steam_id,
                    class_id=listing.class_id,
                    asset_id=listing.asset_id,
                )

                if delivered:
                    await complete_transaction(db, tx.id)
                    logger.info("Transaction %d: gift delivered, completing transaction", tx.id)
            except Exception:
                logger.exception("Error polling gift delivery for transaction %d", tx.id)


async def check_gift_deadlines() -> None:
    """Cancel gift transactions that have exceeded their deadline."""
    GIFT_DEADLINE_STATES = ("seller_confirming", "friend_pending", "gift_pending")

    async with async_session() as db:
        result = await db.execute(
            select(Transaction).where(
                Transaction.status.in_(GIFT_DEADLINE_STATES),
                Transaction.trade_deadline < datetime.now(UTC),
            )
        )
        expired = result.scalars().all()

        for tx in expired:
            try:
                await cancel_transaction(db, tx.id)
                logger.info("Transaction %d cancelled (gift deadline expired from %s)", tx.id, tx.status)
            except Exception:
                logger.exception("Error cancelling expired gift transaction %d", tx.id)


async def run_worker() -> None:  # pragma: no cover
    logger.info("Starting background worker")
    while True:
        try:
            await poll_steam_trades()
        except Exception:
            logger.exception("poll_steam_trades error")

        try:
            await check_trade_deadlines()
        except Exception:
            logger.exception("check_trade_deadlines error")

        try:
            await process_refunds()
        except Exception:
            logger.exception("process_refunds error")

        try:
            await poll_friend_requests()
        except Exception:
            logger.exception("poll_friend_requests error")

        try:
            await check_friendship_cooling()
        except Exception:
            logger.exception("check_friendship_cooling error")

        try:
            await poll_gift_deliveries()
        except Exception:
            logger.exception("poll_gift_deliveries error")

        try:
            await check_gift_deadlines()
        except Exception:
            logger.exception("check_gift_deadlines error")

        await asyncio.sleep(settings.steam_poll_interval_seconds)
