import { needsCoupleReferences, needsPersonalCharacteristics } from "../lib/prompt-template-rules";
import type { CoupleReferences, Format, PokemonConfig, UniverseOption } from "../types";
import { StepIntro } from "./common";
import { BackgroundPanel } from "./settings/background-panel";
import { CoupleReferencePanel } from "./settings/couple-reference-panel";
import { FaceUploadPanel } from "./settings/face-upload-panel";
import { GenerationOptionsPanel } from "./settings/generation-options-panel";
import { PersonalCharacteristicsPanel } from "./settings/personal-characteristics-panel";
import { PokemonPosterPanel } from "./settings/pokemon-poster-panel";
import { PokemonSelectionPanel } from "./settings/pokemon-selection-panel";
import { SettingsSummary } from "./settings/settings-summary";

export function SettingsStep({
  background,
  badgesEnabled,
  coupleReferences,
  format,
  personalCharacteristics,
  pokemonConfig,
  referenceImage,
  selectedUniverse,
  uploadedName,
  onBack,
  onBackgroundChange,
  onBadgesChange,
  onCoupleReferencesChange,
  onFileChange,
  onFormatChange,
  onGenerate,
  onPersonalCharacteristicsChange,
  onPokemonConfigChange,
}: {
  background: string;
  badgesEnabled: boolean;
  coupleReferences: CoupleReferences;
  format: Format;
  personalCharacteristics: string;
  pokemonConfig: PokemonConfig;
  referenceImage: File | null;
  selectedUniverse: UniverseOption;
  uploadedName: string;
  onBack: () => void;
  onBackgroundChange: (color: string) => void;
  onBadgesChange: (enabled: boolean) => void;
  onCoupleReferencesChange: (references: CoupleReferences) => void;
  onFileChange: (file: File) => void;
  onFormatChange: (format: Format) => void;
  onGenerate: () => void;
  onPersonalCharacteristicsChange: (value: string) => void;
  onPokemonConfigChange: (config: PokemonConfig) => void;
}) {
  const isPokemon = selectedUniverse.name === "Pokemon";
  const showPersonalCharacteristics = needsPersonalCharacteristics(selectedUniverse.promptTemplate);
  const showCoupleReferences = needsCoupleReferences(selectedUniverse.promptTemplate);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <StepIntro
        eyebrow="Passo 2 de 3"
        title="Configurações da imagem"
        description="Ajuste a referência, o fundo e o formato antes de iniciar a geração."
      />

      <div className="mt-6 grid min-w-0 gap-5 lg:mt-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-6">
        <div className="min-w-0 space-y-5">
          {showCoupleReferences ? (
            <CoupleReferencePanel
              references={coupleReferences}
              onChange={onCoupleReferencesChange}
            />
          ) : (
            <FaceUploadPanel
              file={referenceImage}
              uploadedName={uploadedName}
              onFileChange={onFileChange}
            />
          )}
          {showPersonalCharacteristics && (
            <PersonalCharacteristicsPanel
              value={personalCharacteristics}
              onChange={onPersonalCharacteristicsChange}
            />
          )}
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
