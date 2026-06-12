"use client"
import { useState } from "react"
import { calcPaintableArea, calcAreaForPaint, parseDecimal } from "@/lib/calculations"
import type { AreaInput } from "@/types"

interface Props {
  area: AreaInput
  onChange: (updated: AreaInput) => void
}

export default function AreaCalculator({ area, onChange }: Props) {
  const [mode, setMode] = useState<"known" | "calculate">(area.mode)

  function set(partial: Partial<AreaInput>) {
    const updated = { ...area, ...partial, mode }
    onChange(updated)
  }

  const paintable = calcPaintableArea({ ...area, mode })
  const forPaint = calcAreaForPaint(paintable, area.coats)

  return (
    <div className="rounded-xl border p-4" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
      <div className="mb-3">
        <label className="text-sm font-medium block mb-1">Nome do ambiente</label>
        <input
          value={area.name}
          onChange={(e) => set({ name: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: "var(--color-border)" }}
        />
      </div>

      <div className="flex gap-2 mb-4">
        {(["known", "calculate"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); onChange({ ...area, mode: m }) }}
            className="flex-1 py-2 rounded-lg text-sm font-medium border"
            style={{
              background: mode === m ? "var(--color-primary)" : "var(--color-surface)",
              color: mode === m ? "white" : "var(--color-text-muted)",
              borderColor: mode === m ? "var(--color-primary)" : "var(--color-border)",
            }}
          >
            {m === "known" ? "Já sei a metragem" : "Calcular agora"}
          </button>
        ))}
      </div>

      {mode === "known" && (
        <div>
          <label className="text-sm font-medium block mb-1">Área total (m²)</label>
          <input
            type="text"
            placeholder="Ex: 25,5 ou 25.5"
            value={area.knownArea ?? ""}
            onChange={(e) => set({ knownArea: parseDecimal(e.target.value) })}
            className="w-full px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: "var(--color-border)" }}
          />
        </div>
      )}

      {mode === "calculate" && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "wallHeight", label: "Altura parede (m)" },
            { key: "wallWidth", label: "Largura parede (m)" },
            { key: "doorsCount", label: "Qtd. portas" },
            { key: "doorHeight", label: "Altura porta (m)" },
            { key: "doorWidth", label: "Largura porta (m)" },
            { key: "windowsCount", label: "Qtd. janelas" },
            { key: "windowHeight", label: "Altura janela (m)" },
            { key: "windowWidth", label: "Largura janela (m)" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs font-medium block mb-1">{label}</label>
              <input
                type="text"
                placeholder="0"
                value={area[key as keyof AreaInput] ?? ""}
                onChange={(e) => set({ [key]: parseDecimal(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: "var(--color-border)" }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-3">
        <label className="text-sm font-medium block mb-1">Demãos</label>
        <input
          type="number"
          min={1}
          max={5}
          value={area.coats}
          onChange={(e) => set({ coats: parseInt(e.target.value) || 1 })}
          className="w-24 px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: "var(--color-border)" }}
        />
      </div>

      {forPaint > 0 && (
        <div className="mt-3 p-3 rounded-lg text-sm" style={{ background: "#eff6ff" }}>
          <span className="font-semibold">Área para tinta: {forPaint.toFixed(1)} m²</span>
          <span className="text-xs ml-2" style={{ color: "var(--color-text-muted)" }}>
            ({paintable.toFixed(1)} m² × {area.coats} demãos)
          </span>
        </div>
      )}
    </div>
  )
}
