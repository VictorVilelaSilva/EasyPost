import { BackgroundPanel } from "../background-panel";
import { FaceUploadPanel } from "../face-upload-panel";
import { GenerationOptionsPanel } from "../generation-options-panel";
import { PokemonPosterPanel } from "../pokemon-poster-panel";
import { PokemonSelectionPanel } from "../pokemon-selection-panel";
import type { UniverseSettingsProps } from "./universe-settings-props";

export function PokemonSettings({
  background,
  badgesEnabled,
  format,
  pokemonConfig,
  referenceImage,
  uploadedName,
  onBackgroundChange,
  onBadgesChange,
  onFileChange,
  onFormatChange,
  onPokemonConfigChange,
}: UniverseSettingsProps) {
  return (
    <>
      <FaceUploadPanel file={referenceImage} uploadedName={uploadedName} onFileChange={onFileChange} />
      <BackgroundPanel background={background} onBackgroundChange={onBackgroundChange} />
      <PokemonPosterPanel pokemonConfig={pokemonConfig} onPokemonConfigChange={onPokemonConfigChange} />
      <PokemonSelectionPanel pokemonConfig={pokemonConfig} onPokemonConfigChange={onPokemonConfigChange} />
      <GenerationOptionsPanel
        badgesEnabled={badgesEnabled}
        format={format}
        showBadges={true}
        onBadgesChange={onBadgesChange}
        onFormatChange={onFormatChange}
      />
    </>
  );
}
