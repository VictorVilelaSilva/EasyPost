import { auth } from "@/lib/firebase";

import { API_URL } from "../constants";
import type {
  CoupleReferences,
  Format,
  ImageGenerationResult,
  PokemonConfig,
  PromptTemplate,
} from "../types";

type GenerateImageInput = {
  background: string;
  badgesEnabled: boolean;
  coupleReferences: CoupleReferences;
  format: Format;
  personalCharacteristics: string;
  pokemonConfig: PokemonConfig;
  promptTemplate: PromptTemplate;
  referenceImage: File | null;
  universeLabel: string;
};

export async function generateImage({
  background,
  badgesEnabled,
  coupleReferences,
  format,
  personalCharacteristics,
  pokemonConfig,
  promptTemplate,
  referenceImage,
  universeLabel,
}: GenerateImageInput): Promise<ImageGenerationResult> {
  const formData = new FormData();
  const outfit = pokemonConfig.outfit.custom;

  appendReferenceImages(formData, promptTemplate, referenceImage, coupleReferences);
  formData.set("prompt_template", promptTemplate);
  formData.set("universe_label", universeLabel);
  formData.set("trainer_name", pokemonConfig.title || "Portugal");
  formData.set("background", background);
  formData.set("image_format", format);
  formData.set("personal_characteristics", personalCharacteristics.trim());
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

  const token = await auth.currentUser?.getIdToken(true);
  if (!token) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  const response = await fetch(`${API_URL}/image-generations/prompt`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
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

function appendReferenceImages(
  formData: FormData,
  promptTemplate: PromptTemplate,
  referenceImage: File | null,
  coupleReferences: CoupleReferences,
) {
  if (promptTemplate === "couple") {
    if (coupleReferences.face) formData.set("face_image", coupleReferences.face);
    coupleReferences.bodies.slice(0, 2).forEach((file) => formData.append("body_images", file));
    return;
  }

  if (referenceImage) formData.set("reference_image", referenceImage);
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
