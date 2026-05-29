from functools import lru_cache
from pathlib import Path

from app.image_generation.schemas import PokemonImageGenerationInput, PokemonOutfit


PROMPT_FILES = {
    "anime-general": "anime-general.md",
    "avatar": "avatar.md",
    "bleach": "bleach.md",
    "copa": "copa.md",
    "couple": "couple.md",
    "lego": "lego.md",
    "monster_high": "monster_high.md",
    "pokemon": "pokemon.md",
    "rick_morty": "rick_morty.md",
    "san_andreas": "san_andreas.md",
}

PT_BR_TEXT_RULE = (
    "REGRA OBRIGATÓRIA DE TEXTO NA IMAGEM: se a arte final tiver qualquer palavra, "
    "título, etiqueta, placa, ficha, selo, legenda, nome, estatística ou texto visível, "
    "escreva esse texto em português do Brasil, com grafia natural de PT-BR. "
    "Não use inglês, espanhol ou japonês em textos legíveis, exceto marcas ou nomes próprios."
)

PERSONAL_CHARACTERISTIC_TEMPLATES = {
    "anime-general",
    "avatar",
    "bleach",
    "couple",
    "monster_high",
    "rick_morty",
}


DEFAULT_POKEMON = [
    ("Mewtwo", "atrás do treinador"),
    ("Quilava", "ao lado dele"),
    ("Pichu", "na parte inferior"),
    ("Eevee", "no ombro"),
    ("Ledian", "no primeiro plano"),
]

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


def build_pokemon_prompt(input_data: PokemonImageGenerationInput) -> str:
    base_prompt = _load_prompt_template(input_data.prompt_template)
    if input_data.prompt_template != "pokemon":
        return _build_generic_prompt(input_data, base_prompt)

    pokemon = input_data.pokemon or [
        {"name": name, "position": position} for name, position in DEFAULT_POKEMON
    ]
    pokemon_lines = [
        f"- {item.name if hasattr(item, 'name') else item['name']} "
        f"{_position_prompt(item.position if hasattr(item, 'position') else item['position'])}"
        for item in pokemon
    ]

    return f"""{base_prompt}

VARIABLE OVERRIDES FOR THIS REQUEST:
- Uploaded reference image is authoritative for the trainer face, identity, skin tone, hair, facial structure, and likeness.
- Trainer name/title: {input_data.trainer_name or "Portugal"}.
- Composition format: {input_data.image_format}.
- Background: {input_data.background}.
- Outfit instruction: {_outfit_prompt(input_data.outfit)}.
- Insignias and tactical branding: {"enabled" if input_data.badges_enabled else "disabled"}.

SURROUNDING POKÉMON FOR THIS REQUEST:
{chr(10).join(pokemon_lines)}

{PT_BR_TEXT_RULE}

Render a single polished final image. Do not include watermarks, UI chrome, or broken text artifacts."""


@lru_cache
def _load_prompt_template(template: str) -> str:
    prompt_path = Path(__file__).resolve().parents[3] / PROMPT_FILES[template]
    return prompt_path.read_text(encoding="utf-8").strip()


def _build_generic_prompt(input_data: PokemonImageGenerationInput, base_prompt: str) -> str:
    personal_line = _personal_characteristics_prompt(input_data)
    reference_line = _reference_image_notes_prompt(input_data)

    return f"""{base_prompt}

VARIÁVEIS DESTA GERAÇÃO:
- A imagem enviada pelo usuário é a referência principal para rosto, identidade, pele, cabelo, estrutura facial e semelhança.
{reference_line}
- Nome/título do personagem, quando o template pedir: {input_data.trainer_name or "Portugal"}.
{personal_line}
- Formato de composição: {input_data.image_format}.
- Fundo/cor/direção visual escolhida: {input_data.background}.
- Roupa: {_outfit_prompt(input_data.outfit)}.

{PT_BR_TEXT_RULE}

Gere uma única imagem final polida. Não inclua marcas d'água, interface de aplicativo, texto quebrado ou caracteres sem sentido."""


def _personal_characteristics_prompt(input_data: PokemonImageGenerationInput) -> str:
    if input_data.prompt_template not in PERSONAL_CHARACTERISTIC_TEMPLATES:
        return ""

    personal_characteristics = input_data.personal_characteristics.strip()
    if personal_characteristics:
        return f"- Características pessoais informadas pelo usuário: {personal_characteristics}."

    return "- Características pessoais informadas pelo usuário: não informado; inferir apenas da imagem."


def _reference_image_notes_prompt(input_data: PokemonImageGenerationInput) -> str:
    notes = input_data.reference_image_notes.strip()
    return f"- Referências enviadas: {notes}." if notes else ""


def _outfit_prompt(outfit: PokemonOutfit) -> str:
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


def _position_prompt(position: str) -> str:
    normalized = position.strip()
    return POSITION_PROMPTS.get(normalized, f"positioned {normalized}")
