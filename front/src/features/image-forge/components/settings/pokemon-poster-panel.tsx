import { Camera, Glasses, Shirt, SlidersHorizontal, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { glassesOptions, legOptions, shoeOptions, torsoOptions } from "../../constants";
import type { CustomPokemonOutfit, OutfitMode, PokemonConfig } from "../../types";
import { Panel, SectionTitle } from "../common";

const outfitFields: Array<{
  key: keyof CustomPokemonOutfit;
  label: string;
  options: string[];
}> = [
  { key: "torso", label: "Torso", options: torsoOptions },
  { key: "legs", label: "Pernas", options: legOptions },
  { key: "shoes", label: "Sapatos", options: shoeOptions },
  { key: "glasses", label: "Óculos", options: glassesOptions },
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
            <OutfitSelect
              key={field.key}
              label={field.label}
              options={field.options}
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

function OutfitSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a3a3a3]">{label}</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="mt-2 h-10 w-full border-[#2a2a2a] bg-[#101010] text-[#f5f5f5] hover:bg-[#181818]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-w-[calc(100vw-2rem)] border-[#2a2a2a] bg-[#333333] text-[#f5f5f5]">
          <SelectGroup>
            <SelectLabel className="px-2 py-2 text-xs text-[#bdbdbd]">{label}</SelectLabel>
            {options.map((option) => (
              <SelectItem
                key={option}
                value={option}
                className="py-2 whitespace-normal text-[#f5f5f5] focus:bg-white/10 focus:text-[#f5f5f5]"
              >
                {option}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
