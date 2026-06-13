"use client"
import { useEffect } from "react"
import { calcPaintableArea, calcAreaForPaint, calcPackages, calcTotals, formatCurrency } from "@/lib/calculations"
import { Plus, Trash2, PaintBucket, ArrowLeft, ArrowRight } from "lucide-react"
import type { WizardState, WizardExtraItem } from "@/types"
import CurrencyInput from "@/components/CurrencyInput"
import DecimalInput from "@/components/DecimalInput"
import DeadlineInput from "@/components/DeadlineInput"
import PaymentMethodSelect from "@/components/PaymentMethodSelect"

interface Product { id: string; name: string; brand: string; packageLabel: string; yieldM2: number; price: number }

interface Props {
  state: WizardState
  update: (p: Partial<WizardState>) => void
  products: Product[]
  onBack: () => void
  onNext: () => void
}

const inputClass =
  "px-3 py-2.5 rounded-lg border border-[#e2e8f0] text-sm outline-none transition-all focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"

export default function Step3Materials({ state, update, onBack, onNext }: Props) {
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
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-headline font-extrabold tracking-tight">Materiais e mão de obra</h2>
        <p className="mt-2" style={{ color: "var(--color-text-muted)" }}>
          Quantidade de tinta calculada automaticamente. Ajuste se precisar.
        </p>
      </div>

      {/* Tinta principal */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "var(--color-text-muted)" }}>
          Tinta principal
        </h3>
        {state.products.map((p, i) => (
          <div
            key={p.productId}
            className="p-5 rounded-xl border shadow-sm"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "#eff6ff", color: "var(--color-primary)" }}
              >
                <PaintBucket size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium">{p.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                  Rendimento: {p.yieldM2} m²/embalagem · {formatCurrency(p.unitPrice)}/embalagem
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-center gap-3">
                <label className="text-sm" htmlFor={`qty-${p.productId}`}>Quantidade</label>
                <input
                  id={`qty-${p.productId}`}
                  type="number"
                  min={0}
                  value={p.quantity}
                  onChange={(e) => updateProductQty(i, parseInt(e.target.value) || 0)}
                  className={`w-20 text-center ${inputClass}`}
                />
              </div>
              <span className="text-lg font-bold">{formatCurrency(p.subtotal)}</span>
            </div>
          </div>
        ))}
        {state.products.length === 0 && (
          <p className="text-sm p-4 rounded-xl border" style={{ color: "var(--color-text-muted)", borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
            Nenhuma tinta cadastrada. Cadastre um produto na área administrativa.
          </p>
        )}
      </div>

      {/* Itens extras */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "var(--color-text-muted)" }}>
          Itens extras
        </h3>
        <div className="flex flex-col gap-2">
          {state.extraItems.map((item, i) => (
            <div key={item.id ?? i} className="flex gap-2 items-start">
              <input
                placeholder="Nome do item"
                value={item.name}
                onChange={(e) => updateExtra(i, { name: e.target.value })}
                className={`flex-1 ${inputClass}`}
              />
              <DecimalInput
                value={item.quantity}
                onChange={(v) => updateExtra(i, { quantity: v })}
                placeholder="Qtd"
                className={`w-16 text-center ${inputClass}`}
              />
              <div className="w-28">
                <CurrencyInput
                  value={item.unitPrice}
                  onChange={(v) => updateExtra(i, { unitPrice: v })}
                  className={`w-full ${inputClass}`}
                />
              </div>
              <button
                onClick={() => removeExtra(i)}
                className="p-2.5 rounded-lg text-red-500 transition-colors hover:bg-red-50"
                aria-label="Remover item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addExtra}
          className="w-full mt-2 py-3 rounded-xl border-2 border-dashed font-medium flex items-center justify-center gap-2 transition-all hover:border-[#2563eb] hover:text-[#2563eb]"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        >
          <Plus size={16} /> Adicionar item extra
        </button>
      </div>

      {/* Mão de obra */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "var(--color-text-muted)" }}>
          Mão de obra
        </h3>
        <div
          className="rounded-xl border shadow-sm p-6 flex flex-col gap-4"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          <div>
            <label className="text-sm font-medium block mb-1.5">Valor do serviço</label>
            <CurrencyInput
              value={state.laborValue}
              onChange={(v) => update({ laborValue: v })}
              className={`w-full ${inputClass}`}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Prazo estimado</label>
            <DeadlineInput
              value={state.laborDeadline}
              onChange={(v) => update({ laborDeadline: v })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Forma de pagamento</label>
            <PaymentMethodSelect
              value={state.paymentMethod}
              onChange={(v) => update({ paymentMethod: v })}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Observações do serviço</label>
            <input
              value={state.laborNotes}
              onChange={(e) => update({ laborNotes: e.target.value })}
              className={`w-full ${inputClass}`}
            />
          </div>
        </div>
      </div>

      <div className="px-6 py-4 rounded-xl flex justify-between items-center" style={{ background: "#eff6ff" }}>
        <span className="font-semibold" style={{ color: "var(--color-primary)" }}>Subtotal materiais</span>
        <span className="text-xl font-headline font-extrabold" style={{ color: "var(--color-primary)" }}>
          {formatCurrency(totalMaterials)}
        </span>
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
          onClick={onNext}
          className="px-8 py-3 rounded-lg text-sm font-semibold text-white flex items-center gap-2 shadow-sm transition-all hover:brightness-110 active:scale-95"
          style={{ background: "var(--color-primary)" }}
        >
          Ver resumo <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
