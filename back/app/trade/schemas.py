from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel


class CreateTransactionRequest(BaseModel):
    listing_id: int


class ConfirmOfferRequest(BaseModel):
    trade_offer_id: str


class TransactionResponse(BaseModel):
    id: int
    listing_id: int
    buyer_id: int
    buyer_steam_id: str | None = None
    buyer_display_name: str | None = None
    buyer_avatar_url: str | None = None
    buyer_reputation: int = 0
    buyer_trade_url: str | None = None
    seller_id: int
    amount: Decimal
    status: str
    delivery_type: Literal["trade", "gift"]
    security_code: str
    trade_offer_id: str | None
    payment_id: str | None
    pix_qr_code: str | None
    pix_copy_paste: str | None
    trade_deadline: datetime | None
    seller_payout_after: datetime | None
    friendship_accepted_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class TransactionListItem(TransactionResponse):
    item_name: str
    icon_url: str | None = None
    rarity: str | None = None


class TransactionListResponse(BaseModel):
    items: list[TransactionListItem]
    total: int
    page: int
    total_pages: int
