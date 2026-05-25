import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";

import type { PokemonSummary } from "../../types";
import { PokemonOption } from "./pokemon-option";

export function PokemonSearch({
  error,
  loading,
  maxPokemon,
  options,
  pokemonCount,
  search,
  onAdd,
  onSearch,
}: {
  error: string | null;
  loading: boolean;
  maxPokemon: number;
  options: PokemonSummary[];
  pokemonCount: number;
  search: string;
  onAdd: (pokemon: PokemonSummary) => void;
  onSearch: (search: string) => void;
}) {
  return (
    <div className="mt-4 rounded-lg border border-[#2a2a2a] bg-[#0c0c0c] p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Buscar na PokeAPI, ex: pikachu, mewtwo..."
          className="h-10 border-[#2a2a2a] bg-[#101010] text-[#f5f5f5] placeholder:text-[#666] focus-visible:ring-[#f5f5f5]/30"
        />
        <div className="flex min-h-5 items-center text-xs text-[#a3a3a3] sm:min-w-24">
          {loading && (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              Buscando
            </span>
          )}
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-[#ffb4ab]">{error}</p>}

      {!error && options.length > 0 && (
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {options.map((pokemon) => (
            <PokemonOption
              key={pokemon.id}
              disabled={pokemonCount >= maxPokemon}
              pokemon={pokemon}
              onAdd={onAdd}
            />
          ))}
        </div>
      )}
    </div>
  );
}
