export type Step = "dashboard" | "universe" | "settings" | "preview";

export type Universe =
  | "Kimetsu"
  | "Pokemon"
  | "Naruto"
  | "Digimon"
  | "Avatar, the Last Airbender"
  | "Anime Geral"
  | "Bleach"
  | "Copa"
  | "Casal"
  | "LEGO"
  | "Monster High"
  | "Rick and Morty"
  | "San Andreas";

export type PromptTemplate =
  | "anime-general"
  | "avatar"
  | "bleach"
  | "copa"
  | "couple"
  | "lego"
  | "monster_high"
  | "pokemon"
  | "rick_morty"
  | "san_andreas";

export type OutfitMode = "photo" | "custom";

export type Format =
  | "Automático"
  | "Quadrado 1:1"
  | "Retrato 3:4"
  | "Story 9:16"
  | "Paisagem 4:3"
  | "Widescreen 16:9";

export type UniverseOption = {
  name: Universe;
  label: string;
  description: string;
  code: string;
  image: string;
  promptTemplate: PromptTemplate;
};

export type PokemonConfig = {
  title: string;
  outfit: PokemonOutfitConfig;
  pokemon: PokemonPlacement[];
};

export type PokemonOutfitConfig = {
  mode: OutfitMode;
  custom: CustomPokemonOutfit;
};

export type CustomPokemonOutfit = {
  torso: string;
  legs: string;
  shoes: string;
  hat: string;
  glasses: string;
};

export type PokemonPlacement = {
  name: string;
  position: string;
};

export type CoupleReferences = {
  face: File | null;
  bodies: File[];
};

export type PokemonSummary = {
  id: number;
  name: string;
  display_name: string;
  sprite_url: string | null;
  artwork_url: string | null;
  types: string[];
};

export type PokemonListResponse = {
  count: number;
  results: PokemonSummary[];
};

export type ImageGenerationResult = {
  image_base64: string;
  mime_type: string;
  model: string;
  size: string;
  output_format: string;
};
