import { Check, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

import { universes } from "../constants";
import type { Universe } from "../types";
import { StepActions, StepIntro } from "./common";

export function UniverseStep({
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
              className={`group flex h-auto flex-col items-stretch justify-start rounded-lg border bg-[#101010] p-4 text-left transition hover:bg-[#181818] ${isSelected ? "border-[#f5f5f5]" : "border-[#2a2a2a]"}`}
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
