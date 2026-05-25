from pydantic import BaseModel, Field


class PokemonSummary(BaseModel):
    id: int
    name: str
    display_name: str
    sprite_url: str | None = None
    artwork_url: str | None = None
    types: list[str] = Field(default_factory=list)


class PokemonListResponse(BaseModel):
    count: int
    results: list[PokemonSummary]


class PokemonDetail(PokemonSummary):
    height: int | None = None
    weight: int | None = None
    abilities: list[str] = Field(default_factory=list)
    stats: dict[str, int] = Field(default_factory=dict)
