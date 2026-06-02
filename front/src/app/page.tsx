"use client";

import { useMemo, useState } from "react";

import { useAuth } from "@/contexts/auth-context";
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
import { generateImage } from "@/features/image-forge/lib/image-generation-api";
import type {
  CopaConfig,
  CoupleReferences,
  Format,
  ImageGenerationResult,
  PokemonConfig,
  Step,
  Universe,
} from "@/features/image-forge/types";
import { saveGeneration } from "@/lib/generation-service";

export default function Home() {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("dashboard");
  const [universe, setUniverse] = useState<Universe>("Pokemon");
  const [background, setBackground] = useState(backgroundColors[2]);
  const [format, setFormat] = useState<Format>("Automático");
  const [badgesEnabled, setBadgesEnabled] = useState(true);
  const [coupleReferences, setCoupleReferences] = useState<CoupleReferences>({
    images: [],
  });
  const [copaConfig, setCopaConfig] = useState<CopaConfig>({
    name: "",
    birthDate: "",
    height: "",
    weight: "",
    club: "",
  });
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [uploadedName, setUploadedName] = useState("Nenhuma imagem selecionada");
  const [personalCharacteristics, setPersonalCharacteristics] = useState("");
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
  const effectiveFormat: Format = selectedUniverse.promptTemplate === "copa" ? "Retrato 3:4" : format;

  async function handleGenerate() {
    if (selectedUniverse.promptTemplate === "couple" && !coupleReferences.images[0]) {
      setGenerationError("Selecione pelo menos uma foto de corpo inteiro da pessoa presenteada.");
      setStep("preview");
      return;
    }

    if (selectedUniverse.promptTemplate !== "couple" && !referenceImage) {
      setGenerationError(
        "Selecione uma imagem de rosto antes de gerar.",
      );
      setStep("preview");
      return;
    }

    if (selectedUniverse.promptTemplate === "copa" && !isCopaConfigComplete(copaConfig)) {
      setGenerationError("Preencha nome, data de nascimento, altura, peso e clube.");
      setStep("preview");
      return;
    }

    setGenerationLoading(true);
    setGenerationError(null);
    setGenerationResult(null);
    setStep("preview");

    try {
      const result = await generateImage({
        background,
        badgesEnabled,
        coupleReferences,
        copaConfig,
        format: effectiveFormat,
        pokemonConfig,
        personalCharacteristics,
        promptTemplate: selectedUniverse.promptTemplate,
        referenceImage,
        universeLabel: selectedUniverse.label,
      });
      setGenerationResult(result);
      if (user) {
        void saveGeneration({
          userId: user.uid,
          imageBase64: result.image_base64,
          mimeType: result.mime_type,
          universeLabel: selectedUniverse.label,
          format: effectiveFormat,
        }).catch(console.error);
      }
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
          coupleReferences={coupleReferences}
          copaConfig={copaConfig}
          format={effectiveFormat}
          personalCharacteristics={personalCharacteristics}
          pokemonConfig={pokemonConfig}
          referenceImage={referenceImage}
          selectedUniverse={selectedUniverse}
          uploadedName={uploadedName}
          onBack={() => setStep("universe")}
          onBackgroundChange={setBackground}
          onBadgesChange={setBadgesEnabled}
          onCoupleReferencesChange={setCoupleReferences}
          onCopaConfigChange={setCopaConfig}
          onFileChange={handleFileChange}
          onFormatChange={setFormat}
          onGenerate={handleGenerate}
          onPersonalCharacteristicsChange={setPersonalCharacteristics}
          onPokemonConfigChange={setPokemonConfig}
        />
      )}

      {step === "preview" && (
        <PreviewStep
          background={background}
          badgesEnabled={badgesEnabled}
          format={effectiveFormat}
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

function isCopaConfigComplete(config: CopaConfig) {
  return Boolean(
    config.name.trim()
      && config.birthDate.trim()
      && config.height.trim()
      && config.weight.trim()
      && config.club.trim(),
  );
}
