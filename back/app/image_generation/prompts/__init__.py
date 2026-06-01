from collections.abc import Callable

from app.image_generation.prompts import (
    anime_general,
    avatar,
    bleach,
    copa,
    couple,
    lego,
    monster_high,
    pokemon,
    rick_morty,
    san_andreas,
)
from app.image_generation.schemas import PromptTemplate

PromptBuilder = Callable[..., str]

PROMPT_BUILDERS: dict[PromptTemplate, PromptBuilder] = {
    "anime-general": anime_general.build_prompt,
    "avatar": avatar.build_prompt,
    "bleach": bleach.build_prompt,
    "copa": copa.build_prompt,
    "couple": couple.build_prompt,
    "lego": lego.build_prompt,
    "monster_high": monster_high.build_prompt,
    "pokemon": pokemon.build_prompt,
    "rick_morty": rick_morty.build_prompt,
    "san_andreas": san_andreas.build_prompt,
}
