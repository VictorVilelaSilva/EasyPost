import { Camera, Glasses, Shirt, SlidersHorizontal, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { CustomPokemonOutfit, OutfitMode, PokemonConfig } from "../../types";
import { Panel, SectionTitle } from "../common";

const outfitFields: Array<{
  key: keyof CustomPokemonOutfit;
  label: string;
  placeholder: string;
}> = [
  { key: "torso", label: "Torso", placeholder: "Ex: jaqueta tática verde escura" },
  { key: "legs", label: "Pernas", placeholder: "Ex: calça cargo preta" },
  { key: "shoes", label: "Sapatos", placeholder: "Ex: tênis técnico branco" },
  { key: "glasses", label: "Óculos", placeholder: "Ex: sem óculos, óculos esportivo" },
];

export function PokemonPosterPanel({
  pokemonConfig,
  onPokemonConfigChange,
}: {
  pokemonConfig: PokemonConfig;
  onPokemonConfigChange: (config: PokemonConfig) => void;
}) {
  function updateOutfitMode(mode: OutfitMode) {
    onPokemonConfigChange({ ...pokemonConfig, outfit: { ...pokemonConfig.outfit, mode } });
  }

  function updateCustomOutfit(patch: Partial<CustomPokemonOutfit>) {
    onPokemonConfigChange({
      ...pokemonConfig,
      outfit: {
        ...pokemonConfig.outfit,
        custom: { ...pokemonConfig.outfit.custom, ...patch },
      },
    });
  }

  return (
    <Panel>
      <div className="grid min-w-0 gap-5 md:grid-cols-2">
        <div className="min-w-0">
          <SectionTitle icon={Sparkles} title="Nome do treinador" />
          <Input
            value={pokemonConfig.title}
            onChange={(event) =>
              onPokemonConfigChange({ ...pokemonConfig, title: event.target.value })
            }
            placeholder="Portugal"
            className="mt-4 h-10 border-[#2a2a2a] bg-[#0c0c0c] text-[#f5f5f5] placeholder:text-[#666] focus-visible:ring-[#f5f5f5]/30"
          />
        </div>

        <div className="min-w-0">
          <SectionTitle icon={SlidersHorizontal} title="Roupa do treinador" />
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <OutfitModeButton
              active={pokemonConfig.outfit.mode === "photo"}
              icon={Camera}
              label="Herdar da foto"
              onClick={() => updateOutfitMode("photo")}
            />
            <OutfitModeButton
              active={pokemonConfig.outfit.mode === "custom"}
              icon={Shirt}
              label="Personalizar"
              onClick={() => updateOutfitMode("custom")}
            />
          </div>
        </div>
      </div>

      {pokemonConfig.outfit.mode === "custom" && (
        <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2">
          {outfitFields.map((field) => (
            <OutfitInput
              key={field.key}
              label={field.label}
              placeholder={field.placeholder}
              value={pokemonConfig.outfit.custom[field.key]}
              onChange={(value) => updateCustomOutfit({ [field.key]: value })}
            />
          ))}
          <div className="min-w-0 md:col-span-2">
            <SectionTitle icon={Glasses} title="Boné ou chapéu opcional" />
            <Input
              value={pokemonConfig.outfit.custom.hat}
              onChange={(event) => updateCustomOutfit({ hat: event.target.value })}
              placeholder="Ex: boné preto, bucket hat, sem acessório..."
              className="mt-4 h-10 border-[#2a2a2a] bg-[#0c0c0c] text-[#f5f5f5] placeholder:text-[#666] focus-visible:ring-[#f5f5f5]/30"
            />
          </div>
        </div>
      )}
    </Panel>
  );
}

function OutfitModeButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof Camera;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className={`h-10 justify-start border-[#2a2a2a] px-3 text-[#f5f5f5] hover:bg-[#181818] ${active ? "bg-[#f5f5f5] text-[#050505] hover:bg-white" : "bg-[#101010]"}`}
    >
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </Button>
  );
}

function OutfitInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a3a3a3]">{label}</p>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-10 border-[#2a2a2a] bg-[#0c0c0c] text-[#f5f5f5] placeholder:text-[#666] focus-visible:ring-[#f5f5f5]/30"
      />
    </div>
  );
}
