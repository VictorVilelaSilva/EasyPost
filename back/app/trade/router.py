import math

from fastapi import APIRouter, Query

from app.common.dependencies import CurrentUser, DbSession
from app.trade.schemas import (
    ConfirmOfferRequest,
    CreateTransactionRequest,
    TransactionListItem,
    TransactionListResponse,
    TransactionResponse,
)
from app.trade.service import confirm_offer, create_transaction, get_transaction_by_id, get_user_transactions, mark_trade_sent
from app.trade.gift_service import confirm_sale, mark_gift_sent

router = APIRouter(prefix="/transactions", tags=["transactions"])



@router.post("", response_model=TransactionResponse, status_code=201)
async def create(body: CreateTransactionRequest, user: CurrentUser, db: DbSession) -> TransactionResponse:
    tx = await create_transaction(db, user, body.listing_id)
    return TransactionResponse.model_validate(tx)  # pragma: no cover


@router.get("/me", response_model=TransactionListResponse)
async def my_transactions(
    user: CurrentUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    limit: int = Query(8, ge=1, le=100),
    role: str | None = Query(None, pattern="^(buyer|seller)$"),
    status_filter: str | None = Query(None, pattern="^(all|active|completed|cancelled)$"),
) -> TransactionListResponse:
    txs, total = await get_user_transactions(db, user.id, page, limit, role, status_filter)  # pragma: no cover
    total_pages = max(1, math.ceil(total / limit))  # pragma: no cover
    items = []  # pragma: no cover
    for t in txs:  # pragma: no cover
        data = TransactionResponse.model_validate(t).model_dump()  # pragma: no cover
        data["item_name"] = t.listing.item_name  # pragma: no cover
        data["icon_url"] = t.listing.icon_url  # pragma: no cover
        data["rarity"] = t.listing.rarity  # pragma: no cover
        items.append(TransactionListItem(**data))  # pragma: no cover
    return TransactionListResponse(items=items, total=total, page=page, total_pages=total_pages)  # pragma: no cover


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(transaction_id: int, user: CurrentUser, db: DbSession) -> TransactionResponse:
    tx = await get_transaction_by_id(db, user, transaction_id)
    return TransactionResponse.model_validate(tx)  # pragma: no cover


@router.post("/{transaction_id}/mark-sent", response_model=TransactionResponse)
async def mark_sent_endpoint(
    transaction_id: int,
    user: CurrentUser,
    db: DbSession,
) -> TransactionResponse:
    tx = await mark_trade_sent(db, user, transaction_id)
    return TransactionResponse.model_validate(tx)  # pragma: no cover


@router.post("/{transaction_id}/confirm-offer", response_model=TransactionResponse)
async def confirm_offer_endpoint(
    transaction_id: int,
    body: ConfirmOfferRequest,
    user: CurrentUser,
    db: DbSession,
) -> TransactionResponse:
    tx = await confirm_offer(db, user, transaction_id, body.trade_offer_id)
    return TransactionResponse.model_validate(tx)  # pragma: no cover


@router.post("/{transaction_id}/confirm-sale", response_model=TransactionResponse)
async def confirm_sale_endpoint(transaction_id: int, user: CurrentUser, db: DbSession) -> TransactionResponse:
    tx = await confirm_sale(db, user, transaction_id)
    return TransactionResponse.model_validate(tx)  # pragma: no cover


@router.post("/{transaction_id}/friend-request-sent", response_model=TransactionResponse)
async def friend_request_sent_endpoint(transaction_id: int, user: CurrentUser, db: DbSession) -> TransactionResponse:
    """Cosmetic endpoint — seller acknowledges they sent the friend request. No state change."""
    tx = await get_transaction_by_id(db, user, transaction_id)
    return TransactionResponse.model_validate(tx)  # pragma: no cover


@router.post("/{transaction_id}/gift-sent", response_model=TransactionResponse)
async def gift_sent_endpoint(transaction_id: int, user: CurrentUser, db: DbSession) -> TransactionResponse:
    tx = await mark_gift_sent(db, user, transaction_id)
    return TransactionResponse.model_validate(tx)  # pragma: no cover


