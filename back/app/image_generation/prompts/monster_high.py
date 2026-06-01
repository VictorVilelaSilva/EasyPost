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
    return f"""Com base no resumo pessoal informado pelo usuário e na foto enviada, defina qual monstro a pessoa seria em um universo fashion inspirado em Monster High / Ever After High. Crie um pôster com características detalhadas, ilustração, pet e acessórios, usando o nome "{trainer_name or "do personagem"}" quando fizer sentido.
Não faça como uma ficha de referência de personagem organizada e limpa, mas sim como uma anotação rabiscada cheia de informações, desenhada livremente por um ilustrador e constantemente sobreposta. Use linhas grossas, simples e levemente bagunçadas, com sensação de desenho manual. Adicione ilustrações rústicas em estilo anime, cores vivas com contrastes claros, rabiscos aleatórios ou pequenos, paletas de cores suaves e expressões fofas deformadas posicionadas naturalmente entre as imagens.

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
