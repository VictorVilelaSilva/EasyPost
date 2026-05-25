import json
import logging

import httpx

from app.common.cache import get_cache
from app.config import settings
from app.inventory.schemas import ItemDetailsResponse, SteamItem

logger = logging.getLogger(__name__)

DOTA2_APP_ID = 570


async def fetch_inventory(steam_id: str) -> list[SteamItem]:
    cache_key = steam_id
    cache = get_cache()

    if cache is not None:
        try:
            cached = await cache.get(cache_key)
            if cached is not None:
                return [SteamItem(**item) for item in json.loads(cached)]
        except Exception:
            logger.warning("Cache read failed for key %s", cache_key)

    url = f"https://steamcommunity.com/inventory/{steam_id}/{DOTA2_APP_ID}/2"
    base_params = {"l": "english", "count": 2000}

    assets = []
    descriptions: dict = {}

    async with httpx.AsyncClient() as client:
        start_assetid = None
        while True:
            params = {**base_params}
            if start_assetid:
                params["start_assetid"] = start_assetid

            resp = await client.get(url, params=params, timeout=10.0)
            resp.raise_for_status()
            data = resp.json()

            assets.extend(data.get("assets", []))
            descriptions.update(
                {(d["classid"], d["instanceid"]): d for d in data.get("descriptions", [])}
            )

            if data.get("more_items"):
                start_assetid = data.get("last_assetid")
            else:
                break

    items: list[SteamItem] = []
    for asset in assets:
        key = (asset["classid"], asset.get("instanceid", "0"))
        desc = descriptions.get(key, {})

        tradable = desc.get("tradable", 0) == 1
        is_mythical_bundle = desc.get("type") == "Mythical Bundle"
        if not tradable and not is_mythical_bundle:
            continue

        tags = desc.get("tags", [])
        rarity = None
        for tag in tags:
            if tag.get("category") == "Rarity":
                rarity = tag.get("localized_tag_name")
                break

        items.append(
            SteamItem(
                asset_id=asset["assetid"],
                class_id=asset["classid"],
                item_name=desc.get("market_hash_name", desc.get("name", "Unknown")),
                icon_url=f"https://community.cloudflare.steamstatic.com/economy/image/{desc['icon_url']}"
                if desc.get("icon_url")
                else None,
                rarity=rarity,
                tradable=True,
                tradable_after=None,
            )
        )

    if cache is not None:
        try:
            await cache.set(
                cache_key,
                json.dumps([item.model_dump() for item in items]),
                ex=settings.inventory_cache_ttl_seconds,
            )
        except Exception:
            logger.warning("Cache write failed for key %s", cache_key)

    return items


async def fetch_item_details(class_id: str) -> ItemDetailsResponse:
    cache_key = f"item_details:{class_id}"
    cache = get_cache()

    if cache is not None:
        try:
            cached = await cache.get(cache_key)
            if cached is not None:
                return ItemDetailsResponse(**json.loads(cached))
        except Exception:
            logger.warning("Cache read failed for key %s", cache_key)

    url = "https://api.steampowered.com/ISteamEconomy/GetAssetClassInfo/v1/"
    params = {
        "key": settings.steam_api_key,
        "appid": 570,
        "class_count": 1,
        "classid0": class_id,
    }
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params, timeout=10.0)
        resp.raise_for_status()
        data = resp.json()

    item = data.get("result", {}).get(class_id, {})

    # tags come as a dict keyed by index string
    raw_tags = item.get("tags", {})
    tags = list(raw_tags.values()) if isinstance(raw_tags, dict) else raw_tags

    hero = slot = quality = None
    for tag in tags:
        cat = tag.get("category", "")
        if cat == "Hero":
            hero = tag.get("name")
        elif cat == "Slot":
            slot = tag.get("name")
        elif cat == "Quality":
            quality = tag.get("name")

    # descriptions come as a dict keyed by index string
    raw_descs = item.get("descriptions", {})
    descs = list(raw_descs.values()) if isinstance(raw_descs, dict) else raw_descs

    set_name = None
    set_items: list[str] = []
    used_by = None

    for desc in descs:
        value = desc.get("value", "").strip()
        if not value or value == " ":
            continue

        app_data = desc.get("app_data", {})
        if isinstance(app_data, dict):
            if app_data.get("is_itemset_name") == "1":
                set_name = value
            elif app_data.get("def_index") and not app_data.get("is_itemset_name"):
                set_items.append(value)

        if value.startswith("Used By:"):
            used_by = value.replace("Used By:", "").strip()

    result = ItemDetailsResponse(
        class_id=class_id,
        name=item.get("market_hash_name") or item.get("name", ""),
        tradeble=item.get("tradable", 0),
        type=item.get("type"),
        hero=hero,
        slot=slot,
        quality=quality,
        set_name=set_name,
        set_items=set_items,
        used_by=used_by,
    )

    if cache is not None:
        try:
            await cache.set(
                cache_key,
                json.dumps(result.model_dump()),
                ex=settings.item_details_cache_ttl_seconds,
            )
        except Exception:
            logger.warning("Cache write failed for key %s", cache_key)

    return result


async def check_trade_ban(steam_id: str) -> bool:
    url = "https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/"
    params = {"key": settings.steam_api_key, "steamids": steam_id}
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params)
        data = resp.json()
    players = data.get("players", [])
    if not players:
        return True
    player = players[0]
    return player.get("EconomyBan", "none") != "none"
