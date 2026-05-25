import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

import { usePokemonSearch } from "../../hooks/use-pokemon-search";
import type { PokemonSummary } from "../../types";
import { PokemonSearch } from "./pokemon-search";

export function PokemonSelectModal({
  open,
  selectedCount,
  onClose,
  onSelect,
}: {
  open: boolean;
  selectedCount: number;
  onClose: () => void;
  onSelect: (pokemon: PokemonSummary) => void;
}) {
  const { error, loading, options, search, setSearch } = usePokemonSearch(open);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pokemon-select-title"
        className="flex max-h-[min(760px,calc(100vh-3rem))] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#101010]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#2a2a2a] p-4 sm:p-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a3a3a3]">
              Biblioteca PokéAPI
            </p>
            <h2 id="pokemon-select-title" className="mt-2 text-xl font-semibold">
              Selecionar Pokémon
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#a3a3a3]">
              Busque e escolha o Pokémon que vai ocupar este slot da composição.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shrink-0 text-[#a3a3a3] hover:bg-[#181818] hover:text-[#f5f5f5]"
            aria-label="Fechar modal"
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="min-h-0 overflow-y-auto p-4 sm:p-5">
          <PokemonSearch
            error={error}
            loading={loading}
            options={options}
            maxPokemon={selectedCount + 1}
            pokemonCount={selectedCount}
            search={search}
            onAdd={onSelect}
            onSearch={setSearch}
          />
        </div>
      </div>
    </div>
  );
}
