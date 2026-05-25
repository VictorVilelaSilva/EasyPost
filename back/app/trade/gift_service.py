from datetime import UTC, datetime, timedelta

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import User
from app.common.exceptions import ForbiddenError
from app.config import settings
from app.trade.models import Transaction
from app.trade.service import _check_transition, _get_transaction


async def advance_to_seller_confirming(db: AsyncSession, transaction_id: int) -> Transaction:
    tx = await _get_transaction(db, transaction_id)
    _check_transition(tx, "seller_confirming")
    tx.status = "seller_confirming"
    tx.trade_deadline = datetime.now(UTC) + timedelta(hours=settings.trade_deadline_hours)
    await db.commit()
    await db.refresh(tx)
    return tx


async def confirm_sale(db: AsyncSession, user: User, transaction_id: int):
    """seller_confirming → friend_pending. Only the seller can call this."""
    tx = await _get_transaction(db, transaction_id)
    if tx.seller_id != user.id:
        raise ForbiddenError("Only the seller can confirm the sale")
    _check_transition(tx, "friend_pending")
    tx.status = "friend_pending"
    tx.trade_deadline = datetime.now(UTC) + timedelta(hours=settings.trade_deadline_hours)
    await db.commit()
    await db.refresh(tx)
    return tx


async def mark_gift_sent(db: AsyncSession, user: User, transaction_id: int):
    """gift_pending → gift_sent. Only the seller can call this."""
    tx = await _get_transaction(db, transaction_id)
    if tx.seller_id != user.id:
        raise ForbiddenError("Only the seller can mark the gift as sent")
    _check_transition(tx, "gift_sent")
    tx.status = "gift_sent"
    await db.commit()
    await db.refresh(tx)
    return tx


async def _fetch_friend_since(
    seller_api_key: str,
    seller_steam_id: str,
    buyer_steam_id: str,
) -> int | None:
    """
    Returns the Unix timestamp of when the friendship was established,
    or None if not friends or API call failed.
    """
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "http://api.steampowered.com/ISteamUser/GetFriendList/v0001/",
            params={"key": seller_api_key, "steamid": seller_steam_id, "relationship": "friend"},
            timeout=10.0,
        )
    if not resp.is_success:
        return None
    friends = resp.json().get("friendslist", {}).get("friends", [])
    for f in friends:
        if f["steamid"] == buyer_steam_id:
            return f["friend_since"]
    return None


async def _check_item_delivered(
    buyer_steam_id: str,
    seller_steam_id: str,
    class_id: str,
    asset_id: str,
) -> bool:
    """
    Returns True when:
    - class_id appears in buyer's Steam inventory
    - asset_id no longer appears in seller's Steam inventory
    """
    async with httpx.AsyncClient() as client:
        buyer_resp = await client.get(
            f"https://steamcommunity.com/inventory/{buyer_steam_id}/570/2",
            params={"l": "english", "count": 2200},
            timeout=15.0,
        )
        seller_resp = await client.get(
            f"https://steamcommunity.com/inventory/{seller_steam_id}/570/2",
            params={"l": "english", "count": 2200},
            timeout=15.0,
        )

        buyer_has = False
        if buyer_resp.is_success:
            assets = buyer_resp.json().get("assets", [])
            buyer_has = any(a.get("classid") == class_id for a in assets)

        seller_still_has = True
        if seller_resp.is_success:
            assets = seller_resp.json().get("assets", [])
            seller_still_has = any(a.get("assetid") == asset_id for a in assets)

    return buyer_has and not seller_still_has
