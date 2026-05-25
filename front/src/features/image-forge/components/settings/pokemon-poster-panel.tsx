import { SlidersHorizontal, Sparkles } from "lucide-react";

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

import { pokemonOutfits } from "../../constants";
import type { PokemonConfig, PokemonOutfit } from "../../types";
import { Panel, SectionTitle } from "../common";

export function PokemonPosterPanel({
  pokemonConfig,
  onPokemonConfigChange,
}: {
  pokemonConfig: PokemonConfig;
  onPokemonConfigChange: (config: PokemonConfig) => void;
}) {
  return (
    <Panel>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <SectionTitle icon={Sparkles} title="Título do poster" />
          <Input
            value={pokemonConfig.title}
            onChange={(event) =>
              onPokemonConfigChange({ ...pokemonConfig, title: event.target.value })
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
              onPokemonConfigChange({ ...pokemonConfig, outfit: value as PokemonOutfit })
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
  );
}
