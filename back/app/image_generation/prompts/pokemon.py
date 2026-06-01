from app.image_generation.prompts.shared import (
    PT_BR_TEXT_RULE,
    outfit_prompt,
    position_prompt,
)
from app.image_generation.schemas import PokemonOutfit, PokemonPlacement


DEFAULT_POKEMON = [
    ("Mewtwo", "atrás do treinador"),
    ("Quilava", "ao lado dele"),
    ("Pichu", "na parte inferior"),
    ("Eevee", "no ombro"),
    ("Ledian", "no primeiro plano"),
]


def build_prompt(
    *,
    trainer_name: str,
    background: str,
    image_format: str,
    badges_enabled: bool,
    outfit: PokemonOutfit,
    pokemon: list[PokemonPlacement],
) -> str:
    pokemon_items = pokemon or [
        PokemonPlacement(name=name, position=position)
        for name, position in DEFAULT_POKEMON
    ]
    pokemon_lines = [
        f"- {item.name} {position_prompt(item.position)}" for item in pokemon_items
    ]

    return f"""Create an ultra-detailed cinematic Pokémon poster featuring a young male Pokémon Champion standing confidently in side profile while holding a Poké Ball. young man a 33-year-old whose facial features, skin tone, and hairstyle closely match the uploaded photo. Maintain strong likeness to the reference image: same facial structure, smile, eye shape, hairstyle, and overall

Style combines: semi-realistic anime painting, cinematic game poster, modern Pokémon concept art, painterly brush strokes, soft polygonal shading, highly detailed character illustration, premium trading-card aesthetic, Japanese game magazine cover design.

COMPOSITION: Vertical poster composition, centered champion pose, clean cream-colored background with minimalist editorial layout.

LIGHTING: Soft cinematic studio lighting, warm highlights on skin, subtle rim light, volumetric atmosphere, realistic shadows, polished illustration rendering, dramatic contrast, premium movie-poster mood.

DETAILS: high detail skin texture, painterly strokes, dynamic depth, layered composition, realistic fabric folds, glossy eyes, subtle reflections, clean typography placement, esports championship vibe, modern anime realism, masterpiece quality, ultra-sharp focus.

VARIABLE OVERRIDES FOR THIS REQUEST:
- Uploaded reference image is authoritative for the trainer face, identity, skin tone, hair, facial structure, and likeness.
- Trainer name/title: {trainer_name or "Portugal"}.
- Composition format: {image_format}.
- Background: {background}.
- Outfit instruction: {outfit_prompt(outfit)}.
- Insignias and tactical branding: {"enabled" if badges_enabled else "disabled"}.

SURROUNDING POKÉMON FOR THIS REQUEST:
{chr(10).join(pokemon_lines)}

{PT_BR_TEXT_RULE}

Render a single polished final image. Do not include watermarks, UI chrome, or broken text artifacts."""
