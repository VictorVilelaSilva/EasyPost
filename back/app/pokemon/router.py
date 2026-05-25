import httpx
from fastapi import APIRouter, HTTPException, Query

from app.pokemon.schemas import PokemonDetail, PokemonListResponse
from app.pokemon.service import fetch_pokemon_detail, fetch_pokemon_list

router = APIRouter(prefix="/pokemon", tags=["pokemon"])


@router.get("", response_model=PokemonListResponse)
async def list_pokemon(
    search: str | None = Query(default=None, min_length=1, max_length=40),
    limit: int = Query(default=50, ge=1, le=100),
) -> PokemonListResponse:
    return await fetch_pokemon_list(search=search, limit=limit)


@router.get("/{name_or_id}", response_model=PokemonDetail)
async def pokemon_detail(name_or_id: str) -> PokemonDetail:
    try:
        return await fetch_pokemon_detail(name_or_id)
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 404:
            raise HTTPException(status_code=404, detail="Pokemon not found") from exc
        raise HTTPException(status_code=502, detail="Pokemon API unavailable") from exc
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Pokemon API unavailable") from exc
