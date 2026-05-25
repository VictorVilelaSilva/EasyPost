import type { PokemonPlacement } from "../types";

export function summarizePokemonList(pokemon: PokemonPlacement[]) {
  const activePokemon = pokemon.map((item) => item.name.trim()).filter(Boolean);

  if (activePokemon.length === 0) return "Padrão";
  if (activePokemon.length <= 2) return activePokemon.join(", ");

  return `${activePokemon.slice(0, 2).join(", ")} +${activePokemon.length - 2}`;
}
