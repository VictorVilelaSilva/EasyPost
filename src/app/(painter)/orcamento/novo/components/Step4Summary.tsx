"use client"
import { calcPaintableArea, calcAreaForPaint, calcTotals, formatCurrency } from "@/lib/calculations"
import { ArrowLeft, Check } from "lucide-react"
import type { WizardState } from "@/types"

interface Props {
  state: WizardState
  onBack: () => void
  onSave: () => void
  saving: boolean
}

const cardClass = "rounded-xl border shadow-sm p-6"
const cardStyle = { borderColor: "var(--color-border)", background: "var(--color-surface)" } as const
const sectionTitle = "text-xs font-bold uppercase tracking-widest mb-3"

export default function Step4Summary({ state, onBack, onSave, saving }: Props) {
  const { totalMaterials, totalValue } = calcTotals(state.products, state.extraItems, state.laborValue)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-headline font-extrabold tracking-tight">Resumo do orçamento</h2>
        <p className="mt-2" style={{ color: "var(--color-text-muted)" }}>
          Confira tudo antes de salvar.
        </p>
      </div>

      {/* Cliente */}
      <div className={cardClass} style={cardStyle}>
        <p className={sectionTitle} style={{ color: "var(--color-text-muted)" }}>Cliente</p>
        <p className="font-headline font-bold text-lg">{state.clientName}</p>
        {state.clientPhone && <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{state.clientPhone}</p>}
        {state.clientAddress && <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{state.clientAddress}</p>}
      </div>

      {/* Áreas */}
      <div className={cardClass} style={cardStyle}>
        <p className={sectionTitle} style={{ color: "var(--color-text-muted)" }}>Áreas</p>
        <div className="divide-y divide-[#e2e8f0]">
          {state.areas.map((a, i) => {
            const forPaint = calcAreaForPaint(calcPaintableArea(a), a.coats)
            return (
              <div key={a.id ?? i} className="flex justify-between text-sm py-2 first:pt-0 last:pb-0">
                <span className="font-medium">{a.name}</span>
                <span style={{ color: "var(--color-text-muted)" }}>
                  {forPaint.toFixed(1)} m² ({a.coats} demãos)
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Materiais */}
      <div className={cardClass} style={cardStyle}>
        <p className={sectionTitle} style={{ color: "var(--color-text-muted)" }}>Materiais</p>
        <div className="space-y-2">
          {state.products.map((p) => (
            <div key={p.productId} className="flex justify-between text-sm">
              <span>{p.name} × {p.quantity}</span>
              <span className="font-medium">{formatCurrency(p.subtotal)}</span>
            </div>
          ))}
          {state.extraItems.map((e, i) => (
            <div key={e.id ?? i} className="flex justify-between text-sm">
              <span>{e.name} × {e.quantity}</span>
              <span className="font-medium">{formatCurrency(e.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="border-t mt-3 pt-3 flex justify-between text-sm font-semibold" style={{ borderColor: "var(--color-border)" }}>
          <span>Subtotal materiais</span>
          <span>{formatCurrency(totalMaterials)}</span>
        </div>
      </div>

      {/* Mão de obra */}
      <div className={cardClass} style={cardStyle}>
        <p className={sectionTitle} style={{ color: "var(--color-text-muted)" }}>Mão de obra</p>
        <div className="flex justify-between text-sm">
          <span>Valor do serviço</span>
          <span className="font-medium">{formatCurrency(state.laborValue)}</span>
        </div>
        {state.laborDeadline && <p className="text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>Prazo: {state.laborDeadline}</p>}
        {state.paymentMethod && <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Pagamento: {state.paymentMethod}</p>}
      </div>

      {/* Total */}
      <div className="rounded-xl p-6 text-white shadow-lg" style={{ background: "var(--color-primary)" }}>
        <div className="flex justify-between items-center">
          <span className="text-xs uppercase font-bold tracking-widest opacity-80">Total estimado</span>
          <span className="text-3xl font-headline font-extrabold">{formatCurrency(totalValue)}</span>
        </div>
        <p className="text-xs mt-2 opacity-75">* Estimativa. Valores podem variar conforme condições da obra.</p>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-lg border font-semibold text-sm flex items-center gap-2 transition-colors hover:bg-[var(--color-surface-secondary)]"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        >
          <ArrowLeft size={18} /> Voltar
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-8 py-3 rounded-lg text-sm font-semibold text-white flex items-center gap-2 shadow-sm transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
          style={{ background: "var(--color-primary)" }}
        >
          <Check size={18} /> {saving ? "Salvando..." : "Salvar orçamento"}
        </button>
      </div>
    </div>
  )
}
