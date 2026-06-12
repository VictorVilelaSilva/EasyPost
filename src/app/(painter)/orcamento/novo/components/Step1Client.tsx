"use client"
import type { WizardState } from "@/types"

interface Props {
  state: WizardState
  update: (p: Partial<WizardState>) => void
  onNext: () => void
}

type StringClientKey = "clientName" | "clientPhone" | "clientAddress" | "clientNotes"

export default function Step1Client({ state, update, onNext }: Props) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!state.clientName.trim()) return
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Dados do cliente</h2>
      {(
        [
          { key: "clientName" as StringClientKey, label: "Nome do cliente *", required: true },
          { key: "clientPhone" as StringClientKey, label: "Telefone", required: false },
          { key: "clientAddress" as StringClientKey, label: "Endereço da obra", required: false },
          { key: "clientNotes" as StringClientKey, label: "Observações gerais", required: false },
        ] as const
      ).map(({ key, label, required }) => (
        <div key={key}>
          <label className="text-sm font-medium block mb-1">{label}</label>
          <input
            value={state[key]}
            onChange={(e) => update({ [key]: e.target.value })}
            required={required}
            className="w-full px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: "var(--color-border)" }}
          />
        </div>
      ))}
      <button
        type="submit"
        className="w-full py-2 rounded-lg text-sm font-medium text-white mt-2"
        style={{ background: "var(--color-primary)" }}
      >
        Próximo →
      </button>
    </form>
  )
}
