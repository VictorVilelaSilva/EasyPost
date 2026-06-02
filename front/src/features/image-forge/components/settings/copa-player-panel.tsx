import { Trophy } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { CopaConfig } from "../../types";
import { Panel, SectionTitle } from "../common";

export function CopaPlayerPanel({
  config,
  onChange,
}: {
  config: CopaConfig;
  onChange: (config: CopaConfig) => void;
}) {
  return (
    <Panel>
      <SectionTitle icon={Trophy} title="Dados da figurinha" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Nome" value={config.name} onChange={(name) => onChange({ ...config, name })} />
        <Field
          label="Data de nascimento"
          placeholder="05/02/1992"
          value={config.birthDate}
          onChange={(birthDate) => onChange({ ...config, birthDate })}
        />
        <Field
          label="Altura em metros"
          inputMode="decimal"
          placeholder="1,75"
          value={config.height}
          onChange={(height) => onChange({ ...config, height })}
        />
        <Field
          label="Peso"
          inputMode="numeric"
          placeholder="68kg"
          value={config.weight}
          onChange={(weight) => onChange({ ...config, weight })}
        />
        <div className="sm:col-span-2">
          <Field
            label="Clube que torce"
            placeholder="SANTOS FUTEBOL CLUBE (BRA)"
            value={config.club}
            onChange={(club) => onChange({ ...config, club })}
          />
        </div>
      </div>
    </Panel>
  );
}

function Field({
  inputMode,
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  inputMode?: "decimal" | "numeric";
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a3a3a3]">
        {label}
      </span>
      <Input
        inputMode={inputMode}
        required
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 border-[#2a2a2a] bg-[#181818] text-[#f5f5f5] placeholder:text-[#737373]"
      />
    </Label>
  );
}
