import { Check, Sparkles } from "lucide-react";

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
    <div className="min-w-0 rounded-lg border border-[#2a2a2a] bg-[#101010] p-3 transition hover:border-[#555] hover:bg-[#181818]">
      <div className="relative grid aspect-[4/3] place-items-center rounded-md border border-[#2a2a2a] bg-[#0c0c0c] p-4">
        <span className="absolute left-3 top-3 rounded bg-black/40 px-2 py-1 font-mono text-xs text-[#a3a3a3]">
          #{pokemon.id.toString().padStart(4, "0")}
        </span>
        {pokemon.artwork_url || pokemon.sprite_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pokemon.artwork_url ?? pokemon.sprite_url ?? ""}
            alt=""
            className="h-full max-h-36 w-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]"
          />
        ) : (
          <span className="grid size-20 place-items-center rounded-md bg-black/30">
            <Sparkles className="size-6 text-[#a3a3a3]" aria-hidden="true" />
          </span>
        )}
      </div>

      <div className="mt-3 min-w-0">
        <h3 className="truncate text-sm font-semibold">{pokemon.display_name}</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {pokemon.types.map((type) => (
            <span
              key={type}
              className="rounded border border-[#2a2a2a] bg-[#0c0c0c] px-2 py-1 text-xs text-[#a3a3a3]"
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => onAdd(pokemon)}
        disabled={disabled}
        className="mt-3 h-9 w-full border-[#f5f5f5] bg-[#181818] text-[#f5f5f5] transition hover:-translate-y-0.5 hover:border-white hover:bg-[#2a2a2a] hover:text-white hover:shadow-[0_8px_24px_rgba(255,255,255,0.08)]"
      >
        <Check className="size-4" aria-hidden="true" />
        Selecionar
      </Button>
    </div>
  );
}
