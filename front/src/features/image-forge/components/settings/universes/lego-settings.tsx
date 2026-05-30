import { FaceUploadPanel } from "../face-upload-panel";
import { GenerationOptionsPanel } from "../generation-options-panel";
import type { UniverseSettingsProps } from "./universe-settings-props";

export function LegoSettings({
  badgesEnabled,
  format,
  referenceImage,
  uploadedName,
  onBadgesChange,
  onFileChange,
  onFormatChange,
}: UniverseSettingsProps) {
  return (
    <>
      <FaceUploadPanel file={referenceImage} uploadedName={uploadedName} onFileChange={onFileChange} />
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
