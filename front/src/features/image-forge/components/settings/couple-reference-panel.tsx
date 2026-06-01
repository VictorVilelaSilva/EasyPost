import { Images } from "lucide-react";

import { Label } from "@/components/ui/label";

import { allowImageDrop, imageFilesFromDrop } from "../../lib/file-drop";
import type { CoupleReferences } from "../../types";
import { Panel, SectionTitle } from "../common";
import { UploadPreview } from "./upload-preview";

export function CoupleReferencePanel({
  references,
  onChange,
}: {
  references: CoupleReferences;
  onChange: (references: CoupleReferences) => void;
}) {
  return (
    <Panel>
      <SectionTitle icon={Images} title="Referências do parceiro(a)" />
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <UploadBox
          label="Rosto do parceiro(a)"
          hint="Close obrigatório da pessoa presenteada"
          files={references.face ? [references.face] : []}
          value={references.face?.name ?? "Selecionar rosto do parceiro(a)"}
          onFiles={(files) => onChange({ ...references, face: files[0] ?? null })}
        />
        <UploadBox
          label="Corpo inteiro"
          hint="Referência obrigatória da pessoa presenteada"
          files={references.bodies[0] ? [references.bodies[0]] : []}
          value={references.bodies[0]?.name ?? "Selecionar corpo inteiro"}
          onFiles={(files) => onChange({ ...references, bodies: setBodyAt(references.bodies, 0, files[0]) })}
        />
        <UploadBox
          label="Referência extra"
          hint="Foto opcional da pessoa presenteada"
          files={references.bodies[1] ? [references.bodies[1]] : []}
          value={references.bodies[1]?.name ?? "Selecionar foto extra"}
          onFiles={(files) => onChange({ ...references, bodies: setBodyAt(references.bodies, 1, files[0]) })}
        />
      </div>
    </Panel>
  );
}

function UploadBox({
  hint,
  label,
  files,
  value,
  onFiles,
}: {
  hint: string;
  label: string;
  files: File[];
  value: string;
  onFiles: (files: File[]) => void;
}) {
  return (
    <Label
      className="flex min-h-36 cursor-pointer flex-col gap-3 rounded-lg border border-dashed border-[#3a3a3a] bg-[#0c0c0c] p-4 transition hover:border-[#666] hover:bg-[#121212]"
      onDragOver={allowImageDrop}
      onDrop={(event) => onFiles(imageFilesFromDrop(event).slice(0, 1))}
    >
      <input
        className="sr-only"
        type="file"
        accept="image/*"
        onChange={(event) => onFiles(Array.from(event.target.files ?? []))}
      />
      <span className="text-sm font-semibold">{label}</span>
      <UploadPreview file={files[0] ?? null} alt={label} />
      <span className="line-clamp-2 text-sm text-[#d6d6d6]">{value}</span>
      <span className="text-xs text-[#a3a3a3]">{hint}. Clique ou arraste aqui.</span>
    </Label>
  );
}

function setBodyAt(current: File[], index: number, file: File | undefined) {
  const next = [...current];
  if (file) next[index] = file;
  return next.filter(Boolean).slice(0, 2);
}
