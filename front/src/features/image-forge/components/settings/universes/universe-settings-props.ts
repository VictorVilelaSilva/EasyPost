import type { CopaConfig, CoupleReferences, Format, PokemonConfig } from "../../../types";

export type UniverseSettingsProps = {
  background: string;
  badgesEnabled: boolean;
  coupleReferences: CoupleReferences;
  copaConfig: CopaConfig;
  format: Format;
  personalCharacteristics: string;
  pokemonConfig: PokemonConfig;
  referenceImage: File | null;
  uploadedName: string;
  onBackgroundChange: (color: string) => void;
  onBadgesChange: (enabled: boolean) => void;
  onCoupleReferencesChange: (refs: CoupleReferences) => void;
  onCopaConfigChange: (config: CopaConfig) => void;
  onFileChange: (file: File) => void;
  onFormatChange: (format: Format) => void;
  onPersonalCharacteristicsChange: (value: string) => void;
  onPokemonConfigChange: (config: PokemonConfig) => void;
};
