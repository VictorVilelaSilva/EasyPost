import { CoupleReferencePanel } from "../couple-reference-panel";
import { GenerationOptionsPanel } from "../generation-options-panel";
import { PersonalCharacteristicsPanel } from "../personal-characteristics-panel";
import type { UniverseSettingsProps } from "./universe-settings-props";

export function CasalSettings({
  badgesEnabled,
  coupleReferences,
  format,
  personalCharacteristics,
  onBadgesChange,
  onCoupleReferencesChange,
  onFormatChange,
  onPersonalCharacteristicsChange,
}: UniverseSettingsProps) {
  return (
    <>
      <CoupleReferencePanel references={coupleReferences} onChange={onCoupleReferencesChange} />
      <PersonalCharacteristicsPanel
        help="Esse texto entra no prompt como a descrição afetiva do que você mais gosta na pessoa da foto."
        label="O que você mais gosta nessa pessoa"
        placeholder="Ex: amo o sorriso dela, o jeito carinhoso, a energia leve, o olhar expressivo e como ela deixa tudo mais divertido..."
        title="Mensagem sobre a pessoa"
        value={personalCharacteristics}
        onChange={onPersonalCharacteristicsChange}
      />
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
