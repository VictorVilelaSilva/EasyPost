import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { PokemonSummary } from "../../types";

export function PokemonOption({
  disabled,
  pokemon,
  onAdd,
}: {
  disabled: boolean;
  pokemon: PokemonSummary;
  onAdd: (pokemon: PokemonSummary) => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => onAdd(pokemon)}
      disabled={disabled}
      className="h-auto justify-start gap-3 border-[#2a2a2a] bg-[#101010] px-3 py-2 text-left hover:bg-[#181818]"
    >
      {pokemon.sprite_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={pokemon.sprite_url} alt="" className="size-9 rounded-md bg-black/30 object-contain" />
      ) : (
        <span className="grid size-9 place-items-center rounded-md bg-black/30">
          <Sparkles className="size-4 text-[#a3a3a3]" aria-hidden="true" />
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{pokemon.display_name}</span>
        <span className="block truncate text-xs text-[#a3a3a3]">
          #{pokemon.id.toString().padStart(4, "0")}
        </span>
      </span>
    </Button>
  );
}
