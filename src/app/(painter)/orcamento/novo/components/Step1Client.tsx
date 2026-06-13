"use client"
import { ArrowRight } from "lucide-react"
import type { WizardState } from "@/types"

interface Props {
  state: WizardState
  update: (p: Partial<WizardState>) => void
  onNext: () => void
}

const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-[#e2e8f0] text-sm outline-none transition-all focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"

function maskPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11)
  if (d.length <= 2) return d.replace(/(\d{0,2})/, "($1")
  if (d.length <= 6) return d.replace(/(\d{2})(\d{0,4})/, "($1) $2")
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3")
}

export default function Step1Client({ state, update, onNext }: Props) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!state.clientName.trim()) return
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-headline font-extrabold tracking-tight">Dados do cliente</h2>
        <p className="mt-2" style={{ color: "var(--color-text-muted)" }}>
          Para quem é este orçamento?
        </p>
      </div>

      <div
        className="rounded-xl border shadow-sm p-6 sm:p-8 flex flex-col gap-4"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <div>
          <label htmlFor="clientName" className="text-sm font-medium block mb-1.5">
            Nome do cliente <span style={{ color: "var(--color-primary)" }}>*</span>
          </label>
          <input
            id="clientName"
            value={state.clientName}
            onChange={(e) => update({ clientName: e.target.value })}
            required
            placeholder="Ex: João Silva"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="clientPhone" className="text-sm font-medium block mb-1.5">
            Telefone
          </label>
          <input
            id="clientPhone"
            type="tel"
            inputMode="tel"
            value={state.clientPhone}
            onChange={(e) => update({ clientPhone: maskPhone(e.target.value) })}
            placeholder="(00) 00000-0000"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="clientAddress" className="text-sm font-medium block mb-1.5">
            Endereço da obra
          </label>
          <input
            id="clientAddress"
            value={state.clientAddress}
            onChange={(e) => update({ clientAddress: e.target.value })}
            placeholder="Rua, número — cidade"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="clientNotes" className="text-sm font-medium block mb-1.5">
            Observações gerais
          </label>
          <textarea
            id="clientNotes"
            value={state.clientNotes}
            onChange={(e) => update({ clientNotes: e.target.value })}
            rows={3}
            placeholder="Detalhes do serviço, preferências do cliente..."
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-8 py-3 rounded-lg text-sm font-semibold text-white flex items-center gap-2 shadow-sm transition-all hover:brightness-110 active:scale-95"
          style={{ background: "var(--color-primary)" }}
        >
          Próximo <ArrowRight size={18} />
        </button>
      </div>
    </form>
  )
}
