import { BackgroundPanel } from "../background-panel";
import { CoupleReferencePanel } from "../couple-reference-panel";
import { GenerationOptionsPanel } from "../generation-options-panel";
import { PersonalCharacteristicsPanel } from "../personal-characteristics-panel";
import type { UniverseSettingsProps } from "./universe-settings-props";

export function CasalSettings({
  background,
  badgesEnabled,
  coupleReferences,
  format,
  personalCharacteristics,
  onBackgroundChange,
  onBadgesChange,
  onCoupleReferencesChange,
  onFormatChange,
  onPersonalCharacteristicsChange,
}: UniverseSettingsProps) {
  return (
    <>
      <CoupleReferencePanel references={coupleReferences} onChange={onCoupleReferencesChange} />
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
