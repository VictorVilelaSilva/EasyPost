import type { Format, PokemonConfig, UniverseOption } from "../types";
import { StepIntro } from "./common";
import { BackgroundPanel } from "./settings/background-panel";
import { FaceUploadPanel } from "./settings/face-upload-panel";
import { GenerationOptionsPanel } from "./settings/generation-options-panel";
import { PokemonPosterPanel } from "./settings/pokemon-poster-panel";
import { PokemonSelectionPanel } from "./settings/pokemon-selection-panel";
import { SettingsSummary } from "./settings/settings-summary";

export function SettingsStep({
  background,
  badgesEnabled,
  format,
  pokemonConfig,
  selectedUniverse,
  uploadedName,
  onBack,
  onBackgroundChange,
  onBadgesChange,
  onFileChange,
  onFormatChange,
  onGenerate,
  onPokemonConfigChange,
}: {
  background: string;
  badgesEnabled: boolean;
  format: Format;
  pokemonConfig: PokemonConfig;
  selectedUniverse: UniverseOption;
  uploadedName: string;
  onBack: () => void;
  onBackgroundChange: (color: string) => void;
  onBadgesChange: (enabled: boolean) => void;
  onFileChange: (file: File) => void;
  onFormatChange: (format: Format) => void;
  onGenerate: () => void;
  onPokemonConfigChange: (config: PokemonConfig) => void;
}) {
  const isPokemon = selectedUniverse.name === "Pokemon";

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <StepIntro
        eyebrow="Passo 2 de 3"
        title="Configurações da imagem"
        description="Ajuste a referência, o fundo e o formato antes de iniciar a geração."
      />

      <div className="mt-6 grid min-w-0 gap-5 lg:mt-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-6">
        <div className="min-w-0 space-y-5">
          <FaceUploadPanel uploadedName={uploadedName} onFileChange={onFileChange} />
          <BackgroundPanel background={background} onBackgroundChange={onBackgroundChange} />
          {isPokemon && (
            <>
              <PokemonPosterPanel
                pokemonConfig={pokemonConfig}
                onPokemonConfigChange={onPokemonConfigChange}
              />
              <PokemonSelectionPanel
                pokemonConfig={pokemonConfig}
                onPokemonConfigChange={onPokemonConfigChange}
              />
            </>
          )}
          <GenerationOptionsPanel
            badgesEnabled={badgesEnabled}
            format={format}
            onBadgesChange={onBadgesChange}
            onFormatChange={onFormatChange}
          />
        </div>

        <SettingsSummary
          background={background}
          badgesEnabled={badgesEnabled}
          format={format}
          isPokemon={isPokemon}
          pokemonConfig={pokemonConfig}
          selectedUniverse={selectedUniverse}
          onBack={onBack}
          onGenerate={onGenerate}
        />
      </div>
    </section>
  );
}
