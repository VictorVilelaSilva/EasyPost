import { BackgroundPanel } from "../background-panel";
import { FaceUploadPanel } from "../face-upload-panel";
import { GenerationOptionsPanel } from "../generation-options-panel";
import type { UniverseSettingsProps } from "./universe-settings-props";

export function CopaSettings({
  background,
  badgesEnabled,
  format,
  referenceImage,
  uploadedName,
  onBackgroundChange,
  onBadgesChange,
  onFileChange,
  onFormatChange,
}: UniverseSettingsProps) {
  return (
    <>
      <FaceUploadPanel file={referenceImage} uploadedName={uploadedName} onFileChange={onFileChange} />
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
