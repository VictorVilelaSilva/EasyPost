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
    return f"""Yo como personaje jugable, ilustración estilo portada de GTA San Andreas, respetando el sexo, los rasgos faciales y la apariencia de la persona de la foto enviada como referencia principal.
Chaqueta bomber, camiseta urbana, jeans holgados, cadenas, gorra ladeada.
Actitud desafiante, brazos cruzados, fondo de ciudad con letreros de neón, palmeras, autos clásicos. 
Paleta de colores cálidos: naranja, morado, amarillo. 
Estilo arte digital de portada de juego de 2004, trazo limpio, sombras marcadas, vibe callejera. 
Sello "@briso_susan" integrado en un letrero de tienda del fondo. 
8K, ultra detallado, arte promocional de videojuego

{generic_variables_block(
    universe_label=universe_label,
    trainer_name=trainer_name,
    personal_characteristics="",
    reference_image_notes=reference_image_notes,
    image_format=image_format,
    background=background,
    outfit=outfit,
    include_personal_fallback=False,
)}

{final_instruction()}"""
