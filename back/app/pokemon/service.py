import json
import logging
from urllib.parse import urlparse

import httpx

from app.pokemon.cache import get_cache
from app.config import settings
from app.pokemon.schemas import PokemonDetail, PokemonListResponse, PokemonSummary

logger = logging.getLogger(__name__)

POKEMON_LIST_LIMIT = 1302


async def fetch_pokemon_list(
    search: str | None = None, limit: int = 50
) -> PokemonListResponse:
    normalized_search = search.strip().lower() if search else ""
    safe_limit = max(1, min(limit, 100))
    all_pokemon = await _fetch_all_pokemon()

    if normalized_search:
        filtered = [
            pokemon
            for pokemon in all_pokemon
            if normalized_search in pokemon.name
            or normalized_search in pokemon.display_name.lower()
        ]
    else:
        filtered = all_pokemon

    return PokemonListResponse(count=len(filtered), results=filtered[:safe_limit])


async def fetch_pokemon_detail(name_or_id: str) -> PokemonDetail:
    cache_key = f"pokemon:detail:{name_or_id.strip().lower()}"
    cache = get_cache()

    if cache is not None:
        try:
            cached = await cache.get(cache_key)
            if cached is not None:
                return PokemonDetail(**json.loads(cached))
        except Exception:
            logger.warning("Cache read failed for key %s", cache_key)

    async with httpx.AsyncClient(
        base_url=settings.pokemon_api_base_url, timeout=10.0
    ) as client:
        response = await client.get(f"/pokemon/{name_or_id.strip().lower()}")
        response.raise_for_status()
        data = response.json()

    detail = _parse_pokemon_detail(data)

    if cache is not None:
        try:
            await cache.set(
                cache_key,
                json.dumps(detail.model_dump()),
                ex=settings.pokemon_cache_ttl_seconds,
            )
        except Exception:
            logger.warning("Cache write failed for key %s", cache_key)

    return detail


async def _fetch_all_pokemon() -> list[PokemonSummary]:
    cache_key = "pokemon:list:all"
    cache = get_cache()

    if cache is not None:
        try:
            cached = await cache.get(cache_key)
            if cached is not None:
                return [PokemonSummary(**item) for item in json.loads(cached)]
        except Exception:
            logger.warning("Cache read failed for key %s", cache_key)

    async with httpx.AsyncClient(
        base_url=settings.pokemon_api_base_url, timeout=10.0
    ) as client:
        response = await client.get(
            "/pokemon", params={"limit": POKEMON_LIST_LIMIT, "offset": 0}
        )
        response.raise_for_status()
        data = response.json()

    pokemon = [_parse_pokemon_summary(item) for item in data.get("results", [])]

    if cache is not None:
        try:
            await cache.set(
                cache_key,
                json.dumps([item.model_dump() for item in pokemon]),
                ex=settings.pokemon_cache_ttl_seconds,
            )
        except Exception:
            logger.warning("Cache write failed for key %s", cache_key)

    return pokemon


def _parse_pokemon_summary(raw: dict) -> PokemonSummary:
    pokemon_id = _pokemon_id_from_url(raw.get("url", ""))
    name = raw.get("name", "")

    return PokemonSummary(
        id=pokemon_id,
        name=name,
        display_name=_display_name(name),
        sprite_url=f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{pokemon_id}.png"
        if pokemon_id
        else None,
        artwork_url=(
            "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/"
            f"official-artwork/{pokemon_id}.png"
        )
        if pokemon_id
        else None,
    )


def _parse_pokemon_detail(data: dict) -> PokemonDetail:
    name = data.get("name", "")
    sprites = data.get("sprites") or {}
    official_artwork = (sprites.get("other") or {}).get("official-artwork") or {}

    return PokemonDetail(
        id=data.get("id", 0),
        name=name,
        display_name=_display_name(name),
        sprite_url=sprites.get("front_default"),
        artwork_url=official_artwork.get("front_default"),
        types=[
            entry.get("type", {}).get("name", "") for entry in data.get("types", [])
        ],
        height=data.get("height"),
        weight=data.get("weight"),
        abilities=[
            entry.get("ability", {}).get("name", "")
            for entry in data.get("abilities", [])
        ],
        stats={
            entry.get("stat", {}).get("name", ""): entry.get("base_stat", 0)
            for entry in data.get("stats", [])
        },
    )


def _pokemon_id_from_url(url: str) -> int:
    try:
        path_parts = [part for part in urlparse(url).path.split("/") if part]
        return int(path_parts[-1])
    except (IndexError, ValueError):
        return 0


def _display_name(name: str) -> str:
    return " ".join(part.capitalize() for part in name.replace("-", " ").split())
