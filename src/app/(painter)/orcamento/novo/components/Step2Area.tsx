"use client"
import { PlusCircle, ArrowLeft, ArrowRight } from "lucide-react"
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
        { id: crypto.randomUUID(), name: `Ambiente ${state.areas.length + 1}`, mode: "known", knownArea: 0, coats: 2 },
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
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-headline font-extrabold tracking-tight">Cálculo de área</h2>
        <p className="mt-2" style={{ color: "var(--color-text-muted)" }}>
          Defina as dimensões dos ambientes para calcular a quantidade de tinta.
        </p>
      </div>

      {state.areas.map((area, i) => (
        <AreaCalculator
          key={area.id ?? i}
          area={area}
          onChange={(u) => updateArea(i, u)}
          onRemove={state.areas.length > 1 ? () => removeArea(i) : undefined}
        />
      ))}

      <button
        type="button"
        onClick={addArea}
        className="w-full py-4 rounded-xl border-2 border-dashed font-semibold flex items-center justify-center gap-2 transition-all hover:border-[#2563eb] hover:text-[#2563eb]"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
      >
        <PlusCircle size={18} /> Adicionar outro ambiente
      </button>

      {totalForPaint > 0 && (
        <div
          className="px-6 py-4 rounded-xl flex justify-between items-center"
          style={{ background: "#eff6ff" }}
        >
          <span className="font-semibold" style={{ color: "var(--color-primary)" }}>
            Total acumulado para pintura
          </span>
          <span className="text-xl font-headline font-extrabold" style={{ color: "var(--color-primary)" }}>
            {totalForPaint.toFixed(1)} m²
          </span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-lg border font-semibold text-sm flex items-center gap-2 transition-colors hover:bg-[var(--color-surface-secondary)]"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        >
          <ArrowLeft size={18} /> Voltar
        </button>
        <button
          onClick={onNext}
          disabled={totalForPaint === 0}
          className="px-8 py-3 rounded-lg text-sm font-semibold text-white flex items-center gap-2 shadow-sm transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:hover:brightness-100"
          style={{ background: "var(--color-primary)" }}
        >
          Próximo <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
