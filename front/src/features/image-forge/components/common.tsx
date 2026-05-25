import { ArrowLeft, ChevronRight } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function StepIntro({
  description,
  eyebrow,
  title,
}: {
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="min-w-0 border-b border-[#2a2a2a] pb-6 sm:pb-7">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#a3a3a3]">
        {eyebrow}
      </p>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#a3a3a3]">{description}</p>
    </div>
  );
}

export function Panel({ children }: { children: ReactNode }) {
  return (
    <Card className="rounded-lg border border-[#2a2a2a] bg-[#101010] py-0">
      <CardContent className="p-4 sm:p-5">{children}</CardContent>
    </Card>
  );
}

export function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: true }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 text-[#a3a3a3]" aria-hidden={true} />
      <h2 className="text-sm font-semibold">{title}</h2>
    </div>
  );
}

export function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(90px,auto)_minmax(0,1fr)] items-start gap-3 border-b border-[#2a2a2a] pb-3 last:border-b-0 last:pb-0">
      <dt className="text-[#a3a3a3]">{label}</dt>
      <dd className="min-w-0 break-words text-right font-medium">{value}</dd>
    </div>
  );
}

export function PrimaryButton({
  children,
  full = false,
  onClick,
}: {
  children: ReactNode;
  full?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 whitespace-normal rounded-lg bg-[#f5f5f5] px-4 py-3 text-sm font-semibold text-[#050505] transition hover:bg-white ${full ? "w-full" : "w-full sm:w-auto"}`}
    >
      {children}
    </Button>
  );
}

export function StepActions({
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
    <div
      className={`flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center ${compact ? "mt-6" : "mt-8"}`}
    >
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#2a2a2a] px-4 py-3 text-sm font-semibold text-[#a3a3a3] transition hover:bg-[#181818] hover:text-[#f5f5f5] sm:w-auto"
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

export function AspectIcon({ shape }: { shape: string }) {
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
