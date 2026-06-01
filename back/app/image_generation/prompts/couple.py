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
    return f"""Descreva os personagens da imagem , sua foto original, “(seu nome/personagem)”, em um estilo de coleção de esboços rabiscados e grosseiros. Sobre um fundo de papel branco bem claro, distribua pela página uma imagem de corpo inteiro, um grande close-up do rosto, um pequeno rabisco, um esboço rústico de corpo inteiro e uma versão chibi/deformada, de modo que a página consiga transmitir a atmosfera e a personalidade do personagem.

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
