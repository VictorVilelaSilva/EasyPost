"use client"
import { Fragment, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check } from "lucide-react"
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
  areas: [{ id: crypto.randomUUID(), name: "Ambiente 1", mode: "known", knownArea: 0, coats: 2 }],
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

  const update = useCallback((partial: Partial<WizardState>) => {
    setState((s) => ({ ...s, ...partial }))
  }, [])

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
      <div className="flex items-center mb-10">
        {STEPS.map((label, i) => {
          const completed = i < step
          const current = i === step
          return (
            <Fragment key={i}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                  style={{
                    background: completed || current ? "var(--color-primary)" : "var(--color-surface)",
                    color: completed || current ? "white" : "var(--color-text-muted)",
                    border: completed || current ? "none" : "2px solid var(--color-border)",
                    boxShadow: current ? "0 0 0 4px rgba(37,99,235,0.15)" : undefined,
                  }}
                >
                  {completed ? <Check size={18} /> : i + 1}
                </div>
                <span
                  className="text-xs font-semibold"
                  style={{ color: completed || current ? "var(--color-primary)" : "var(--color-text-muted)" }}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="flex-1 h-0.5 mx-2 mb-6 rounded"
                  style={{ background: i < step ? "var(--color-primary)" : "var(--color-border)" }}
                />
              )}
            </Fragment>
          )
        })}
      </div>

      {step === 0 && <Step1Client state={state} update={update} onNext={() => setStep(1)} />}
      {step === 1 && <Step2Area state={state} update={update} onBack={() => setStep(0)} onNext={() => setStep(2)} />}
      {step === 2 && <Step3Materials state={state} update={update} products={products} onBack={() => setStep(1)} onNext={() => setStep(3)} />}
      {step === 3 && <Step4Summary state={state} onBack={() => setStep(2)} onSave={handleSave} saving={saving} />}
    </div>
  )
}
