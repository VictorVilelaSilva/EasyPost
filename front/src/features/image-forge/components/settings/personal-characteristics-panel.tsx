import { UserRound } from "lucide-react";

import { Label } from "@/components/ui/label";

import { Panel, SectionTitle } from "../common";

export function PersonalCharacteristicsPanel({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Panel>
      <SectionTitle icon={UserRound} title="Características pessoais" />
      <Label className="mt-4 block text-xs font-semibold uppercase tracking-[0.14em] text-[#a3a3a3]">
        Personalidade, estilo e detalhes
      </Label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={1200}
        rows={6}
        placeholder="Ex: pessoa extrovertida, irônica, fã de tecnologia, energia confiante, estilo urbano, gosta de futebol e referências retrô..."
        className="mt-2 min-h-36 w-full resize-y rounded-lg border border-[#2a2a2a] bg-[#181818] px-3 py-3 text-sm leading-6 text-[#f5f5f5] outline-none transition placeholder:text-[#737373] focus:border-[#666]"
      />
      <p className="mt-2 text-xs leading-5 text-[#a3a3a3]">
        Esse campo só aparece para prompts que usam traços de personalidade ou história pessoal.
      </p>
    </Panel>
  );
}
