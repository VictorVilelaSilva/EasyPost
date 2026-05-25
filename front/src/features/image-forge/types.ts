export type Step = "dashboard" | "universe" | "settings" | "preview";

export type Universe =
  | "Kimetsu"
  | "Pokemon"
  | "Naruto"
  | "Digimon"
  | "Avatar, the Last Airbender";

export type PokemonOutfit =
  | "Jaqueta tática verde escura"
  | "Casaco preto campeão"
  | "Streetwear branco e preto"
  | "Uniforme futurista";

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
};

export type PokemonConfig = {
  title: string;
  outfit: PokemonOutfit;
  pokemon: PokemonPlacement[];
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
