"use client"
import { Plus } from "lucide-react"
import { calcPaintableArea, calcAreaForPaint } from "@/lib/calculations"
import AreaCalculator from "./AreaCalculator"
import type { WizardState, AreaInput } from "@/types"

interface Props {
  state: WizardState
  update: (p: Partial<WizardState>) => void
  onBack: () => void
  onNext: () => void
}

export default function Step2Area({ state, update, onBack, onNext }: Props) {
  function updateArea(index: number, updated: AreaInput) {
    const areas = [...state.areas]
    areas[index] = updated
    update({ areas })
  }

  function addArea() {
    update({
      areas: [
        ...state.areas,
        { name: `Ambiente ${state.areas.length + 1}`, mode: "known", knownArea: 0, coats: 2 },
      ],
    })
  }

  function removeArea(index: number) {
    update({ areas: state.areas.filter((_, i) => i !== index) })
  }

  const totalForPaint = state.areas.reduce(
    (sum, a) => sum + calcAreaForPaint(calcPaintableArea(a), a.coats),
    0
  )

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Cálculo de área</h2>

      {state.areas.map((area, i) => (
        <div key={i} className="relative">
          <AreaCalculator area={area} onChange={(u) => updateArea(i, u)} />
          {state.areas.length > 1 && (
            <button
              type="button"
              onClick={() => removeArea(i)}
              className="absolute top-3 right-3 text-xs text-red-500"
            >
              Remover
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addArea}
        className="w-full py-2 rounded-lg text-sm border-dashed border-2 flex items-center justify-center gap-1"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
      >
        <Plus size={14} /> Adicionar outro ambiente
      </button>

      {totalForPaint > 0 && (
        <div className="p-3 rounded-lg text-sm font-semibold" style={{ background: "#eff6ff", color: "var(--color-primary)" }}>
          Total para tinta: {totalForPaint.toFixed(1)} m²
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-2 rounded-lg text-sm border" style={{ borderColor: "var(--color-border)" }}>
          ← Voltar
        </button>
        <button
          onClick={onNext}
          disabled={totalForPaint === 0}
          className="flex-1 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: totalForPaint === 0 ? "#93c5fd" : "var(--color-primary)" }}
        >
          Próximo →
        </button>
      </div>
    </div>
  )
}
