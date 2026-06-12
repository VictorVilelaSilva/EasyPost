"use client"
import { calcPaintableArea, calcAreaForPaint, calcTotals, formatCurrency } from "@/lib/calculations"
import type { WizardState } from "@/types"

interface Props {
  state: WizardState
  onBack: () => void
  onSave: () => void
  saving: boolean
}

export default function Step4Summary({ state, onBack, onSave, saving }: Props) {
  const { totalMaterials, totalValue } = calcTotals(state.products, state.extraItems, state.laborValue)

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-semibold">Resumo do orçamento</h2>

      <div className="p-4 rounded-xl border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <p className="font-semibold">{state.clientName}</p>
        {state.clientPhone && <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{state.clientPhone}</p>}
        {state.clientAddress && <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{state.clientAddress}</p>}
      </div>

      <div className="p-4 rounded-xl border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <p className="text-sm font-semibold mb-3">Áreas</p>
        {state.areas.map((a, i) => {
          const paintable = calcPaintableArea(a)
          const forPaint = calcAreaForPaint(paintable, a.coats)
          return (
            <div key={i} className="flex justify-between text-sm py-1">
              <span>{a.name}</span>
              <span>{forPaint.toFixed(1)} m² ({a.coats} demãos)</span>
            </div>
          )
        })}
      </div>

      <div className="p-4 rounded-xl border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <p className="text-sm font-semibold mb-3">Materiais</p>
        {state.products.map((p, i) => (
          <div key={i} className="flex justify-between text-sm py-1">
            <span>{p.name} × {p.quantity}</span>
            <span>{formatCurrency(p.subtotal)}</span>
          </div>
        ))}
        {state.extraItems.map((e, i) => (
          <div key={i} className="flex justify-between text-sm py-1">
            <span>{e.name} × {e.quantity}</span>
            <span>{formatCurrency(e.subtotal)}</span>
          </div>
        ))}
        <div className="border-t mt-2 pt-2 flex justify-between text-sm font-semibold" style={{ borderColor: "var(--color-border)" }}>
          <span>Subtotal materiais</span>
          <span>{formatCurrency(totalMaterials)}</span>
        </div>
      </div>

      <div className="p-4 rounded-xl border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="flex justify-between text-sm py-1">
          <span>Mão de obra</span>
          <span>{formatCurrency(state.laborValue)}</span>
        </div>
        {state.laborDeadline && <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Prazo: {state.laborDeadline}</p>}
        {state.paymentMethod && <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Pagamento: {state.paymentMethod}</p>}
      </div>

      <div className="p-4 rounded-xl" style={{ background: "var(--color-primary)", color: "white" }}>
        <div className="flex justify-between items-center">
          <span className="font-semibold">TOTAL</span>
          <span className="text-xl font-bold">{formatCurrency(totalValue)}</span>
        </div>
        <p className="text-xs mt-1 opacity-75">* Estimativa. Valores podem variar.</p>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-2 rounded-lg text-sm border" style={{ borderColor: "var(--color-border)" }}>
          ← Voltar
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex-1 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: saving ? "#93c5fd" : "var(--color-primary)" }}
        >
          {saving ? "Salvando..." : "Salvar orçamento"}
        </button>
      </div>
    </div>
  )
}
