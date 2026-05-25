"use client";

import {
  ArrowLeft,
  BadgeCheck,
  Check,
  ChevronRight,
  Download,
  ImageIcon,
  Loader2,
  Palette,
  Plus,
  RefreshCcw,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Upload,
  Wand2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type Step = "dashboard" | "universe" | "settings" | "preview";
type Universe = "Kimetsu" | "Pokemon" | "Naruto" | "Digimon";
type PokemonOutfit =
  | "Jaqueta tática verde escura"
  | "Casaco preto campeão"
  | "Streetwear branco e preto"
  | "Uniforme futurista";
type Format =
  | "Automático"
  | "Quadrado 1:1"
  | "Retrato 3:4"
  | "Story 9:16"
  | "Paisagem 4:3"
  | "Widescreen 16:9";

const universes: Array<{
  name: Universe;
  label: string;
  description: string;
  code: string;
}> = [
  {
    name: "Kimetsu",
    label: "Kimetsu",
    description: "Traços dramáticos, lâminas, haori e composição cinematográfica.",
    code: "KMT",
  },
  {
    name: "Pokemon",
    label: "Pokémon",
    description: "Criaturas, insígnias, energia elemental e visual de treinador.",
    code: "PKM",
  },
  {
    name: "Naruto",
    label: "Naruto",
    description: "Vilas, clãs, bandanas, selos e poses de ação.",
    code: "NRT",
  },
  {
    name: "Digimon",
    label: "Digimon",
    description: "Parceiros digitais, circuitos sutis e evolução heroica.",
    code: "DGM",
  },
];

const recentGenerations = [
  { title: "Avatar treinador", meta: "Pokémon · Quadrada · hoje" },
  { title: "Retrato hashira", meta: "Kimetsu · Retrato · ontem" },
  { title: "Clã da folha", meta: "Naruto · Paisagem · 18 mai" },
];

const backgroundColors = [
  "#050505",
  "#15151A",
  "#1A1A2E",
  "#222222",
  "#F5F5F5",
  "#E8E2D8",
  "#7C2D12",
  "#14532D",
  "#1E3A8A",
  "#581C87",
  "#BE123C",
  "#CA8A04",
];

const formats: Array<{ label: Format; ratio: string; shape: string }> = [
  { label: "Automático", ratio: "", shape: "auto" },
  { label: "Quadrado 1:1", ratio: "1:1", shape: "square" },
  { label: "Retrato 3:4", ratio: "3:4", shape: "portrait" },
  { label: "Story 9:16", ratio: "9:16", shape: "story" },
  { label: "Paisagem 4:3", ratio: "4:3", shape: "landscape" },
  { label: "Widescreen 16:9", ratio: "16:9", shape: "wide" },
];

const pokemonOutfits: PokemonOutfit[] = [
  "Jaqueta tática verde escura",
  "Casaco preto campeão",
  "Streetwear branco e preto",
  "Uniforme futurista",
];

const defaultPokemonList: PokemonPlacement[] = [
  { name: "Mewtwo", position: "atrás do treinador" },
  { name: "Quilava", position: "ao lado dele" },
  { name: "Pichu", position: "na parte inferior" },
  { name: "Eevee", position: "no ombro" },
  { name: "Ledian", position: "no primeiro plano" },
  { name: "Furret", position: "no canto inferior" },
  { name: "Persian", position: "no centro inferior" },
];

const pokemonPositions = [
  "atrás do treinador",
  "ao lado dele",
  "na parte inferior",
  "no ombro",
  "no primeiro plano",
  "no canto inferior",
  "no centro inferior",
  "voando acima",
];

const backgroundPromptMap: Record<string, string> = {
  "#050505": "near-black premium studio background",
  "#15151A": "charcoal editorial background",
  "#1A1A2E": "dark navy background",
  "#222222": "dark graphite background",
  "#F5F5F5": "minimal white background",
  "#E8E2D8": "clean cream-colored background",
  "#7C2D12": "deep warm copper background",
  "#14532D": "dark green background",
  "#1E3A8A": "deep blue background",
  "#581C87": "dark purple background",
  "#BE123C": "deep rose background",
  "#CA8A04": "muted golden background",
};

const formatPromptMap: Record<Format, string> = {
  Automático: "automatic composition based on the image generation model",
  "Quadrado 1:1": "square 1:1 poster composition",
  "Retrato 3:4": "portrait 3:4 poster composition",
  "Story 9:16": "vertical story 9:16 poster composition",
  "Paisagem 4:3": "landscape 4:3 poster composition",
  "Widescreen 16:9": "widescreen 16:9 cinematic composition",
};

type PokemonConfig = {
  title: string;
  outfit: PokemonOutfit;
  pokemon: PokemonPlacement[];
};

type PokemonPlacement = {
  name: string;
  position: string;
};

type PokemonSummary = {
  id: number;
  name: string;
  display_name: string;
  sprite_url: string | null;
  artwork_url: string | null;
  types: string[];
};

type PokemonListResponse = {
  count: number;
  results: PokemonSummary[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8004";

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

function AppHeader({ step }: { step: Step }) {
  const current = {
    dashboard: "Dashboard",
    universe: "Escolha",
    settings: "Configuração",
    preview: "Preview",
  }[step];

  return (
    <header className="sticky top-0 z-20 border-b border-[#2a2a2a] bg-[#050505]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#101010]">
            <Wand2 className="size-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold">ImageForge IA</p>
            <p className="text-xs text-[#a3a3a3]">{current}</p>
          </div>
        </div>

        <nav className="hidden items-center gap-1 rounded-lg border border-[#2a2a2a] bg-[#101010] p-1 text-sm text-[#a3a3a3] md:flex">
          {["Dashboard", "Universo", "Configuração", "Preview"].map((item) => (
            <span
              key={item}
              className={`rounded-md px-3 py-1.5 ${
                item === current || (item === "Universo" && current === "Escolha")
                  ? "bg-[#181818] text-[#f5f5f5]"
                  : ""
              }`}
            >
              {item}
            </span>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="hidden rounded-lg border border-[#2a2a2a] px-3 py-2 text-sm text-[#a3a3a3] transition hover:bg-[#181818] hover:text-[#f5f5f5] sm:inline-flex"
          >
            Histórico
          </Button>
          <div className="flex size-9 items-center justify-center rounded-full bg-[#f5f5f5] text-sm font-semibold text-[#050505]">
            VF
          </div>
        </div>
      </div>
    </header>
  );
}

function Dashboard({ onCreate }: { onCreate: () => void }) {
  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8 lg:py-10">
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-5 border-b border-[#2a2a2a] pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#a3a3a3]">
              Estúdio de geração
            </p>
            <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Suas gerações
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#a3a3a3]">
              Crie imagens estilizadas a partir de um rosto, escolha um universo
              visual e ajuste o formato antes de gerar.
            </p>
          </div>
          <PrimaryButton onClick={onCreate}>
            Gerar imagens
            <ChevronRight className="size-4" aria-hidden="true" />
          </PrimaryButton>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Recentes</h2>
            <Button type="button" variant="ghost" className="text-sm text-[#a3a3a3] hover:text-[#f5f5f5]">
              Ver tudo
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {recentGenerations.map((item, index) => (
              <Card
                key={item.title}
                className="group rounded-lg border border-[#2a2a2a] bg-[#101010] p-3 transition hover:border-[#555] hover:bg-[#181818]"
              >
                <div className="aspect-square rounded-md border border-[#2a2a2a] bg-[linear-gradient(135deg,#111,#1d1d1d_45%,#090909)] p-3">
                  <div className="flex h-full items-end justify-between">
                    <ImageIcon className="size-5 text-[#a3a3a3]" aria-hidden="true" />
                    <span className="text-xs text-[#a3a3a3]">0{index + 1}</span>
                  </div>
                </div>
                <h3 className="mt-3 text-sm font-semibold">{item.title}</h3>
                <p className="mt-1 text-xs text-[#a3a3a3]">{item.meta}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Card className="rounded-lg border border-[#2a2a2a] bg-[#101010] p-5">
        <div className="flex size-10 items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#181818]">
          <Sparkles className="size-5" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-lg font-semibold">Nenhuma fila ativa</h2>
        <p className="mt-2 text-sm leading-6 text-[#a3a3a3]">
          Quando uma geração estiver em andamento, o progresso e a prévia vão
          aparecer aqui.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={onCreate}
          className="mt-6 w-full rounded-lg border border-[#2a2a2a] px-4 py-3 text-sm font-semibold transition hover:bg-[#181818]"
        >
          Iniciar nova imagem
        </Button>
      </Card>
    </section>
  );
}

function UniverseStep({
  selected,
  onBack,
  onNext,
  onSelect,
}: {
  selected: Universe;
  onBack: () => void;
  onNext: () => void;
  onSelect: (universe: Universe) => void;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <StepIntro
        eyebrow="Passo 1 de 3"
        title="Escolha o universo da imagem"
        description="Defina a direção visual antes de enviar o rosto e os detalhes da geração."
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-4">
        {universes.map((item) => {
          const isSelected = item.name === selected;

          return (
            <Button
              key={item.name}
              type="button"
              variant="outline"
              onClick={() => onSelect(item.name)}
              className={`group flex h-auto flex-col items-stretch justify-start rounded-lg border bg-[#101010] p-4 text-left transition hover:bg-[#181818] ${
                isSelected ? "border-[#f5f5f5]" : "border-[#2a2a2a]"
              }`}
            >
              <div className="aspect-[4/3] rounded-md border border-[#2a2a2a] bg-[#181818] p-4">
                <div className="flex h-full flex-col justify-between">
                  <span className="text-xs font-semibold text-[#a3a3a3]">{item.code}</span>
                  <div className="flex items-end justify-between">
                    <Sparkles className="size-5 text-[#a3a3a3]" aria-hidden="true" />
                    {isSelected && (
                      <span className="flex size-7 items-center justify-center rounded-full bg-[#f5f5f5] text-[#050505]">
                        <Check className="size-4" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <h2 className="mt-4 text-base font-semibold">{item.label}</h2>
              <p className="mt-2 text-sm leading-6 text-[#a3a3a3]">{item.description}</p>
            </Button>
          );
        })}
      </div>

      <StepActions onBack={onBack} onNext={onNext} nextLabel="Continuar" />
    </section>
  );
}

function SettingsStep({
  background,
  badgesEnabled,
  format,
  pokemonConfig,
  selectedUniverse,
  uploadedName,
  onBack,
  onBackgroundChange,
  onBadgesChange,
  onFileChange,
  onFormatChange,
  onGenerate,
  onPokemonConfigChange,
}: {
  background: string;
  badgesEnabled: boolean;
  format: Format;
  pokemonConfig: PokemonConfig;
  selectedUniverse: (typeof universes)[number];
  uploadedName: string;
  onBack: () => void;
  onBackgroundChange: (color: string) => void;
  onBadgesChange: (enabled: boolean) => void;
  onFileChange: (name: string) => void;
  onFormatChange: (format: Format) => void;
  onGenerate: () => void;
  onPokemonConfigChange: (config: PokemonConfig) => void;
}) {
  const isPokemon = selectedUniverse.name === "Pokemon";
  const [pokemonSearch, setPokemonSearch] = useState("");
  const [pokemonOptions, setPokemonOptions] = useState<PokemonSummary[]>([]);
  const [pokemonLoading, setPokemonLoading] = useState(false);
  const [pokemonError, setPokemonError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPokemon) return;

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setPokemonLoading(true);
      setPokemonError(null);

      try {
        const params = new URLSearchParams({ limit: "12" });
        const search = pokemonSearch.trim();
        if (search) params.set("search", search);

        const response = await fetch(`${API_URL}/pokemon?${params.toString()}`);
        if (!response.ok) throw new Error("Falha ao buscar Pokémon");

        const data = (await response.json()) as PokemonListResponse;
        if (!cancelled) setPokemonOptions(data.results);
      } catch {
        if (!cancelled) {
          setPokemonOptions([]);
          setPokemonError("Não foi possível carregar a lista de Pokémon.");
        }
      } finally {
        if (!cancelled) setPokemonLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [isPokemon, pokemonSearch]);

  function updatePokemonName(index: number, value: string) {
    onPokemonConfigChange({
      ...pokemonConfig,
      pokemon: pokemonConfig.pokemon.map((item, itemIndex) =>
        itemIndex === index ? { ...item, name: value } : item,
      ),
    });
  }

  function updatePokemonPosition(index: number, value: string) {
    onPokemonConfigChange({
      ...pokemonConfig,
      pokemon: pokemonConfig.pokemon.map((item, itemIndex) =>
        itemIndex === index ? { ...item, position: value } : item,
      ),
    });
  }

  function removePokemon(index: number) {
    onPokemonConfigChange({
      ...pokemonConfig,
      pokemon: pokemonConfig.pokemon.filter((_, itemIndex) => itemIndex !== index),
    });
  }

  function addPokemon() {
    if (pokemonConfig.pokemon.length >= 7) return;

    onPokemonConfigChange({
      ...pokemonConfig,
      pokemon: [...pokemonConfig.pokemon, { name: "", position: "" }],
    });
  }

  function addPokemonFromApi(pokemon: PokemonSummary) {
    if (pokemonConfig.pokemon.length >= 7) return;

    onPokemonConfigChange({
      ...pokemonConfig,
      pokemon: [
        ...pokemonConfig.pokemon,
        { name: pokemon.display_name, position: "" },
      ],
    });
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <StepIntro
        eyebrow="Passo 2 de 3"
        title="Configurações da imagem"
        description="Ajuste a referência, o fundo e o formato antes de iniciar a geração."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Panel>
            <SectionTitle icon={Upload} title="Imagem de rosto" />
            <Label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#3a3a3a] bg-[#0c0c0c] px-6 py-10 text-center transition hover:border-[#666] hover:bg-[#121212]">
              <input
                className="sr-only"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) onFileChange(file.name);
                }}
              />
              <Upload className="size-6 text-[#a3a3a3]" aria-hidden="true" />
              <span className="mt-3 text-sm font-semibold">{uploadedName}</span>
              <span className="mt-1 text-xs text-[#a3a3a3]">PNG ou JPG até 10 MB</span>
            </Label>
          </Panel>

          <Panel>
            <SectionTitle icon={Palette} title="Cor de fundo" />
            <div className="mt-4 grid grid-cols-6 gap-3 sm:grid-cols-8 md:grid-cols-12">
              {backgroundColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => onBackgroundChange(color)}
                  className={`relative size-10 rounded-lg border transition hover:scale-105 ${
                    color.toLowerCase() === background.toLowerCase()
                      ? "border-[#f5f5f5]"
                      : "border-[#2a2a2a]"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Selecionar cor ${color}`}
                >
                  {color.toLowerCase() === background.toLowerCase() && (
                    <span className="absolute inset-0 grid place-items-center rounded-lg bg-black/20">
                      <Check className="size-4 text-white drop-shadow" aria-hidden="true" />
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Label className="flex w-full items-center justify-between gap-3 rounded-lg border border-[#2a2a2a] bg-[#0c0c0c] px-3 py-2 sm:max-w-xs">
                <span className="text-sm text-[#a3a3a3]">Cor selecionada</span>
                <span className="font-mono text-sm">{background.toUpperCase()}</span>
              </Label>
              <Label className="inline-flex cursor-pointer items-center justify-center gap-3 rounded-lg border border-[#2a2a2a] px-4 py-2 text-sm font-semibold transition hover:bg-[#181818]">
                <span>Escolher na paleta</span>
                <input
                  type="color"
                  value={background}
                  onChange={(event) => onBackgroundChange(event.target.value)}
                  className="size-6 cursor-pointer rounded border-0 bg-transparent p-0"
                  aria-label="Escolher cor personalizada"
                />
              </Label>
            </div>
          </Panel>

          {isPokemon && (
            <>
              <Panel>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <SectionTitle icon={Sparkles} title="Título do poster" />
                    <Input
                      value={pokemonConfig.title}
                      onChange={(event) =>
                        onPokemonConfigChange({
                          ...pokemonConfig,
                          title: event.target.value,
                        })
                      }
                      placeholder="Portugal"
                      className="mt-4 h-10 border-[#2a2a2a] bg-[#0c0c0c] text-[#f5f5f5] placeholder:text-[#666] focus-visible:ring-[#f5f5f5]/30"
                    />
                  </div>

                  <div>
                    <SectionTitle icon={SlidersHorizontal} title="Roupa do treinador" />
                    <Select
                      value={pokemonConfig.outfit}
                      onValueChange={(value) =>
                        onPokemonConfigChange({
                          ...pokemonConfig,
                          outfit: value as PokemonOutfit,
                        })
                      }
                    >
                      <SelectTrigger className="mt-4 h-10 w-full border-[#2a2a2a] bg-[#101010] text-[#f5f5f5] hover:bg-[#181818]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-[#2a2a2a] bg-[#333333] text-[#f5f5f5]">
                        <SelectGroup>
                          <SelectLabel className="px-2 py-2 text-xs text-[#bdbdbd]">
                            Visual do campeão
                          </SelectLabel>
                          {pokemonOutfits.map((outfit) => (
                            <SelectItem
                              key={outfit}
                              value={outfit}
                              className="py-2 text-[#f5f5f5] focus:bg-white/10 focus:text-[#f5f5f5]"
                            >
                              {outfit}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Panel>

              <Panel>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <SectionTitle icon={BadgeCheck} title="Pokémon ao redor" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addPokemon}
                    disabled={pokemonConfig.pokemon.length >= 7}
                    className="w-fit border-[#2a2a2a] bg-[#101010] text-[#f5f5f5] hover:bg-[#181818]"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    Adicionar
                  </Button>
                </div>

                <div className="mt-4 rounded-lg border border-[#2a2a2a] bg-[#0c0c0c] p-3">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                      value={pokemonSearch}
                      onChange={(event) => setPokemonSearch(event.target.value)}
                      placeholder="Buscar na PokéAPI, ex: pikachu, mewtwo..."
                      className="h-10 border-[#2a2a2a] bg-[#101010] text-[#f5f5f5] placeholder:text-[#666] focus-visible:ring-[#f5f5f5]/30"
                    />
                    <div className="flex min-w-24 items-center text-xs text-[#a3a3a3]">
                      {pokemonLoading && (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                          Buscando
                        </span>
                      )}
                    </div>
                  </div>

                  {pokemonError && <p className="mt-3 text-xs text-[#ffb4ab]">{pokemonError}</p>}

                  {!pokemonError && pokemonOptions.length > 0 && (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {pokemonOptions.map((pokemon) => (
                        <Button
                          key={pokemon.id}
                          type="button"
                          variant="outline"
                          onClick={() => addPokemonFromApi(pokemon)}
                          disabled={pokemonConfig.pokemon.length >= 7}
                          className="h-auto justify-start gap-3 border-[#2a2a2a] bg-[#101010] px-3 py-2 text-left hover:bg-[#181818]"
                        >
                          {pokemon.sprite_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={pokemon.sprite_url}
                              alt=""
                              className="size-9 rounded-md bg-black/30 object-contain"
                            />
                          ) : (
                            <span className="grid size-9 place-items-center rounded-md bg-black/30">
                              <Sparkles className="size-4 text-[#a3a3a3]" aria-hidden="true" />
                            </span>
                          )}
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold">
                              {pokemon.display_name}
                            </span>
                            <span className="block truncate text-xs text-[#a3a3a3]">
                              #{pokemon.id.toString().padStart(4, "0")}
                            </span>
                          </span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-3">
                  {pokemonConfig.pokemon.length === 0 && (
                    <div className="rounded-lg border border-dashed border-[#2a2a2a] bg-[#0c0c0c] px-4 py-5 text-sm text-[#a3a3a3]">
                      Nenhum Pokémon selecionado ainda.
                    </div>
                  )}

                  {pokemonConfig.pokemon.map((pokemon, index) => (
                    <div key={index} className="grid gap-2 md:grid-cols-[minmax(0,1fr)_220px_32px]">
                      <Input
                        value={pokemon.name}
                        onChange={(event) => updatePokemonName(index, event.target.value)}
                        placeholder="Pokémon"
                        className="h-10 border-[#2a2a2a] bg-[#0c0c0c] text-[#f5f5f5] placeholder:text-[#666] focus-visible:ring-[#f5f5f5]/30"
                      />
                      <Select
                        value={pokemon.position}
                        onValueChange={(value) => updatePokemonPosition(index, value)}
                      >
                        <SelectTrigger className="h-10 w-full border-[#2a2a2a] bg-[#0c0c0c] text-[#f5f5f5] hover:bg-[#181818]">
                          <SelectValue placeholder="Posição" />
                        </SelectTrigger>
                        <SelectContent className="border-[#2a2a2a] bg-[#333333] text-[#f5f5f5]">
                          <SelectGroup>
                            <SelectLabel className="px-2 py-2 text-xs text-[#bdbdbd]">
                              Posição
                            </SelectLabel>
                            {pokemonPositions.map((position) => {
                              const alreadyUsed = pokemonConfig.pokemon.some(
                                (item, itemIndex) =>
                                  itemIndex !== index && item.position === position,
                              );

                              return (
                                <SelectItem
                                  key={position}
                                  value={position}
                                  disabled={alreadyUsed}
                                  className="py-2 text-[#f5f5f5] focus:bg-white/10 focus:text-[#f5f5f5] data-disabled:text-[#777]"
                                >
                                  {position}
                                </SelectItem>
                              );
                            })}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePokemon(index)}
                        className="shrink-0 text-[#a3a3a3] hover:bg-[#181818] hover:text-[#f5f5f5]"
                        aria-label={`Remover Pokémon ${index + 1}`}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-[#a3a3a3]">
                  Escolha o Pokémon e diga só onde ele ficará. O prompt final monta a descrição completa.
                </p>
              </Panel>
            </>
          )}

          <Panel>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <SectionTitle icon={BadgeCheck} title="Gerar insígnias" />
                <div className="mt-4 flex items-center gap-3">
                  <Switch
                    checked={badgesEnabled}
                    onCheckedChange={onBadgesChange}
                    className="border border-[#2a2a2a] data-[state=checked]:bg-[#f5f5f5] data-[state=unchecked]:bg-[#101010] [&_[data-slot=switch-thumb]]:data-[state=checked]:bg-[#050505]"
                  />
                  <span className="text-sm text-[#a3a3a3]">
                    {badgesEnabled ? "Ativado" : "Desativado"}
                  </span>
                </div>
              </div>

              <div>
                <SectionTitle icon={ImageIcon} title="Formato da imagem" />
                <Select value={format} onValueChange={(value) => onFormatChange(value as Format)}>
                  <SelectTrigger className="mt-4 h-10 w-full border-[#2a2a2a] bg-[#101010] text-[#f5f5f5] hover:bg-[#181818]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-[#2a2a2a] bg-[#333333] text-[#f5f5f5]">
                    <SelectGroup>
                      <SelectLabel className="truncate px-2 py-2 text-xs text-[#bdbdbd]">
                        Escolha a proporção da imagem
                      </SelectLabel>
                      {formats.map((item) => (
                        <SelectItem
                          key={item.label}
                          value={item.label}
                          className="py-2 text-[#f5f5f5] focus:bg-white/10 focus:text-[#f5f5f5]"
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <AspectIcon shape={item.shape} />
                            <span className="truncate">
                              {item.label.replace(` ${item.ratio}`, "")}
                              {item.ratio && <span className="ml-1 text-[#bdbdbd]">{item.ratio}</span>}
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Panel>
        </div>

        <aside className="h-fit rounded-lg border border-[#2a2a2a] bg-[#101010] p-5">
          <h2 className="text-base font-semibold">Resumo</h2>
          <div className="mt-5 aspect-square rounded-lg border border-[#2a2a2a] p-4" style={{ background }}>
            <div className="flex h-full flex-col justify-between rounded-md border border-white/10 bg-black/20 p-4">
              <span className="text-xs font-semibold text-white/70">{selectedUniverse.code}</span>
              <Sparkles className="size-8 text-white/70" aria-hidden="true" />
            </div>
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            <MetaRow label="Universo" value={selectedUniverse.label} />
            {isPokemon && <MetaRow label="Título" value={pokemonConfig.title || "Portugal"} />}
            {isPokemon && <MetaRow label="Roupa" value={pokemonConfig.outfit} />}
            {isPokemon && (
              <MetaRow
                label="Pokémon"
                value={summarizePokemonList(pokemonConfig.pokemon)}
              />
            )}
            <MetaRow label="Formato" value={format} />
            <MetaRow label="Fundo" value={background} />
            <MetaRow label="Insígnias" value={badgesEnabled ? "Ativado" : "Desativado"} />
          </dl>
          <StepActions onBack={onBack} onNext={onGenerate} nextLabel="Gerar imagem" compact />
        </aside>
      </div>
    </section>
  );
}

function PreviewStep({
  background,
  badgesEnabled,
  format,
  generationPrompt,
  pokemonConfig,
  selectedUniverse,
  onBackToSettings,
  onRegenerate,
}: {
  background: string;
  badgesEnabled: boolean;
  format: Format;
  generationPrompt: string;
  pokemonConfig: PokemonConfig;
  selectedUniverse: (typeof universes)[number];
  onBackToSettings: () => void;
  onRegenerate: () => void;
}) {
  const isPokemon = selectedUniverse.name === "Pokemon";

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <StepIntro
        eyebrow="Finalizado"
        title="Imagem gerada"
        description="Revise o resultado, baixe a imagem ou volte para refinar as configurações."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="rounded-lg border border-[#2a2a2a] bg-[#101010] p-4">
          <div className="grid min-h-[520px] place-items-center rounded-lg border border-[#2a2a2a] p-6" style={{ background }}>
            <div className="aspect-square w-full max-w-[520px] rounded-lg border border-white/10 bg-black/30 p-5">
              <div className="flex h-full flex-col justify-between rounded-md border border-white/10 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.16),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.10),rgba(0,0,0,0.35))] p-6">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-black/40 px-3 py-1 text-xs font-semibold text-white/80">
                    {selectedUniverse.label}
                  </span>
                  {badgesEnabled && (
                    <span className="flex size-9 items-center justify-center rounded-full bg-white text-[#050505]">
                      <BadgeCheck className="size-5" aria-hidden="true" />
                    </span>
                  )}
                </div>
                <div>
                  <Sparkles className="mb-4 size-12 text-white/70" aria-hidden="true" />
                  <h2 className="text-2xl font-semibold">Preview IA</h2>
                  <p className="mt-2 text-sm text-white/65">Resultado simulado para validação do fluxo.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-lg border border-[#2a2a2a] bg-[#101010] p-5">
          <div className="mb-5 flex items-center gap-2 text-sm text-[#a3a3a3]">
            <Check className="size-4 text-[#f5f5f5]" aria-hidden="true" />
            Geração concluída
          </div>
          <dl className="space-y-3 text-sm">
            <MetaRow label="Universo" value={selectedUniverse.label} />
            {isPokemon && <MetaRow label="Título" value={pokemonConfig.title || "Portugal"} />}
            {isPokemon && <MetaRow label="Roupa" value={pokemonConfig.outfit} />}
            {isPokemon && (
              <MetaRow label="Pokémon" value={summarizePokemonList(pokemonConfig.pokemon)} />
            )}
            <MetaRow label="Formato" value={`${format} · 1024x1024`} />
            <MetaRow label="Cor de fundo" value={background} />
            <MetaRow label="Insígnias" value={badgesEnabled ? "Ativado" : "Desativado"} />
          </dl>

          {isPokemon && (
            <div className="mt-6 rounded-lg border border-[#2a2a2a] bg-[#0c0c0c] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a3a3a3]">
                Prompt Pokémon
              </p>
              <p className="mt-3 line-clamp-6 whitespace-pre-wrap text-xs leading-5 text-[#d6d6d6]">
                {generationPrompt}
              </p>
            </div>
          )}

          <div className="mt-6 grid gap-3">
            <PrimaryButton onClick={() => undefined} full>
              <Download className="size-4" aria-hidden="true" />
              Baixar
            </PrimaryButton>
            <Button
              type="button"
              variant="outline"
              onClick={onRegenerate}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#2a2a2a] px-4 py-3 text-sm font-semibold transition hover:bg-[#181818]"
            >
              <RefreshCcw className="size-4" aria-hidden="true" />
              Gerar novamente
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onBackToSettings}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-[#a3a3a3] transition hover:bg-[#181818] hover:text-[#f5f5f5]"
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              Editar configurações
            </Button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function StepIntro({
  description,
  eyebrow,
  title,
}: {
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="border-b border-[#2a2a2a] pb-7">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#a3a3a3]">
        {eyebrow}
      </p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#a3a3a3]">{description}</p>
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <Card className="rounded-lg border border-[#2a2a2a] bg-[#101010] py-0">
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: true }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 text-[#a3a3a3]" aria-hidden={true} />
      <h2 className="text-sm font-semibold">{title}</h2>
    </div>
  );
}

function summarizePokemonList(pokemon: PokemonPlacement[]) {
  const activePokemon = pokemon.map((item) => item.name.trim()).filter(Boolean);

  if (activePokemon.length === 0) return "Padrão";
  if (activePokemon.length <= 2) return activePokemon.join(", ");

  return `${activePokemon.slice(0, 2).join(", ")} +${activePokemon.length - 2}`;
}

function buildPokemonPrompt({
  background,
  badgesEnabled,
  config,
  format,
}: {
  background: string;
  badgesEnabled: boolean;
  config: PokemonConfig;
  format: Format;
}) {
  const pokemonList = config.pokemon.filter((item) => item.name.trim() && item.position.trim());
  const surroundingPokemon = pokemonList.length > 0 ? pokemonList : defaultPokemonList;
  const backgroundDescription =
    backgroundPromptMap[background.toUpperCase()] ?? `${background} custom background`;
  const title = config.title.trim() || "Portugal";
  const insigniaPrompt = badgesEnabled
    ? "champion insignia patches, tactical UI symbols, magazine-cover inspired branding"
    : "no insignia patches, no tactical UI symbols, minimal clean branding";

  return `Create an ultra-detailed cinematic Pokémon poster featuring a young male Pokémon Champion standing confidently in side profile while holding a Poké Ball. The champion is based on the uploaded photo and must keep the same facial features, skin tone, hairstyle, facial structure, smile, eye shape, and overall likeness.

Style combines: semi-realistic anime painting, cinematic game poster, modern Pokémon concept art, painterly brush strokes, soft polygonal shading, highly detailed character illustration, premium trading-card aesthetic, Japanese game magazine cover design.

COMPOSITION: ${formatPromptMap[format]}, centered champion pose, ${backgroundDescription}, minimalist editorial layout.

The trainer wears ${getPokemonOutfitPrompt(config.outfit)}, metallic accessories, and ${insigniaPrompt}.

SURROUNDING POKÉMON:
${surroundingPokemon.map((pokemon) => `- ${pokemon.name.trim()} ${pokemonPositionPrompt(pokemon.position)}`).join("\n")}

LIGHTING: Soft cinematic studio lighting, warm highlights on skin, subtle rim light, volumetric atmosphere, realistic shadows, polished illustration rendering, dramatic contrast, premium movie-poster mood.

DETAILS: high detail skin texture, painterly strokes, dynamic depth, layered composition, realistic fabric folds, glossy eyes, subtle reflections, clean typography placement, esports championship vibe, modern anime realism, masterpiece quality, ultra-sharp focus.

TEXT ELEMENTS: Pokemon logo with black line and transparent fill, "${title}" large bold title on the upper left, minimalist Japanese subtitle text, clean branding aesthetics.

COLOR PALETTE: ${backgroundDescription}, black outfit details, purple neon accents, teal highlights, soft cinematic tones, balanced contrast.

QUALITY TAGS: masterpiece, best quality, ultra detailed, cinematic composition, trending on ArtStation, AAA game concept art, 8k, sharp focus, dramatic illustration, highly detailed painting. Face and body exactly same as uploaded image.

NEGATIVE PROMPT: low quality, blurry face, extra limbs, bad anatomy, deformed hands, duplicate Pokémon, messy composition, overexposed lighting, flat colors, distorted eyes, poorly drawn face, text artifacts, watermark, cropped body, unrealistic proportions.`;
}

function getPokemonOutfitPrompt(outfit: PokemonOutfit) {
  const outfitMap: Record<PokemonOutfit, string> = {
    "Jaqueta tática verde escura":
      "a futuristic dark green tactical jacket with subtle white accents, utility straps, and modern streetwear-inspired Pokémon trainer fashion",
    "Casaco preto campeão":
      "a sleek black champion coat with subtle white accents, premium tactical seams, and modern Pokémon trainer fashion",
    "Streetwear branco e preto":
      "a black and white streetwear outfit with layered technical fabrics, utility straps, and premium trainer details",
    "Uniforme futurista":
      "a futuristic champion uniform with technical panels, metallic accessories, and high-end Pokémon trainer silhouettes",
  };

  return outfitMap[outfit];
}

function pokemonPositionPrompt(position: string) {
  const normalized = position.trim();
  const positionMap: Record<string, string> = {
    "atrás do treinador": "flying behind the trainer with cinematic presence",
    "ao lado dele": "standing powerfully beside him",
    "na parte inferior": "near the lower side with intense glowing eyes",
    "no ombro": "sitting on his shoulder",
    "no primeiro plano": "near the foreground with expressive energy",
    "no canto inferior": "positioned elegantly near the bottom corner",
    "no centro inferior": "in the middle at the bottom",
    "voando acima": "flying above the champion with dramatic movement",
  };

  return positionMap[normalized] ?? `positioned ${normalized}`;
}

function AspectIcon({ shape }: { shape: string }) {
  const dimensions = {
    auto: "h-2.5 w-3.5",
    square: "size-3.5",
    portrait: "h-4 w-3",
    story: "h-[18px] w-2.5",
    landscape: "h-3 w-4",
    wide: "h-2.5 w-[18px]",
  }[shape];

  return (
    <span className="flex size-4 shrink-0 items-center justify-center">
      <span className={`rounded-[2px] border border-current ${dimensions ?? "size-3.5"}`} />
    </span>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#2a2a2a] pb-3 last:border-b-0 last:pb-0">
      <dt className="text-[#a3a3a3]">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function PrimaryButton({
  children,
  full = false,
  onClick,
}: {
  children: React.ReactNode;
  full?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[#f5f5f5] px-4 py-3 text-sm font-semibold text-[#050505] transition hover:bg-white ${
        full ? "w-full" : ""
      }`}
    >
      {children}
    </Button>
  );
}

function StepActions({
  compact = false,
  nextLabel,
  onBack,
  onNext,
}: {
  compact?: boolean;
  nextLabel: string;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 ${compact ? "mt-6" : "mt-8"}`}>
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a2a] px-4 py-3 text-sm font-semibold text-[#a3a3a3] transition hover:bg-[#181818] hover:text-[#f5f5f5]"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar
      </Button>
      <PrimaryButton onClick={onNext}>
        {nextLabel}
        <ChevronRight className="size-4" aria-hidden="true" />
      </PrimaryButton>
    </div>
  );
}
