import { auth } from "@/lib/firebase";

import { API_URL } from "../constants";
import type {
  CopaConfig,
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
  copaConfig: CopaConfig;
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
  copaConfig,
  format,
  personalCharacteristics,
  pokemonConfig,
  promptTemplate,
  referenceImage,
  universeLabel,
}: GenerateImageInput): Promise<ImageGenerationResult> {
  const formData = new FormData();
  const outfit = pokemonConfig.outfit.custom;
  const effectiveFormat = promptTemplate === "copa" ? "Retrato 3:4" : format;

  appendReferenceImages(formData, promptTemplate, referenceImage, coupleReferences);
  formData.set("prompt_template", promptTemplate);
  formData.set("universe_label", universeLabel);
  formData.set("trainer_name", pokemonConfig.title || "Portugal");
  formData.set("background", background);
  formData.set("image_format", effectiveFormat);
  formData.set("personal_characteristics", personalCharacteristics.trim());
  appendCopaFields(formData, copaConfig);
  formData.set("badges_enabled", String(badgesEnabled));
  formData.set("outfit_mode", pokemonConfig.outfit.mode);
  formData.set("torso", outfit.torso);
  formData.set("legs", outfit.legs);
  formData.set("shoes", outfit.shoes);
  formData.set("hat", outfit.hat);
  formData.set("glasses", outfit.glasses);
  formData.set("pokemon", JSON.stringify(activePokemon(pokemonConfig.pokemon)));
  formData.set("size", imageSizeFromFormat(effectiveFormat));
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

function appendCopaFields(formData: FormData, config: CopaConfig) {
  formData.set("copa_name", config.name.trim());
  formData.set("copa_birth_date", config.birthDate.trim());
  formData.set("copa_height", config.height.trim());
  formData.set("copa_weight", config.weight.trim());
  formData.set("copa_club", config.club.trim());
}

function appendReferenceImages(
  formData: FormData,
  promptTemplate: PromptTemplate,
  referenceImage: File | null,
  coupleReferences: CoupleReferences,
) {
  if (promptTemplate === "couple") {
    coupleReferences.images.slice(0, 3).forEach((file) => {
      formData.append("reference_images", file);
    });
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
