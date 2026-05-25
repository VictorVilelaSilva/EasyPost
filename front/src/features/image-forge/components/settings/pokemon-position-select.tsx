import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { pokemonPositions } from "../../constants";
import type { PokemonConfig } from "../../types";

export function PokemonPositionSelect({
  index,
  pokemonConfig,
  value,
  onChange,
}: {
  index: number;
  pokemonConfig: PokemonConfig;
  value: string;
  onChange: (position: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 w-full border-[#2a2a2a] bg-[#0c0c0c] text-[#f5f5f5] hover:bg-[#181818]">
        <SelectValue placeholder="Posição" />
      </SelectTrigger>
      <SelectContent className="border-[#2a2a2a] bg-[#333333] text-[#f5f5f5]">
        <SelectGroup>
          <SelectLabel className="px-2 py-2 text-xs text-[#bdbdbd]">Posição</SelectLabel>
          {pokemonPositions.map((position) => {
            const alreadyUsed = pokemonConfig.pokemon.some(
              (item, itemIndex) => itemIndex !== index && item.position === position,
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
  );
}
