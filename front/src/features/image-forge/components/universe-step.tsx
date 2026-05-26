import { Check, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

import { universes } from "../constants";
import type { Universe, UniverseOption } from "../types";
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
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <StepIntro
        eyebrow="Passo 1 de 3"
        title="Escolha o universo da imagem"
        description="Defina a direção visual antes de enviar o rosto e os detalhes da geração."
      />

      <div className="mt-6 grid auto-rows-fr gap-4 sm:grid-cols-2 lg:mt-8 xl:grid-cols-4 2xl:grid-cols-5">
        {universes.map((item) => {
          const isSelected = item.name === selected;

          return (
            <UniverseCard
              key={item.name}
              isSelected={isSelected}
              item={item}
              onSelect={onSelect}
            />
          );
        })}
      </div>

      <StepActions onBack={onBack} onNext={onNext} nextLabel="Continuar" />
    </section>
  );
}

function UniverseCard({
  isSelected,
  item,
  onSelect,
}: {
  isSelected: boolean;
  item: UniverseOption;
  onSelect: (universe: Universe) => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => onSelect(item.name)}
      className={`group flex min-h-[280px] min-w-0 flex-col items-stretch justify-start overflow-hidden whitespace-normal rounded-lg border bg-[#101010] p-3 text-left transition hover:bg-[#181818] sm:min-h-[292px] sm:p-4 xl:min-h-[320px] ${isSelected ? "border-[#f5f5f5] bg-[#171717]" : "border-[#2a2a2a]"}`}
    >
      <div className="relative h-[156px] shrink-0 overflow-hidden rounded-md border border-[#2a2a2a] bg-[#181818] p-2 sm:h-[166px] sm:p-3 xl:h-[184px]">
        <div className="flex h-full flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <span className="text-xs font-semibold text-[#a3a3a3]">{item.code}</span>
            {isSelected && (
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#f5f5f5] text-[#050505]">
                <Check className="size-4" aria-hidden="true" />
              </span>
            )}
          </div>
          <div className="grid min-h-0 flex-1 place-items-center overflow-hidden rounded-md border border-[#2a2a2a] bg-[#0e0e0e] px-3 py-2 sm:px-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt="" className="block h-full w-full object-contain object-center" />
          </div>
        </div>
        <Sparkles className="absolute bottom-3 left-3 size-4 text-[#a3a3a3] sm:size-5" aria-hidden="true" />
      </div>
      <h2 className="mt-3 min-w-0 truncate text-base font-semibold">{item.label}</h2>
      <p className="mt-2 line-clamp-2 min-w-0 text-sm leading-5 text-[#a3a3a3]">
        {item.description}
      </p>
    </Button>
  );
}
