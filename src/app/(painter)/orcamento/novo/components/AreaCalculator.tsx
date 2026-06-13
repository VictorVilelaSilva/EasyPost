"use client"
import { Ruler, DoorOpen, AppWindow, Layers, Trash2 } from "lucide-react"
import { calcPaintableArea, calcAreaForPaint } from "@/lib/calculations"
import type { AreaInput } from "@/types"
import DecimalInput from "@/components/DecimalInput"

interface Props {
  area: AreaInput
  onChange: (updated: AreaInput) => void
  onRemove?: () => void
}

const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-[#e2e8f0] text-sm outline-none transition-all focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"

const fieldLabel = "block text-xs font-medium mb-1"

export default function AreaCalculator({ area, onChange, onRemove }: Props) {
  function set(partial: Partial<AreaInput>) {
    onChange({ ...area, ...partial })
  }

  const paintable = calcPaintableArea(area)
  const forPaint = calcAreaForPaint(paintable, area.coats)

  return (
    <div
      className="rounded-xl border shadow-sm p-6 sm:p-8"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      {/* Name + remove */}
      <div className="flex justify-between items-start gap-4 mb-6">
        <div className="flex-1 max-w-sm">
          <label className="block text-sm font-medium mb-1.5">Nome do ambiente</label>
          <input value={area.name} onChange={(e) => set({ name: e.target.value })} className={inputClass} />
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remover ambiente"
            className="p-2 mt-7 rounded-lg transition-colors hover:bg-red-50 text-red-500"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Mode toggle (segmented) */}
      <div
        className="flex p-1 rounded-xl mb-8"
        style={{ background: "var(--color-surface-secondary)" }}
      >
        {(["known", "calculate"] as const).map((m) => {
          const activeMode = area.mode === m
          return (
            <button
              key={m}
              type="button"
              onClick={() => onChange({ ...area, mode: m })}
              className="flex-1 py-2 rounded-lg text-sm font-semibold text-center transition-all"
              style={{
                background: activeMode ? "var(--color-surface)" : "transparent",
                color: activeMode ? "var(--color-primary)" : "var(--color-text-muted)",
                boxShadow: activeMode ? "0 1px 2px rgba(0,0,0,0.06)" : undefined,
              }}
            >
              {m === "known" ? "Já sei a metragem" : "Calcular agora"}
            </button>
          )
        })}
      </div>

      {area.mode === "known" && (
        <div>
          <label className="block text-sm font-medium mb-1.5">Área total (m²)</label>
          <DecimalInput
            placeholder="Ex: 25,5"
            value={area.knownArea}
            onChange={(v) => set({ knownArea: v })}
            className={inputClass}
          />
        </div>
      )}

      {area.mode === "calculate" && (
        <div className="space-y-8">
          {/* Paredes */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Ruler size={18} style={{ color: "var(--color-primary)" }} />
              <h3 className="font-headline font-bold">Paredes</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={fieldLabel} style={{ color: "var(--color-text-muted)" }}>Altura parede (m)</label>
                <DecimalInput placeholder="2,70" value={area.wallHeight} onChange={(v) => set({ wallHeight: v })} className={inputClass} />
              </div>
              <div>
                <label className={fieldLabel} style={{ color: "var(--color-text-muted)" }}>Largura total (m)</label>
                <DecimalInput placeholder="10,00" value={area.wallWidth} onChange={(v) => set({ wallWidth: v })} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Portas e Janelas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <DoorOpen size={18} style={{ color: "var(--color-primary)" }} />
                <h3 className="font-headline font-bold">Portas</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className={fieldLabel} style={{ color: "var(--color-text-muted)" }}>Qtd. portas</label>
                  <DecimalInput integer placeholder="0" value={area.doorsCount} onChange={(v) => set({ doorsCount: v })} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={fieldLabel} style={{ color: "var(--color-text-muted)" }}>Alt. (m)</label>
                    <DecimalInput placeholder="2,10" value={area.doorHeight} onChange={(v) => set({ doorHeight: v })} className={inputClass} />
                  </div>
                  <div>
                    <label className={fieldLabel} style={{ color: "var(--color-text-muted)" }}>Larg. (m)</label>
                    <DecimalInput placeholder="0,80" value={area.doorWidth} onChange={(v) => set({ doorWidth: v })} className={inputClass} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <AppWindow size={18} style={{ color: "var(--color-primary)" }} />
                <h3 className="font-headline font-bold">Janelas</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className={fieldLabel} style={{ color: "var(--color-text-muted)" }}>Qtd. janelas</label>
                  <DecimalInput integer placeholder="0" value={area.windowsCount} onChange={(v) => set({ windowsCount: v })} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={fieldLabel} style={{ color: "var(--color-text-muted)" }}>Alt. (m)</label>
                    <DecimalInput placeholder="1,20" value={area.windowHeight} onChange={(v) => set({ windowHeight: v })} className={inputClass} />
                  </div>
                  <div>
                    <label className={fieldLabel} style={{ color: "var(--color-text-muted)" }}>Larg. (m)</label>
                    <DecimalInput placeholder="1,50" value={area.windowWidth} onChange={(v) => set({ windowWidth: v })} className={inputClass} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Demãos */}
      <div className="mt-6 pt-6 border-t" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={18} style={{ color: "var(--color-primary)" }} />
            <label htmlFor={`coats-${area.id ?? area.name}`} className="font-headline font-bold">
              Número de demãos
            </label>
          </div>
          <input
            id={`coats-${area.id ?? area.name}`}
            type="number"
            min={1}
            max={5}
            value={area.coats}
            onChange={(e) => set({ coats: parseInt(e.target.value) || 1 })}
            className="w-24 px-3 py-2.5 rounded-lg border border-[#e2e8f0] text-sm text-center font-bold outline-none transition-all focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
          />
        </div>
      </div>

      {/* Result box */}
      {forPaint > 0 && (
        <div className="mt-6 rounded-xl p-6 flex flex-col items-center text-center" style={{ background: "#eff6ff" }}>
          <p className="font-headline font-bold text-2xl" style={{ color: "var(--color-primary)" }}>
            Área para tinta: {forPaint.toFixed(1)} m²
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            ({paintable.toFixed(1)} m² × {area.coats} demãos)
          </p>
        </div>
      )}
    </div>
  )
}
