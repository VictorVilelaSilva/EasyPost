import type { ComponentType } from "react";

import type { CoupleReferences, Format, PokemonConfig, Universe, UniverseOption } from "../types";
import { StepIntro } from "./common";
import { AnimeGeralSettings } from "./settings/universes/anime-geral-settings";
import { AvatarSettings } from "./settings/universes/avatar-settings";
import { BleachSettings } from "./settings/universes/bleach-settings";
import { CasalSettings } from "./settings/universes/casal-settings";
import { CopaSettings } from "./settings/universes/copa-settings";
import { DigimonSettings } from "./settings/universes/digimon-settings";
import { KimetsuSettings } from "./settings/universes/kimetsu-settings";
import { LegoSettings } from "./settings/universes/lego-settings";
import { MonsterHighSettings } from "./settings/universes/monster-high-settings";
import { NarutoSettings } from "./settings/universes/naruto-settings";
import { PokemonSettings } from "./settings/universes/pokemon-settings";
import { RickMortySettings } from "./settings/universes/rick-morty-settings";
import { SanAndreasSettings } from "./settings/universes/san-andreas-settings";
import type { UniverseSettingsProps } from "./settings/universes/universe-settings-props";
import { SettingsSummary } from "./settings/settings-summary";

const UNIVERSE_SETTINGS: Record<Universe, ComponentType<UniverseSettingsProps>> = {
  "Anime Geral":                AnimeGeralSettings,
  "Avatar, the Last Airbender": AvatarSettings,
  "Bleach":                     BleachSettings,
  "Casal":                      CasalSettings,
  "Copa":                       CopaSettings,
  "Digimon":                    DigimonSettings,
  "Kimetsu":                    KimetsuSettings,
  "LEGO":                       LegoSettings,
  "Monster High":               MonsterHighSettings,
  "Naruto":                     NarutoSettings,
  "Pokemon":                    PokemonSettings,
  "Rick and Morty":             RickMortySettings,
  "San Andreas":                SanAndreasSettings,
};

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
  const UniverseSettings = UNIVERSE_SETTINGS[selectedUniverse.name];
  const settingsProps: UniverseSettingsProps = {
    background,
    badgesEnabled,
    coupleReferences,
    format,
    personalCharacteristics,
    pokemonConfig,
    referenceImage,
    uploadedName,
    onBackgroundChange,
    onBadgesChange,
    onCoupleReferencesChange,
    onFileChange,
    onFormatChange,
    onPersonalCharacteristicsChange,
    onPokemonConfigChange,
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <StepIntro
        eyebrow="Passo 2 de 3"
        title="Configurações da imagem"
        description="Ajuste a referência, o fundo e o formato antes de iniciar a geração."
      />
      <div className="mt-6 grid min-w-0 gap-5 lg:mt-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-6">
        <div className="min-w-0 space-y-5">
          <UniverseSettings {...settingsProps} />
        </div>
        <SettingsSummary
          background={background}
          badgesEnabled={badgesEnabled}
          format={format}
          isPokemon={selectedUniverse.name === "Pokemon"}
          pokemonConfig={pokemonConfig}
          selectedUniverse={selectedUniverse}
          onBack={onBack}
          onGenerate={onGenerate}
        />
      </div>
    </section>
  );
}
