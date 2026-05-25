from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class CreateListingRequest(BaseModel):
    asset_id: str
    class_id: str
    item_name: str
    icon_url: str | None = None
    rarity: str | None = None
    hero: str | None = None
    price: float = Field(gt=0)
    delivery_type: Literal["trade", "gift"] = "trade"


class ListingResponse(BaseModel):
    id: int
    asset_id: str
    class_id: str
    item_name: str
    icon_url: str | None
    rarity: str | None
    hero: str | None
    price: float
    status: str
    delivery_type: Literal["trade", "gift"]
    tradable_after: datetime | None
    created_at: datetime
    seller_id: int | None = None
    seller_display_name: str | None = None
    seller_avatar_url: str | None = None
    seller_reputation: int = 0
    seller_steam_id: str | None = None

    model_config = {"from_attributes": True}


class ListingListResponse(BaseModel):
    items: list[ListingResponse]
    total: int
    page: int
    total_pages: int


class UpdateListingRequest(BaseModel):
    price: float = Field(gt=0)


class GroupedListingResponse(BaseModel):
    class_id: str
    item_name: str
    icon_url: str | None
    rarity: str | None
    hero: str | None
    avg_price: float
    offer_count: int


class GroupedListingListResponse(BaseModel):
    items: list[GroupedListingResponse]
    total: int
    page: int
    total_pages: int


class ListingWithSellerResponse(ListingResponse):
    seller_avatar_url: str | None
    seller_reputation: int
    seller_display_name: str


class ListingWithSellerListResponse(BaseModel):
    items: list[ListingWithSellerResponse]
    total: int
    page: int
    total_pages: int
