"use client";

import { useMemo, useState } from "react";

import { AppHeader } from "@/features/image-forge/components/app-header";
import { Dashboard } from "@/features/image-forge/components/dashboard";
import { PreviewStep } from "@/features/image-forge/components/preview-step";
import { SettingsStep } from "@/features/image-forge/components/settings-step";
import { UniverseStep } from "@/features/image-forge/components/universe-step";
import {
  backgroundColors,
  defaultPokemonOutfit,
  universes,
} from "@/features/image-forge/constants";
import { generatePokemonImage } from "@/features/image-forge/lib/image-generation-api";
import type {
  Format,
  ImageGenerationResult,
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
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [uploadedName, setUploadedName] = useState("Nenhuma imagem selecionada");
  const [generationResult, setGenerationResult] = useState<ImageGenerationResult | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationLoading, setGenerationLoading] = useState(false);
  const [pokemonConfig, setPokemonConfig] = useState<PokemonConfig>({
    title: "Portugal",
    outfit: {
      mode: "photo",
      custom: defaultPokemonOutfit,
    },
    pokemon: [],
  });

  const selectedUniverse = useMemo(
    () => universes.find((item) => item.name === universe) ?? universes[1],
    [universe],
  );

  async function handleGenerate() {
    if (selectedUniverse.name !== "Pokemon") {
      setStep("preview");
      return;
    }

    if (!referenceImage) {
      setGenerationError("Selecione uma imagem de rosto antes de gerar.");
      setStep("preview");
      return;
    }

    setGenerationLoading(true);
    setGenerationError(null);
    setGenerationResult(null);
    setStep("preview");

    try {
      const result = await generatePokemonImage({
        background,
        badgesEnabled,
        format,
        pokemonConfig,
        referenceImage,
      });
      setGenerationResult(result);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Falha ao gerar imagem.");
    } finally {
      setGenerationLoading(false);
    }
  }

  function handleFileChange(file: File) {
    setReferenceImage(file);
    setUploadedName(file.name);
    setGenerationError(null);
  }

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
          onFileChange={handleFileChange}
          onFormatChange={setFormat}
          onGenerate={handleGenerate}
          onPokemonConfigChange={setPokemonConfig}
        />
      )}

      {step === "preview" && (
        <PreviewStep
          background={background}
          badgesEnabled={badgesEnabled}
          format={format}
          generationError={generationError}
          generationLoading={generationLoading}
          generationResult={generationResult}
          pokemonConfig={pokemonConfig}
          selectedUniverse={selectedUniverse}
          onBackToSettings={() => setStep("settings")}
          onRegenerate={handleGenerate}
        />
      )}
    </main>
  );
}
