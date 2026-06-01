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
    return f"""Crie uma figurinha esportiva personalizada inspirada em álbum de copa, usando a foto enviada como referência principal da pessoa. Mantenha a estética colecionável da figurinha, com nome, dados fictícios, brasão, uniforme, número da camisa e elementos gráficos coerentes com o resumo pessoal informado.
Quando o usuário informar um nome ou título, use "{trainer_name or "Rezende"}" como nome principal da figurinha. Use o universo/estilo "{universe_label}" como direção visual.

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
