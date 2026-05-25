from functools import lru_cache
from pathlib import Path

from app.image_generation.schemas import PokemonImageGenerationInput, PokemonOutfit


DEFAULT_POKEMON = [
    ("Mewtwo", "atrás do treinador"),
    ("Quilava", "ao lado dele"),
    ("Pichu", "na parte inferior"),
    ("Eevee", "no ombro"),
    ("Ledian", "no primeiro plano"),
]

POSITION_PROMPTS = {
    "atrás do treinador": "flying behind the trainer with cinematic presence",
    "ao lado dele": "standing powerfully beside him",
    "na parte inferior": "near the lower side with intense glowing eyes",
    "no ombro": "sitting on his shoulder",
    "no primeiro plano": "near the foreground with expressive energy",
    "no canto inferior": "positioned elegantly near the bottom corner",
    "no centro inferior": "in the middle at the bottom",
    "voando acima": "flying above the champion with dramatic movement",
}


def build_pokemon_prompt(input_data: PokemonImageGenerationInput) -> str:
    base_prompt = _load_pokemon_prompt()
    pokemon = input_data.pokemon or [
        {"name": name, "position": position} for name, position in DEFAULT_POKEMON
    ]
    pokemon_lines = [
        f"- {item.name if hasattr(item, 'name') else item['name']} "
        f"{_position_prompt(item.position if hasattr(item, 'position') else item['position'])}"
        for item in pokemon
    ]

    return f"""{base_prompt}

VARIABLE OVERRIDES FOR THIS REQUEST:
- Uploaded reference image is authoritative for the trainer face, identity, skin tone, hair, facial structure, and likeness.
- Trainer name/title: {input_data.trainer_name or "Portugal"}.
- Composition format: {input_data.image_format}.
- Background: {input_data.background}.
- Outfit instruction: {_outfit_prompt(input_data.outfit)}.
- Insignias and tactical branding: {"enabled" if input_data.badges_enabled else "disabled"}.

SURROUNDING POKÉMON FOR THIS REQUEST:
{chr(10).join(pokemon_lines)}

Render a single polished final image. Do not include watermarks, UI chrome, or broken text artifacts."""


@lru_cache
def _load_pokemon_prompt() -> str:
    prompt_path = Path(__file__).resolve().parents[3] / "pokemon.md"
    return prompt_path.read_text(encoding="utf-8").strip()


def _outfit_prompt(outfit: PokemonOutfit) -> str:
    if outfit.mode == "photo":
        return "inherit the same clothing visible in the uploaded reference photo"

    accessories = []
    if outfit.hat.strip():
        accessories.append(outfit.hat.strip())
    if outfit.glasses.strip() and outfit.glasses.strip().lower() != "sem óculos":
        accessories.append(outfit.glasses.strip())

    accessory_prompt = f", accessories: {', '.join(accessories)}" if accessories else ""
    return (
        f"custom outfit with torso: {outfit.torso}, legs: {outfit.legs}, "
        f"shoes: {outfit.shoes}{accessory_prompt}"
    )


def _position_prompt(position: str) -> str:
    normalized = position.strip()
    return POSITION_PROMPTS.get(normalized, f"positioned {normalized}")
