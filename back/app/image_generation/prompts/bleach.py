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
) -> str:
    return f"""Create an original character sheet in the universe of "Bleach" based on the appearance, energy and personality of the person in the photo sent. Turn the person into a character fully integrated into the world of Bleach, as if it were an official part of the animation.
The art should have a premium poster/concept art format divided into several panels, reminiscent of character guide pages or official artbook.

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
