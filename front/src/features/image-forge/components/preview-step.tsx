import { BadgeCheck, Check, Download, RefreshCcw, SlidersHorizontal, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

import { summarizePokemonList } from "../lib/pokemon-summary";
import type { Format, PokemonConfig, UniverseOption } from "../types";
import { MetaRow, PrimaryButton, StepIntro } from "./common";

export function PreviewStep({
  background,
  badgesEnabled,
  format,
  generationPrompt,
  pokemonConfig,
  selectedUniverse,
  onBackToSettings,
  onRegenerate,
}: {
  background: string;
  badgesEnabled: boolean;
  format: Format;
  generationPrompt: string;
  pokemonConfig: PokemonConfig;
  selectedUniverse: UniverseOption;
  onBackToSettings: () => void;
  onRegenerate: () => void;
}) {
  const isPokemon = selectedUniverse.name === "Pokemon";

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <StepIntro
        eyebrow="Finalizado"
        title="Imagem gerada"
        description="Revise o resultado, baixe a imagem ou volte para refinar as configurações."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="rounded-lg border border-[#2a2a2a] bg-[#101010] p-4">
          <div className="grid min-h-[520px] place-items-center rounded-lg border border-[#2a2a2a] p-6" style={{ background }}>
            <div className="aspect-square w-full max-w-[520px] rounded-lg border border-white/10 bg-black/30 p-5">
              <div className="flex h-full flex-col justify-between rounded-md border border-white/10 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.16),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.10),rgba(0,0,0,0.35))] p-6">
                <PreviewArtwork selectedUniverse={selectedUniverse} badgesEnabled={badgesEnabled} />
              </div>
            </div>
          </div>
        </div>

        <PreviewSummary
          background={background}
          badgesEnabled={badgesEnabled}
          format={format}
          generationPrompt={generationPrompt}
          isPokemon={isPokemon}
          pokemonConfig={pokemonConfig}
          selectedUniverse={selectedUniverse}
          onBackToSettings={onBackToSettings}
          onRegenerate={onRegenerate}
        />
      </div>
    </section>
  );
}

function PreviewArtwork({
  badgesEnabled,
  selectedUniverse,
}: {
  badgesEnabled: boolean;
  selectedUniverse: UniverseOption;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="rounded-md bg-black/40 px-3 py-1 text-xs font-semibold text-white/80">
          {selectedUniverse.label}
        </span>
        {badgesEnabled && (
          <span className="flex size-9 items-center justify-center rounded-full bg-white text-[#050505]">
            <BadgeCheck className="size-5" aria-hidden="true" />
          </span>
        )}
      </div>
      <div>
        <Sparkles className="mb-4 size-12 text-white/70" aria-hidden="true" />
        <h2 className="text-2xl font-semibold">Preview IA</h2>
        <p className="mt-2 text-sm text-white/65">Resultado simulado para validação do fluxo.</p>
      </div>
    </>
  );
}

function PreviewSummary({
  background,
  badgesEnabled,
  format,
  generationPrompt,
  isPokemon,
  pokemonConfig,
  selectedUniverse,
  onBackToSettings,
  onRegenerate,
}: {
  background: string;
  badgesEnabled: boolean;
  format: Format;
  generationPrompt: string;
  isPokemon: boolean;
  pokemonConfig: PokemonConfig;
  selectedUniverse: UniverseOption;
  onBackToSettings: () => void;
  onRegenerate: () => void;
}) {
  return (
    <aside className="h-fit rounded-lg border border-[#2a2a2a] bg-[#101010] p-5">
      <div className="mb-5 flex items-center gap-2 text-sm text-[#a3a3a3]">
        <Check className="size-4 text-[#f5f5f5]" aria-hidden="true" />
        Geração concluída
      </div>
      <dl className="space-y-3 text-sm">
        <MetaRow label="Universo" value={selectedUniverse.label} />
        {isPokemon && <MetaRow label="Título" value={pokemonConfig.title || "Portugal"} />}
        {isPokemon && <MetaRow label="Roupa" value={pokemonConfig.outfit} />}
        {isPokemon && <MetaRow label="Pokémon" value={summarizePokemonList(pokemonConfig.pokemon)} />}
        <MetaRow label="Formato" value={`${format} · 1024x1024`} />
        <MetaRow label="Cor de fundo" value={background} />
        <MetaRow label="Insígnias" value={badgesEnabled ? "Ativado" : "Desativado"} />
      </dl>

      {isPokemon && <PromptPreview generationPrompt={generationPrompt} />}

      <div className="mt-6 grid gap-3">
        <PrimaryButton onClick={() => undefined} full>
          <Download className="size-4" aria-hidden="true" />
          Baixar
        </PrimaryButton>
        <Button
          type="button"
          variant="outline"
          onClick={onRegenerate}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#2a2a2a] px-4 py-3 text-sm font-semibold transition hover:bg-[#181818]"
        >
          <RefreshCcw className="size-4" aria-hidden="true" />
          Gerar novamente
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onBackToSettings}
          className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-[#a3a3a3] transition hover:bg-[#181818] hover:text-[#f5f5f5]"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Editar configurações
        </Button>
      </div>
    </aside>
  );
}

function PromptPreview({ generationPrompt }: { generationPrompt: string }) {
  return (
    <div className="mt-6 rounded-lg border border-[#2a2a2a] bg-[#0c0c0c] p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a3a3a3]">
        Prompt Pokémon
      </p>
      <p className="mt-3 line-clamp-6 whitespace-pre-wrap text-xs leading-5 text-[#d6d6d6]">
        {generationPrompt}
      </p>
    </div>
  );
}
