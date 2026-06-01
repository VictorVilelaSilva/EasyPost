import { BackgroundPanel } from "../background-panel";
import { FaceUploadPanel } from "../face-upload-panel";
import { GenerationOptionsPanel } from "../generation-options-panel";
import { PersonalCharacteristicsPanel } from "../personal-characteristics-panel";
import type { UniverseSettingsProps } from "./universe-settings-props";

export function CopaSettings({
  background,
  badgesEnabled,
  format,
  personalCharacteristics,
  referenceImage,
  uploadedName,
  onBackgroundChange,
  onBadgesChange,
  onFileChange,
  onFormatChange,
  onPersonalCharacteristicsChange,
}: UniverseSettingsProps) {
  return (
    <>
      <FaceUploadPanel file={referenceImage} uploadedName={uploadedName} onFileChange={onFileChange} />
      <PersonalCharacteristicsPanel value={personalCharacteristics} onChange={onPersonalCharacteristicsChange} />
      <BackgroundPanel background={background} onBackgroundChange={onBackgroundChange} />
      <GenerationOptionsPanel
        badgesEnabled={badgesEnabled}
        format={format}
        showBadges={false}
        onBadgesChange={onBadgesChange}
        onFormatChange={onFormatChange}
      />
    </>
  );
}
