import { Check, Download, Loader2, RefreshCcw, SlidersHorizontal, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

import { summarizeOutfit } from "../../lib/outfit-summary";
import { summarizePokemonList } from "../../lib/pokemon-summary";
import type { Format, ImageGenerationResult, PokemonConfig, UniverseOption } from "../../types";
import { MetaRow, PrimaryButton } from "../common";

export function PreviewSummary({
  background,
  badgesEnabled,
  format,
  generationError,
  generationLoading,
  generationResult,
  isPokemon,
  pokemonConfig,
  selectedUniverse,
  onBackToSettings,
  onRegenerate,
}: {
  background: string;
  badgesEnabled: boolean;
  format: Format;
  generationError: string | null;
  generationLoading: boolean;
  generationResult: ImageGenerationResult | null;
  isPokemon: boolean;
  pokemonConfig: PokemonConfig;
  selectedUniverse: UniverseOption;
  onBackToSettings: () => void;
  onRegenerate: () => void;
}) {
  return (
    <aside className="h-fit min-w-0 rounded-lg border border-[#2a2a2a] bg-[#101010] p-4 sm:p-5 xl:sticky xl:top-20">
      <GenerationStatus error={generationError} loading={generationLoading} />
      <dl className="rounded-lg border border-[#2a2a2a] bg-[#0c0c0c] px-3 text-sm">
        <MetaRow label="Universo" value={selectedUniverse.label} />
        {isPokemon && <MetaRow label="Título" value={pokemonConfig.title || "Portugal"} />}
        {isPokemon && <MetaRow label="Roupa" value={summarizeOutfit(pokemonConfig.outfit)} />}
        {isPokemon && <MetaRow label="Pokémon" value={summarizePokemonList(pokemonConfig.pokemon)} />}
        <MetaRow label="Formato" value={`${format} · ${generationResult?.size ?? "1024x1024"}`} />
        {generationResult && <MetaRow label="Modelo" value={generationResult.model} />}
        <MetaRow label="Fundo" value={background} />
        <MetaRow label="Insígnias" value={badgesEnabled ? "Ativado" : "Desativado"} />
      </dl>

      <div className="mt-6 grid gap-3">
        <PrimaryButton
          disabled={!generationResult}
          onClick={() => generationResult && downloadGeneratedImage(generationResult)}
          full
        >
          <Download className="size-4" aria-hidden="true" />
          Baixar
        </PrimaryButton>
        <Button
          type="button"
          variant="outline"
          onClick={onRegenerate}
          className="inline-flex items-center justify-center gap-2 whitespace-normal rounded-lg border border-[#2a2a2a] px-4 py-3 text-sm font-semibold transition hover:bg-[#181818]"
        >
          <RefreshCcw className="size-4" aria-hidden="true" />
          Gerar novamente
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onBackToSettings}
          className="inline-flex items-center justify-center gap-2 whitespace-normal rounded-lg px-4 py-3 text-sm font-semibold text-[#a3a3a3] transition hover:bg-[#181818] hover:text-[#f5f5f5]"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Editar configurações
        </Button>
      </div>
    </aside>
  );
}

function GenerationStatus({ error, loading }: { error: string | null; loading: boolean }) {
  return (
    <div className="mb-5 flex items-center gap-2 text-sm text-[#a3a3a3]">
      {loading ? (
        <Loader2 className="size-4 animate-spin text-[#f5f5f5]" aria-hidden="true" />
      ) : error ? (
        <TriangleAlert className="size-4 text-[#ffb4ab]" aria-hidden="true" />
      ) : (
        <Check className="size-4 text-[#f5f5f5]" aria-hidden="true" />
      )}
      {loading ? "Geração em andamento" : error ? "Geração com erro" : "Geração concluída"}
    </div>
  );
}

function downloadGeneratedImage(image: ImageGenerationResult) {
  const link = document.createElement("a");
  link.href = `data:${image.mime_type};base64,${image.image_base64}`;
  link.download = `imageforge-pokemon.${image.output_format}`;
  link.click();
}
