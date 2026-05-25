import { Check, Palette } from "lucide-react";

import { Label } from "@/components/ui/label";

import { backgroundColors } from "../../constants";
import { Panel, SectionTitle } from "../common";

export function BackgroundPanel({
  background,
  onBackgroundChange,
}: {
  background: string;
  onBackgroundChange: (color: string) => void;
}) {
  return (
    <Panel>
      <SectionTitle icon={Palette} title="Cor de fundo" />
      <div className="mt-4 grid grid-cols-6 gap-3 sm:grid-cols-8 md:grid-cols-12">
        {backgroundColors.map((color) => {
          const selected = color.toLowerCase() === background.toLowerCase();

          return (
            <button
              key={color}
              type="button"
              onClick={() => onBackgroundChange(color)}
              className={`relative size-10 rounded-lg border transition hover:scale-105 ${selected ? "border-[#f5f5f5]" : "border-[#2a2a2a]"}`}
              style={{ backgroundColor: color }}
              aria-label={`Selecionar cor ${color}`}
            >
              {selected && (
                <span className="absolute inset-0 grid place-items-center rounded-lg bg-black/20">
                  <Check className="size-4 text-white drop-shadow" aria-hidden="true" />
                </span>
              )}
            </button>
          );
        })}
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
  );
}
