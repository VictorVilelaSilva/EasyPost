import { BadgeCheck, ImageIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { formats } from "../../constants";
import type { Format } from "../../types";
import { AspectIcon, Panel, SectionTitle } from "../common";

export function GenerationOptionsPanel({
  badgesEnabled,
  format,
  onBadgesChange,
  onFormatChange,
}: {
  badgesEnabled: boolean;
  format: Format;
  onBadgesChange: (enabled: boolean) => void;
  onFormatChange: (format: Format) => void;
}) {
  return (
    <Panel>
      <div className="grid min-w-0 gap-5 md:grid-cols-2">
        <div className="min-w-0">
          <SectionTitle icon={BadgeCheck} title="Gerar insígnias" />
          <div className="mt-4 flex items-center gap-3">
            <Switch
              checked={badgesEnabled}
              onCheckedChange={onBadgesChange}
              className="border border-[#2a2a2a] data-[state=checked]:bg-[#f5f5f5] data-[state=unchecked]:bg-[#101010] [&_[data-slot=switch-thumb]]:data-[state=checked]:bg-[#050505]"
            />
            <span className="text-sm text-[#a3a3a3]">
              {badgesEnabled ? "Ativado" : "Desativado"}
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <SectionTitle icon={ImageIcon} title="Formato da imagem" />
          <Select value={format} onValueChange={(value) => onFormatChange(value as Format)}>
            <SelectTrigger className="mt-4 h-10 w-full border-[#2a2a2a] bg-[#101010] text-[#f5f5f5] hover:bg-[#181818]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-w-[calc(100vw-2rem)] border-[#2a2a2a] bg-[#333333] text-[#f5f5f5]">
              <SelectGroup>
                <SelectLabel className="truncate px-2 py-2 text-xs text-[#bdbdbd]">
                  Escolha a proporção da imagem
                </SelectLabel>
                {formats.map((item) => (
                  <SelectItem
                    key={item.label}
                    value={item.label}
                    className="py-2 text-[#f5f5f5] focus:bg-white/10 focus:text-[#f5f5f5]"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <AspectIcon shape={item.shape} />
                      <span className="truncate">
                        {item.label.replace(` ${item.ratio}`, "")}
                        {item.ratio && <span className="ml-1 text-[#bdbdbd]">{item.ratio}</span>}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Panel>
  );
}
