"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { saveBudget } from "@/lib/budget"
import { calcTotals } from "@/lib/calculations"
import type { WizardState } from "@/types"
import Step1Client from "./Step1Client"
import Step2Area from "./Step2Area"
import Step3Materials from "./Step3Materials"
import Step4Summary from "./Step4Summary"

const STEPS = ["Cliente", "Área", "Materiais", "Resumo"]

const INITIAL_STATE: WizardState = {
  clientName: "", clientPhone: "", clientAddress: "", clientNotes: "",
  areas: [{ name: "Ambiente 1", mode: "known", knownArea: 0, coats: 2 }],
  products: [], extraItems: [],
  laborValue: 0, laborDeadline: "", paymentMethod: "", laborNotes: "",
  totalMaterials: 0, totalValue: 0,
}

interface Product {
  id: string; name: string; brand: string; packageLabel: string; yieldM2: number; price: number
}

export default function BudgetWizard({ products }: { products: Product[] }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [state, setState] = useState<WizardState>(() => {
    const defaultProduct = products[0]
    if (!defaultProduct) return INITIAL_STATE
    return {
      ...INITIAL_STATE,
      products: [{
        productId: defaultProduct.id,
        name: `${defaultProduct.name} — ${defaultProduct.packageLabel}`,
        packageLabel: defaultProduct.packageLabel,
        yieldM2: defaultProduct.yieldM2,
        unitPrice: defaultProduct.price,
        quantity: 0,
        subtotal: 0,
      }],
    }
  })
  const [saving, setSaving] = useState(false)

  function update(partial: Partial<WizardState>) {
    setState((s) => ({ ...s, ...partial }))
  }

  async function handleSave() {
    setSaving(true)
    const { totalMaterials, totalValue } = calcTotals(state.products, state.extraItems, state.laborValue)
    const finalState = { ...state, totalMaterials, totalValue }
    try {
      await saveBudget(finalState)
      toast.success("Orçamento salvo!")
      router.push("/dashboard")
    } catch {
      toast.error("Erro ao salvar orçamento.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center" style={{ minWidth: 40 }}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: i <= step ? "var(--color-primary)" : "var(--color-border)",
                  color: i <= step ? "white" : "var(--color-text-muted)",
                }}
              >
                {i + 1}
              </div>
              <span className="text-xs mt-1" style={{ color: i === step ? "var(--color-primary)" : "var(--color-text-muted)" }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mb-4" style={{ background: i < step ? "var(--color-primary)" : "var(--color-border)" }} />
            )}
          </div>
        ))}
      </div>

      {step === 0 && <Step1Client state={state} update={update} onNext={() => setStep(1)} />}
      {step === 1 && <Step2Area state={state} update={update} onBack={() => setStep(0)} onNext={() => setStep(2)} />}
      {step === 2 && <Step3Materials state={state} update={update} products={products} onBack={() => setStep(1)} onNext={() => setStep(3)} />}
      {step === 3 && <Step4Summary state={state} onBack={() => setStep(2)} onSave={handleSave} saving={saving} />}
    </div>
  )
}
