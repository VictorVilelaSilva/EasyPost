import { API_URL } from "../constants";
import type { Format, ImageGenerationResult, PokemonConfig } from "../types";

type GeneratePokemonImageInput = {
  background: string;
  badgesEnabled: boolean;
  format: Format;
  pokemonConfig: PokemonConfig;
  referenceImage: File;
};

export async function generatePokemonImage({
  background,
  badgesEnabled,
  format,
  pokemonConfig,
  referenceImage,
}: GeneratePokemonImageInput): Promise<ImageGenerationResult> {
  const formData = new FormData();
  const outfit = pokemonConfig.outfit.custom;

  formData.set("reference_image", referenceImage);
  formData.set("trainer_name", pokemonConfig.title || "Portugal");
  formData.set("background", background);
  formData.set("image_format", format);
  formData.set("badges_enabled", String(badgesEnabled));
  formData.set("outfit_mode", pokemonConfig.outfit.mode);
  formData.set("torso", outfit.torso);
  formData.set("legs", outfit.legs);
  formData.set("shoes", outfit.shoes);
  formData.set("hat", outfit.hat);
  formData.set("glasses", outfit.glasses);
  formData.set("pokemon", JSON.stringify(activePokemon(pokemonConfig.pokemon)));
  formData.set("size", imageSizeFromFormat(format));
  formData.set("quality", "high");
  formData.set("output_format", "png");

  const response = await fetch(`${API_URL}/image-generations/pokemon`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await responseErrorMessage(response));
  }

  return (await response.json()) as ImageGenerationResult;
}

function activePokemon(pokemon: PokemonConfig["pokemon"]) {
  return pokemon.filter((item) => item.name.trim() && item.position.trim());
}

function imageSizeFromFormat(format: Format) {
  if (format === "Retrato 3:4" || format === "Story 9:16") return "1024x1536";
  if (format === "Paisagem 4:3" || format === "Widescreen 16:9") return "1536x1024";
  return "1024x1024";
}

async function responseErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { detail?: unknown };
    if (typeof payload.detail === "string") return payload.detail;
  } catch {
    // Fall back to status text below.
  }

  return `Falha ao gerar imagem (${response.status})`;
}
