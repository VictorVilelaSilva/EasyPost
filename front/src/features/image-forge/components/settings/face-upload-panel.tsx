import { Upload } from "lucide-react";

import { Label } from "@/components/ui/label";

import { allowImageDrop, imageFilesFromDrop } from "../../lib/file-drop";
import { Panel, SectionTitle } from "../common";
import { UploadPreview } from "./upload-preview";

export function FaceUploadPanel({
  file,
  uploadedName,
  onFileChange,
}: {
  file: File | null;
  uploadedName: string;
  onFileChange: (file: File) => void;
}) {
  return (
    <Panel>
      <SectionTitle icon={Upload} title="Imagem de rosto" />
      <Label
        className="mt-4 grid cursor-pointer gap-4 rounded-lg border border-dashed border-[#3a3a3a] bg-[#0c0c0c] p-4 transition hover:border-[#666] hover:bg-[#121212] sm:grid-cols-[180px_minmax(0,1fr)]"
        onDragOver={allowImageDrop}
        onDrop={(event) => {
          const file = imageFilesFromDrop(event)[0];
          if (file) onFileChange(file);
        }}
      >
        <input
          className="sr-only"
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFileChange(file);
          }}
        />
        <UploadPreview file={file} alt="Preview da imagem de rosto" />
        <span className="flex min-w-0 flex-col justify-center text-left">
          <Upload className="size-6 text-[#a3a3a3]" aria-hidden="true" />
          <span className="mt-3 truncate text-sm font-semibold">{uploadedName}</span>
          <span className="mt-1 text-xs text-[#a3a3a3]">
            Clique ou arraste PNG/JPG até 10 MB
          </span>
        </span>
      </Label>
    </Panel>
  );
}
