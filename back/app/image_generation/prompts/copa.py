from functools import lru_cache
from pathlib import Path

from app.image_generation.prompts.shared import final_instruction, generic_variables_block
from app.image_generation.schemas import PokemonOutfit


def build_prompt(
    *,
    universe_label: str,
    trainer_name: str,
    personal_characteristics: str,
    reference_image_notes: str,
    image_format: str,
    background: str,
    outfit: PokemonOutfit,
    copa_name: str,
    copa_birth_date: str,
    copa_height: str,
    copa_weight: str,
    copa_club: str,
) -> str:
    base_prompt = _load_copa_prompt()
    prompt = base_prompt.format(
        nome=copa_name.strip() or trainer_name or "Rezende",
        nascimento=copa_birth_date.strip() or "não informado",
        altura=_with_unit(copa_height, "m"),
        peso=_with_unit(copa_weight, "kg"),
        clube=copa_club.strip() or "não informado",
    )

    return f"""{prompt}

{generic_variables_block(
    universe_label=universe_label,
    trainer_name=trainer_name,
    personal_characteristics=personal_characteristics,
    reference_image_notes=reference_image_notes,
    image_format=image_format,
    background=background,
    outfit=outfit,
)}

{final_instruction()}"""


@lru_cache
def _load_copa_prompt() -> str:
    prompt_path = Path(__file__).resolve().parents[4] / "copa.md"
    return prompt_path.read_text(encoding="utf-8").strip()


def _with_unit(value: str, unit: str) -> str:
    value = value.strip()
    if not value:
        return "não informado"
    return value if value.lower().endswith(unit) else f"{value}{unit}"
