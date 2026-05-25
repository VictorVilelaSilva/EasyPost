import { BadgeCheck, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { usePokemonSearch } from "../../hooks/use-pokemon-search";
import type { PokemonConfig, PokemonSummary } from "../../types";
import { Panel, SectionTitle } from "../common";
import { PokemonPositionSelect } from "./pokemon-position-select";
import { PokemonSearch } from "./pokemon-search";

export function PokemonSelectionPanel({
  pokemonConfig,
  onPokemonConfigChange,
}: {
  pokemonConfig: PokemonConfig;
  onPokemonConfigChange: (config: PokemonConfig) => void;
}) {
  const { error, loading, options, search, setSearch } = usePokemonSearch(true);

  function updatePokemon(index: number, patch: Partial<PokemonConfig["pokemon"][number]>) {
    onPokemonConfigChange({
      ...pokemonConfig,
      pokemon: pokemonConfig.pokemon.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    });
  }

  function addPokemonFromApi(pokemon: PokemonSummary) {
    if (pokemonConfig.pokemon.length >= 7) return;
    onPokemonConfigChange({
      ...pokemonConfig,
      pokemon: [...pokemonConfig.pokemon, { name: pokemon.display_name, position: "" }],
    });
  }

  return (
    <Panel>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionTitle icon={BadgeCheck} title="Pokémon ao redor" />
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            pokemonConfig.pokemon.length < 7 &&
            onPokemonConfigChange({
              ...pokemonConfig,
              pokemon: [...pokemonConfig.pokemon, { name: "", position: "" }],
            })
          }
          disabled={pokemonConfig.pokemon.length >= 7}
          className="w-fit border-[#2a2a2a] bg-[#101010] text-[#f5f5f5] hover:bg-[#181818]"
        >
          <Plus className="size-4" aria-hidden="true" />
          Adicionar
        </Button>
      </div>

      <PokemonSearch
        error={error}
        loading={loading}
        options={options}
        pokemonCount={pokemonConfig.pokemon.length}
        search={search}
        onAdd={addPokemonFromApi}
        onSearch={setSearch}
      />

      <div className="mt-4 space-y-3">
        {pokemonConfig.pokemon.length === 0 && (
          <div className="rounded-lg border border-dashed border-[#2a2a2a] bg-[#0c0c0c] px-4 py-5 text-sm text-[#a3a3a3]">
            Nenhum Pokémon selecionado ainda.
          </div>
        )}

        {pokemonConfig.pokemon.map((pokemon, index) => (
          <div key={index} className="grid gap-2 md:grid-cols-[minmax(0,1fr)_220px_32px]">
            <Input
              value={pokemon.name}
              onChange={(event) => updatePokemon(index, { name: event.target.value })}
              placeholder="Pokémon"
              className="h-10 border-[#2a2a2a] bg-[#0c0c0c] text-[#f5f5f5] placeholder:text-[#666] focus-visible:ring-[#f5f5f5]/30"
            />
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
              className="shrink-0 text-[#a3a3a3] hover:bg-[#181818] hover:text-[#f5f5f5]"
              aria-label={`Remover Pokémon ${index + 1}`}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-[#a3a3a3]">
        Escolha o Pokémon e diga só onde ele ficará. O prompt final monta a descrição completa.
      </p>
    </Panel>
  );
}
