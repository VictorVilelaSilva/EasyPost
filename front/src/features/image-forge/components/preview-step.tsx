import type { Format, ImageGenerationResult, PokemonConfig, UniverseOption } from "../types";
import { StepIntro } from "./common";
import { PreviewArtwork } from "./preview/preview-artwork";
import { PreviewSummary } from "./preview/preview-summary";

export function PreviewStep({
  background,
  badgesEnabled,
  format,
  generationError,
  generationLoading,
  generationResult,
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
  pokemonConfig: PokemonConfig;
  selectedUniverse: UniverseOption;
  onBackToSettings: () => void;
  onRegenerate: () => void;
}) {
  const isPokemon = selectedUniverse.name === "Pokemon";

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <StepIntro
        eyebrow={generationLoading ? "Gerando" : generationError ? "Erro" : "Finalizado"}
        title={generationLoading ? "Gerando imagem" : generationError ? "Geração interrompida" : "Imagem gerada"}
        description="Acompanhe a geração, baixe a imagem ou volte para refinar as configurações."
      />

      <div className="mt-6 grid min-w-0 gap-5 lg:mt-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-6">
        <div className="min-w-0 rounded-lg border border-[#2a2a2a] bg-[#0b0b0b] p-3 sm:p-4">
          <div className="grid min-h-[360px] place-items-center overflow-hidden rounded-lg border border-[#2a2a2a] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%),#111] p-4 sm:min-h-[620px] sm:p-6">
            <div className="grid w-full max-w-[680px] place-items-center rounded-lg border border-white/10 bg-black/20 p-2 shadow-2xl shadow-black/40 sm:p-3">
              <PreviewArtwork
                badgesEnabled={badgesEnabled}
                error={generationError}
                image={generationResult}
                loading={generationLoading}
                selectedUniverse={selectedUniverse}
              />
            </div>
          </div>
        </div>

        <PreviewSummary
          background={background}
          badgesEnabled={badgesEnabled}
          format={format}
          generationError={generationError}
          generationLoading={generationLoading}
          generationResult={generationResult}
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
