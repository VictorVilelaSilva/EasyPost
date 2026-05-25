import { defaultPokemonList } from "../constants";
import type { Format, PokemonConfig, PokemonOutfit } from "../types";

const backgroundPromptMap: Record<string, string> = {
  "#050505": "near-black premium studio background",
  "#15151A": "charcoal editorial background",
  "#1A1A2E": "dark navy background",
  "#222222": "dark graphite background",
  "#F5F5F5": "minimal white background",
  "#E8E2D8": "clean cream-colored background",
  "#7C2D12": "deep warm copper background",
  "#14532D": "dark green background",
  "#1E3A8A": "deep blue background",
  "#581C87": "dark purple background",
  "#BE123C": "deep rose background",
  "#CA8A04": "muted golden background",
};

const formatPromptMap: Record<Format, string> = {
  Automático: "automatic composition based on the image generation model",
  "Quadrado 1:1": "square 1:1 poster composition",
  "Retrato 3:4": "portrait 3:4 poster composition",
  "Story 9:16": "vertical story 9:16 poster composition",
  "Paisagem 4:3": "landscape 4:3 poster composition",
  "Widescreen 16:9": "widescreen 16:9 cinematic composition",
};

export function buildPokemonPrompt({
  background,
  badgesEnabled,
  config,
  format,
}: {
  background: string;
  badgesEnabled: boolean;
  config: PokemonConfig;
  format: Format;
}) {
  const pokemonList = config.pokemon.filter((item) => item.name.trim() && item.position.trim());
  const surroundingPokemon = pokemonList.length > 0 ? pokemonList : defaultPokemonList;
  const backgroundDescription =
    backgroundPromptMap[background.toUpperCase()] ?? `${background} custom background`;
  const title = config.title.trim() || "Portugal";
  const insigniaPrompt = badgesEnabled
    ? "champion insignia patches, tactical UI symbols, magazine-cover inspired branding"
    : "no insignia patches, no tactical UI symbols, minimal clean branding";

  return `Create an ultra-detailed cinematic Pokémon poster featuring a young male Pokémon Champion standing confidently in side profile while holding a Poké Ball. The champion is based on the uploaded photo and must keep the same facial features, skin tone, hairstyle, facial structure, smile, eye shape, and overall likeness.

Style combines: semi-realistic anime painting, cinematic game poster, modern Pokémon concept art, painterly brush strokes, soft polygonal shading, highly detailed character illustration, premium trading-card aesthetic, Japanese game magazine cover design.

COMPOSITION: ${formatPromptMap[format]}, centered champion pose, ${backgroundDescription}, minimalist editorial layout.

The trainer wears ${getPokemonOutfitPrompt(config.outfit)}, metallic accessories, and ${insigniaPrompt}.

SURROUNDING POKÉMON:
${surroundingPokemon.map((pokemon) => `- ${pokemon.name.trim()} ${pokemonPositionPrompt(pokemon.position)}`).join("\n")}

LIGHTING: Soft cinematic studio lighting, warm highlights on skin, subtle rim light, volumetric atmosphere, realistic shadows, polished illustration rendering, dramatic contrast, premium movie-poster mood.

DETAILS: high detail skin texture, painterly strokes, dynamic depth, layered composition, realistic fabric folds, glossy eyes, subtle reflections, clean typography placement, esports championship vibe, modern anime realism, masterpiece quality, ultra-sharp focus.

TEXT ELEMENTS: Pokémon logo with black line and transparent fill, "${title}" large bold title on the upper left, minimalist Japanese subtitle text, clean branding aesthetics.

COLOR PALETTE: ${backgroundDescription}, black outfit details, purple neon accents, teal highlights, soft cinematic tones, balanced contrast.

QUALITY TAGS: masterpiece, best quality, ultra detailed, cinematic composition, trending on ArtStation, AAA game concept art, 8k, sharp focus, dramatic illustration, highly detailed painting. Face and body exactly same as uploaded image.

NEGATIVE PROMPT: low quality, blurry face, extra limbs, bad anatomy, deformed hands, duplicate Pokémon, messy composition, overexposed lighting, flat colors, distorted eyes, poorly drawn face, text artifacts, watermark, cropped body, unrealistic proportions.`;
}

function getPokemonOutfitPrompt(outfit: PokemonOutfit) {
  const outfitMap: Record<PokemonOutfit, string> = {
    "Jaqueta tática verde escura":
      "a futuristic dark green tactical jacket with subtle white accents, utility straps, and modern streetwear-inspired Pokémon trainer fashion",
    "Casaco preto campeão":
      "a sleek black champion coat with subtle white accents, premium tactical seams, and modern Pokémon trainer fashion",
    "Streetwear branco e preto":
      "a black and white streetwear outfit with layered technical fabrics, utility straps, and premium trainer details",
    "Uniforme futurista":
      "a futuristic champion uniform with technical panels, metallic accessories, and high-end Pokémon trainer silhouettes",
  };

  return outfitMap[outfit];
}

function pokemonPositionPrompt(position: string) {
  const normalized = position.trim();
  const positionMap: Record<string, string> = {
    "atrás do treinador": "flying behind the trainer with cinematic presence",
    "ao lado dele": "standing powerfully beside him",
    "na parte inferior": "near the lower side with intense glowing eyes",
    "no ombro": "sitting on his shoulder",
    "no primeiro plano": "near the foreground with expressive energy",
    "no canto inferior": "positioned elegantly near the bottom corner",
    "no centro inferior": "in the middle at the bottom",
    "voando acima": "flying above the champion with dramatic movement",
  };

  return positionMap[normalized] ?? `positioned ${normalized}`;
}
