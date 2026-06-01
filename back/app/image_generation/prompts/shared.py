from app.image_generation.schemas import PokemonOutfit


PT_BR_TEXT_RULE = (
    "REGRA OBRIGATÓRIA DE TEXTO NA IMAGEM: se a arte final tiver qualquer palavra, "
    "título, etiqueta, placa, ficha, selo, legenda, nome, estatística ou texto visível, "
    "escreva esse texto em português do Brasil, com grafia natural de PT-BR. "
    "Não use inglês, espanhol ou japonês em textos legíveis, exceto marcas ou nomes próprios."
)


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


def generic_variables_block(
    *,
    universe_label: str,
    trainer_name: str,
    personal_characteristics: str,
    reference_image_notes: str,
    image_format: str,
    background: str,
    outfit: PokemonOutfit,
    include_personal_fallback: bool = True,
    include_background: bool = True,
) -> str:
    reference_line = (
        f"- Referências enviadas: {reference_image_notes.strip()}."
        if reference_image_notes.strip()
        else ""
    )
    personal_line = personal_characteristics_line(
        personal_characteristics=personal_characteristics,
        include_fallback=include_personal_fallback,
    )
    background_line = (
        f"- Fundo/cor/direção visual escolhida: {background}."
        if include_background
        else ""
    )

    return f"""VARIÁVEIS DESTA GERAÇÃO:
- A imagem enviada pelo usuário é a referência principal para rosto, identidade, pele, cabelo, estrutura facial e semelhança.
{reference_line}
- Universo/estilo escolhido: {universe_label}.
- Nome/título do personagem, quando o template pedir: {trainer_name or "Portugal"}.
{personal_line}
- Formato de composição: {image_format}.
{background_line}
- Roupa: {outfit_prompt(outfit)}."""


def personal_characteristics_line(
    *, personal_characteristics: str, include_fallback: bool
) -> str:
    personal_characteristics = personal_characteristics.strip()
    if personal_characteristics:
        return f"- Resumo pessoal informado pelo usuário: {personal_characteristics}."
    if include_fallback:
        return "- Resumo pessoal informado pelo usuário: não informado; inferir apenas da imagem."
    return ""


def final_instruction() -> str:
    return (
        f"{PT_BR_TEXT_RULE}\n\n"
        "Gere uma única imagem final polida. Não inclua marcas d'água, interface de "
        "aplicativo, texto quebrado ou caracteres sem sentido."
    )


def outfit_prompt(outfit: PokemonOutfit) -> str:
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


def position_prompt(position: str) -> str:
    normalized = position.strip()
    return POSITION_PROMPTS.get(normalized, f"positioned {normalized}")
