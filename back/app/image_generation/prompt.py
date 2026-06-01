from app.image_generation.prompts import PROMPT_BUILDERS
from app.image_generation.schemas import PokemonImageGenerationInput


def build_pokemon_prompt(input_data: PokemonImageGenerationInput) -> str:
    builder = PROMPT_BUILDERS[input_data.prompt_template]

    if input_data.prompt_template == "pokemon":
        return builder(
            trainer_name=input_data.trainer_name,
            background=input_data.background,
            image_format=input_data.image_format,
            badges_enabled=input_data.badges_enabled,
            outfit=input_data.outfit,
            pokemon=input_data.pokemon,
        )

    return builder(
        universe_label=_universe_label(input_data),
        trainer_name=input_data.trainer_name,
        personal_characteristics=input_data.personal_characteristics,
        reference_image_notes=input_data.reference_image_notes,
        image_format=input_data.image_format,
        background=input_data.background,
        outfit=input_data.outfit,
    )


def _universe_label(input_data: PokemonImageGenerationInput) -> str:
    if input_data.universe_label.strip():
        return input_data.universe_label.strip()
    return input_data.prompt_template.replace("_", " ")
