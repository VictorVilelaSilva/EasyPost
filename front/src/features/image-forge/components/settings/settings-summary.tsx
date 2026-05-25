import { Sparkles } from "lucide-react";

import { summarizePokemonList } from "../../lib/pokemon-summary";
import type { Format, PokemonConfig, UniverseOption } from "../../types";
import { MetaRow, StepActions } from "../common";

export function SettingsSummary({
  background,
  badgesEnabled,
  format,
  isPokemon,
  pokemonConfig,
  selectedUniverse,
  onBack,
  onGenerate,
}: {
  background: string;
  badgesEnabled: boolean;
  format: Format;
  isPokemon: boolean;
  pokemonConfig: PokemonConfig;
  selectedUniverse: UniverseOption;
  onBack: () => void;
  onGenerate: () => void;
}) {
  return (
    <aside className="h-fit rounded-lg border border-[#2a2a2a] bg-[#101010] p-5">
      <h2 className="text-base font-semibold">Resumo</h2>
      <div className="mt-5 aspect-square rounded-lg border border-[#2a2a2a] p-4" style={{ background }}>
        <div className="flex h-full flex-col justify-between rounded-md border border-white/10 bg-black/20 p-4">
          <span className="text-xs font-semibold text-white/70">{selectedUniverse.code}</span>
          <Sparkles className="size-8 text-white/70" aria-hidden="true" />
        </div>
      </div>
      <dl className="mt-5 space-y-3 text-sm">
        <MetaRow label="Universo" value={selectedUniverse.label} />
        {isPokemon && <MetaRow label="Título" value={pokemonConfig.title || "Portugal"} />}
        {isPokemon && <MetaRow label="Roupa" value={pokemonConfig.outfit} />}
        {isPokemon && <MetaRow label="Pokémon" value={summarizePokemonList(pokemonConfig.pokemon)} />}
        <MetaRow label="Formato" value={format} />
        <MetaRow label="Fundo" value={background} />
        <MetaRow label="Insígnias" value={badgesEnabled ? "Ativado" : "Desativado"} />
      </dl>
      <StepActions onBack={onBack} onNext={onGenerate} nextLabel="Gerar imagem" compact />
    </aside>
  );
}
