export type Step = "dashboard" | "universe" | "settings" | "preview";

export type Universe =
  | "Kimetsu"
  | "Pokemon"
  | "Naruto"
  | "Digimon"
  | "Avatar, the Last Airbender";

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
