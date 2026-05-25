import type { PokemonOutfitConfig } from "../types";

export function summarizeOutfit(outfit: PokemonOutfitConfig) {
  if (outfit.mode === "photo") return "Herdar da foto";

  return [
    outfit.custom.torso,
    outfit.custom.legs,
    outfit.custom.shoes,
    outfit.custom.hat || null,
    outfit.custom.glasses === "Sem óculos" ? null : outfit.custom.glasses,
  ]
    .filter(Boolean)
    .join(" · ");
}
