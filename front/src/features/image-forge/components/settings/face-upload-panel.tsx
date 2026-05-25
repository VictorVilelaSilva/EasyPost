import { Upload } from "lucide-react";

import { Label } from "@/components/ui/label";

import { Panel, SectionTitle } from "../common";

export function FaceUploadPanel({
  uploadedName,
  onFileChange,
}: {
  uploadedName: string;
  onFileChange: (name: string) => void;
}) {
  return (
    <Panel>
      <SectionTitle icon={Upload} title="Imagem de rosto" />
      <Label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#3a3a3a] bg-[#0c0c0c] px-6 py-10 text-center transition hover:border-[#666] hover:bg-[#121212]">
        <input
          className="sr-only"
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFileChange(file.name);
          }}
        />
        <Upload className="size-6 text-[#a3a3a3]" aria-hidden="true" />
        <span className="mt-3 text-sm font-semibold">{uploadedName}</span>
        <span className="mt-1 text-xs text-[#a3a3a3]">PNG ou JPG até 10 MB</span>
      </Label>
    </Panel>
  );
}
