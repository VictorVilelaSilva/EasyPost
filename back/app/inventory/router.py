import logging

from fastapi import APIRouter

from app.common.cache import get_cache
from app.common.dependencies import CurrentUser
from app.inventory.schemas import ItemDetailsResponse, SteamItem
from app.inventory.service import fetch_inventory, fetch_item_details

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/inventory", tags=["inventory"])


@router.get("/sync", response_model=list[SteamItem])
async def sync_inventory(user: CurrentUser) -> list[SteamItem]:
    return await fetch_inventory(user.steam_id)


@router.post("/refresh", status_code=204)
async def refresh_inventory(user: CurrentUser) -> None:
    cache = get_cache()
    if cache is not None:
        try:
            await cache.delete(user.steam_id)
        except Exception:
            logger.warning("Cache delete failed for steam_id %s", user.steam_id)


@router.get("/item-details/{class_id}", response_model=ItemDetailsResponse)
async def item_details(class_id: str) -> ItemDetailsResponse:
    return await fetch_item_details(class_id)
