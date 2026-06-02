import { CopaPlayerPanel } from "../copa-player-panel";
import { FaceUploadPanel } from "../face-upload-panel";
import { LockedFormatPanel } from "../locked-format-panel";
import type { UniverseSettingsProps } from "./universe-settings-props";

export function CopaSettings({
  copaConfig,
  referenceImage,
  uploadedName,
  onCopaConfigChange,
  onFileChange,
}: UniverseSettingsProps) {
  return (
    <>
      <FaceUploadPanel file={referenceImage} uploadedName={uploadedName} onFileChange={onFileChange} />
      <CopaPlayerPanel config={copaConfig} onChange={onCopaConfigChange} />
      <LockedFormatPanel />
    </>
  );
}
