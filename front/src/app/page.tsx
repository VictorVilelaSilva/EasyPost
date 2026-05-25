"use client";

import { useMemo, useState } from "react";

import { AppHeader } from "@/features/image-forge/components/app-header";
import { Dashboard } from "@/features/image-forge/components/dashboard";
import { PreviewStep } from "@/features/image-forge/components/preview-step";
import { SettingsStep } from "@/features/image-forge/components/settings-step";
import { UniverseStep } from "@/features/image-forge/components/universe-step";
import { backgroundColors, universes } from "@/features/image-forge/constants";
import { buildPokemonPrompt } from "@/features/image-forge/lib/pokemon-prompt";
import type {
  Format,
  PokemonConfig,
  Step,
  Universe,
} from "@/features/image-forge/types";

export default function Home() {
  const [step, setStep] = useState<Step>("dashboard");
  const [universe, setUniverse] = useState<Universe>("Pokemon");
  const [background, setBackground] = useState(backgroundColors[2]);
  const [format, setFormat] = useState<Format>("Automático");
  const [badgesEnabled, setBadgesEnabled] = useState(true);
  const [uploadedName, setUploadedName] = useState("rosto_referencia.png");
  const [pokemonConfig, setPokemonConfig] = useState<PokemonConfig>({
    title: "Portugal",
    outfit: "Jaqueta tática verde escura",
    pokemon: [],
  });

  const selectedUniverse = useMemo(
    () => universes.find((item) => item.name === universe) ?? universes[1],
    [universe],
  );

  const generationPrompt = useMemo(() => {
    if (selectedUniverse.name !== "Pokemon") return "";

    return buildPokemonPrompt({
      background,
      badgesEnabled,
      config: pokemonConfig,
      format,
    });
  }, [background, badgesEnabled, format, pokemonConfig, selectedUniverse.name]);

  return (
    <main className="min-h-screen bg-[#050505] text-[#f5f5f5]">
      <AppHeader step={step} />

      {step === "dashboard" && <Dashboard onCreate={() => setStep("universe")} />}

      {step === "universe" && (
        <UniverseStep
          selected={universe}
          onSelect={setUniverse}
          onBack={() => setStep("dashboard")}
          onNext={() => setStep("settings")}
        />
      )}

      {step === "settings" && (
        <SettingsStep
          background={background}
          badgesEnabled={badgesEnabled}
          format={format}
          pokemonConfig={pokemonConfig}
          selectedUniverse={selectedUniverse}
          uploadedName={uploadedName}
          onBack={() => setStep("universe")}
          onBackgroundChange={setBackground}
          onBadgesChange={setBadgesEnabled}
          onFileChange={setUploadedName}
          onFormatChange={setFormat}
          onGenerate={() => setStep("preview")}
          onPokemonConfigChange={setPokemonConfig}
        />
      )}

      {step === "preview" && (
        <PreviewStep
          background={background}
          badgesEnabled={badgesEnabled}
          format={format}
          generationPrompt={generationPrompt}
          pokemonConfig={pokemonConfig}
          selectedUniverse={selectedUniverse}
          onBackToSettings={() => setStep("settings")}
          onRegenerate={() => setStep("settings")}
        />
      )}
    </main>
  );
}
