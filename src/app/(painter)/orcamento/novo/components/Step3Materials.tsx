"use client"
import { useEffect } from "react"
import { calcPaintableArea, calcAreaForPaint, calcPackages, calcTotals, formatCurrency, parseDecimal } from "@/lib/calculations"
import { Plus, Trash2 } from "lucide-react"
import type { WizardState, WizardExtraItem } from "@/types"

interface Product { id: string; name: string; brand: string; packageLabel: string; yieldM2: number; price: number }

interface Props {
  state: WizardState
  update: (p: Partial<WizardState>) => void
  products: Product[]
  onBack: () => void
  onNext: () => void
}

export default function Step3Materials({ state, update, products, onBack, onNext }: Props) {
  const totalAreaForPaint = state.areas.reduce(
    (sum, a) => sum + calcAreaForPaint(calcPaintableArea(a), a.coats),
    0
  )

  useEffect(() => {
    if (state.products.length === 0) return
    const updated = state.products.map((p) => {
      const qty = calcPackages(totalAreaForPaint, p.yieldM2)
      return { ...p, quantity: qty, subtotal: qty * p.unitPrice }
    })
    update({ products: updated })
  }, [totalAreaForPaint, update])

  function updateProductQty(index: number, qty: number) {
    const updated = [...state.products]
    updated[index] = { ...updated[index], quantity: qty, subtotal: qty * updated[index].unitPrice }
    update({ products: updated })
  }

  function addExtra() {
    update({ extraItems: [...state.extraItems, { id: crypto.randomUUID(), name: "", quantity: 1, unitPrice: 0, subtotal: 0 }] })
  }

  function updateExtra(index: number, partial: Partial<WizardExtraItem>) {
    const updated = [...state.extraItems]
    const item = { ...updated[index], ...partial }
    item.subtotal = item.quantity * item.unitPrice
    updated[index] = item
    update({ extraItems: updated })
  }

  function removeExtra(index: number) {
    update({ extraItems: state.extraItems.filter((_, i) => i !== index) })
  }

  const { totalMaterials } = calcTotals(state.products, state.extraItems, 0)

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold">Materiais e mão de obra</h2>

      <div>
        <h3 className="text-sm font-semibold mb-3">Tinta principal</h3>
        {state.products.map((p, i) => (
          <div key={p.productId} className="p-4 rounded-xl border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
            <p className="font-medium text-sm">{p.name}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              Rendimento: {p.yieldM2} m²/embalagem · {formatCurrency(p.unitPrice)}/embalagem
            </p>
            <div className="flex items-center gap-3 mt-3">
              <label className="text-sm">Quantidade:</label>
              <input
                type="number"
                min={0}
                value={p.quantity}
                onChange={(e) => updateProductQty(i, parseInt(e.target.value) || 0)}
                className="w-20 px-2 py-1 rounded border text-sm text-center"
                style={{ borderColor: "var(--color-border)" }}
              />
              <span className="text-sm font-semibold">{formatCurrency(p.subtotal)}</span>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Itens extras</h3>
        {state.extraItems.map((item, i) => (
          <div key={item.id ?? i} className="flex gap-2 mb-2 items-start">
            <input
              placeholder="Nome do item"
              value={item.name}
              onChange={(e) => updateExtra(i, { name: e.target.value })}
              className="flex-1 px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: "var(--color-border)" }}
            />
            <input
              type="text"
              placeholder="Qtd"
              value={item.quantity}
              onChange={(e) => updateExtra(i, { quantity: parseDecimal(e.target.value) })}
              className="w-16 px-2 py-2 rounded-lg border text-sm text-center"
              style={{ borderColor: "var(--color-border)" }}
            />
            <input
              type="text"
              placeholder="R$ unit."
              value={item.unitPrice || ""}
              onChange={(e) => updateExtra(i, { unitPrice: parseDecimal(e.target.value) })}
              className="w-24 px-2 py-2 rounded-lg border text-sm"
              style={{ borderColor: "var(--color-border)" }}
            />
            <button onClick={() => removeExtra(i)} className="p-2 text-red-400" aria-label="Remover item"><Trash2 size={14} /></button>
          </div>
        ))}
        <button
          type="button"
          onClick={addExtra}
          className="w-full py-2 rounded-lg text-sm border-dashed border-2 flex items-center justify-center gap-1"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        >
          <Plus size={14} /> Adicionar item extra
        </button>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Mão de obra</h3>
        <div className="flex flex-col gap-3">
          <div key="laborValue">
            <label className="text-sm font-medium block mb-1">Valor do serviço (R$)</label>
            <input
              value={String(state.laborValue || "")}
              onChange={(e) => update({ laborValue: parseDecimal(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: "var(--color-border)" }}
            />
          </div>
          {(["laborDeadline", "paymentMethod", "laborNotes"] as const).map((key) => {
            type StringLaborKey = "laborDeadline" | "paymentMethod" | "laborNotes"
            const labels: Record<StringLaborKey, string> = {
              laborDeadline: "Prazo estimado",
              paymentMethod: "Forma de pagamento",
              laborNotes: "Observações do serviço",
            }
            return (
              <div key={key}>
                <label className="text-sm font-medium block mb-1">{labels[key]}</label>
                <input
                  value={state[key]}
                  onChange={(e) => update({ [key]: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "var(--color-border)" }}
                />
              </div>
            )
          })}
        </div>
      </div>

      <div className="p-3 rounded-lg text-sm" style={{ background: "#eff6ff" }}>
        Subtotal materiais: <strong>{formatCurrency(totalMaterials)}</strong>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-2 rounded-lg text-sm border" style={{ borderColor: "var(--color-border)" }}>
          ← Voltar
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "var(--color-primary)" }}
        >
          Ver resumo →
        </button>
      </div>
    </div>
  )
}
