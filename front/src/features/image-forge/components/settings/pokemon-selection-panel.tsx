import { BadgeCheck, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import type { PokemonConfig, PokemonSummary } from "../../types";
import { Panel, SectionTitle } from "../common";
import { PokemonPositionSelect } from "./pokemon-position-select";
import { PokemonSelectModal } from "./pokemon-select-modal";

const MAX_POKEMON_SELECTION = 5;

export function PokemonSelectionPanel({
  pokemonConfig,
  onPokemonConfigChange,
}: {
  pokemonConfig: PokemonConfig;
  onPokemonConfigChange: (config: PokemonConfig) => void;
}) {
  const [selectingIndex, setSelectingIndex] = useState<number | null>(null);

  function updatePokemon(index: number, patch: Partial<PokemonConfig["pokemon"][number]>) {
    onPokemonConfigChange({
      ...pokemonConfig,
      pokemon: pokemonConfig.pokemon.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    });
  }

  function addPokemonSlot() {
    if (pokemonConfig.pokemon.length >= MAX_POKEMON_SELECTION) return;

    onPokemonConfigChange({
      ...pokemonConfig,
      pokemon: [...pokemonConfig.pokemon, { name: "", position: "" }],
    });
  }

  function selectPokemon(pokemon: PokemonSummary) {
    if (selectingIndex === null) return;

    updatePokemon(selectingIndex, { name: pokemon.display_name });
    setSelectingIndex(null);
  }

  return (
    <Panel>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionTitle icon={BadgeCheck} title="Escolha seus Pokémon" />
        <Button
          type="button"
          variant="outline"
          onClick={addPokemonSlot}
          disabled={pokemonConfig.pokemon.length >= MAX_POKEMON_SELECTION}
          className="w-full border-[#2a2a2a] bg-[#101010] text-[#f5f5f5] hover:bg-[#181818] sm:w-fit"
        >
          <Plus className="size-4" aria-hidden="true" />
          Adicionar
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {pokemonConfig.pokemon.length === 0 && (
          <div className="rounded-lg border border-dashed border-[#2a2a2a] bg-[#0c0c0c] px-4 py-5 text-sm text-[#a3a3a3]">
            Nenhum Pokémon selecionado ainda.
          </div>
        )}

        {pokemonConfig.pokemon.map((pokemon, index) => (
          <div key={index} className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_220px_40px]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectingIndex(index)}
              className="h-10 min-w-0 justify-between border-[#2a2a2a] bg-[#0c0c0c] px-3 text-left text-[#f5f5f5] hover:bg-[#181818]"
            >
              <span className="min-w-0 truncate">
                {pokemon.name || "Selecionar Pokémon"}
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 text-xs text-[#a3a3a3]">
                {pokemon.name ? "Trocar" : "Selecionar"}
                <ChevronRight className="size-3.5" aria-hidden="true" />
              </span>
            </Button>
            <PokemonPositionSelect
              index={index}
              pokemonConfig={pokemonConfig}
              value={pokemon.position}
              onChange={(position) => updatePokemon(index, { position })}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() =>
                onPokemonConfigChange({
                  ...pokemonConfig,
                  pokemon: pokemonConfig.pokemon.filter((_, itemIndex) => itemIndex !== index),
                })
              }
              className="h-10 w-full shrink-0 text-[#a3a3a3] hover:bg-[#181818] hover:text-[#f5f5f5] sm:w-10"
              aria-label={`Remover Pokémon ${index + 1}`}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-[#a3a3a3]">
        Adicione um slot, selecione o Pokémon pela modal e defina onde ele ficará.
      </p>
      <PokemonSelectModal
        open={selectingIndex !== null}
        selectedCount={pokemonConfig.pokemon.length}
        onClose={() => setSelectingIndex(null)}
        onSelect={selectPokemon}
      />
    </Panel>
  );
}
