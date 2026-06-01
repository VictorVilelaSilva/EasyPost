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
    return f"""Transforma a imagem num universo LEGO, mantendo a composição original e os elementos principais reconhecíveis. Reimagina todas as pessoas, objetos e cenários como minifiguras e peças LEGO detalhadas, com textura plástica realista, cores vibrantes e iluminação cinematográfica suave. Mantém a atmosfera divertida, acolhedora e expressiva da foto original, com um estilo criativo e encantador típico de um filme LEGO.

Preserva as poses, emoções e enquadramento da imagem, adaptando tudo para um cenário construído em blocos LEGO.

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
