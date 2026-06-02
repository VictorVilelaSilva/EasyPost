import { Lock } from "lucide-react";

import { Panel, SectionTitle } from "../common";

export function LockedFormatPanel() {
  return (
    <Panel>
      <SectionTitle icon={Lock} title="Formato da imagem" />
      <div className="mt-4 rounded-lg border border-[#2a2a2a] bg-[#181818] px-3 py-3">
        <p className="text-sm font-semibold">Retrato 3:4</p>
        <p className="mt-1 text-xs text-[#a3a3a3]">
          Formato travado para preservar a composição da figurinha.
        </p>
      </div>
    </Panel>
  );
}
