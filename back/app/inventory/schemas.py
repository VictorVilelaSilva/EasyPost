from pydantic import BaseModel


class SteamItem(BaseModel):
    asset_id: str
    class_id: str
    item_name: str
    icon_url: str | None
    rarity: str | None
    tradable: bool
    tradable_after: str | None  # ISO datetime string or None


class ItemDetailsResponse(BaseModel):
    class_id: str
    name: str
    type: str | None
    tradeble: bool
    hero: str | None
    slot: str | None
    quality: str | None
    set_name: str | None
    set_items: list[str]
    used_by: str | None
