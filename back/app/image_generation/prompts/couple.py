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
    return f"""Draw me as if an obsessed fan artist filled an entire sketchbook page - messy, overlapping, full-body poses, tiny chibi doodles, exaggerated expressions, and random close-ups of their hands or eyes.
White background. No grid, no order. Pure chaos energy.
With (color) aesthetic clothes

{generic_variables_block(
    universe_label=universe_label,
    trainer_name=trainer_name,
    personal_characteristics=personal_characteristics,
    reference_image_notes=reference_image_notes,
    image_format=image_format,
    background=background,
    outfit=outfit,
    include_background=False,
)}

{final_instruction()}"""
