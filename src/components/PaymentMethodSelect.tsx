"use client"
import { useState } from "react"
import {
  QrCode,
  Banknote,
  CreditCard,
  WalletCards,
  Barcode,
  Landmark,
  CalendarDays,
  Check,
  Plus,
  X,
} from "lucide-react"

interface Props {
  /** String com as formas escolhidas separadas por ", " */
  value: string
  onChange: (value: string) => void
}

const PRESETS = [
  { label: "Pix", icon: QrCode },
  { label: "Dinheiro", icon: Banknote },
  { label: "Cartão de crédito", icon: CreditCard },
  { label: "Cartão de débito", icon: WalletCards },
  { label: "Boleto", icon: Barcode },
  { label: "Transferência", icon: Landmark },
  { label: "Parcelado", icon: CalendarDays },
] as const

const PRESET_LABELS: string[] = PRESETS.map((p) => p.label)

function split(value: string): string[] {
  return value ? value.split(", ").map((s) => s.trim()).filter(Boolean) : []
}

export default function PaymentMethodSelect({ value, onChange }: Props) {
  const [custom, setCustom] = useState("")
  const selected = split(value)

  function emit(next: string[]) {
    // remove duplicados preservando ordem
    onChange([...new Set(next)].join(", "))
  }

  function toggle(label: string) {
    if (selected.includes(label)) {
      emit(selected.filter((s) => s !== label))
    } else {
      emit([...selected, label])
    }
  }

  function addCustom() {
    const v = custom.trim()
    if (!v) return
    emit([...selected, v])
    setCustom("")
  }

  const customChips = selected.filter((s) => !PRESET_LABELS.includes(s))

  return (
    <div role="group" aria-label="Forma de pagamento" className="flex flex-col gap-3">
      {/* Chips de presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map(({ label, icon: Icon }) => {
          const active = selected.includes(label)
          return (
            <button
              key={label}
              type="button"
              onClick={() => toggle(label)}
              aria-pressed={active}
              className="group inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all active:scale-95"
              style={{
                borderColor: active ? "var(--color-primary)" : "var(--color-border)",
                background: active ? "#eff6ff" : "var(--color-surface)",
                color: active ? "var(--color-primary)" : "var(--color-text-muted)",
                boxShadow: active ? "0 0 0 3px rgba(37,99,235,0.12)" : undefined,
              }}
            >
              {active ? <Check size={15} strokeWidth={2.5} /> : <Icon size={15} />}
              {label}
            </button>
          )
        })}
      </div>

      {/* Formas personalizadas adicionadas */}
      {customChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customChips.map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
              style={{ background: "#eff6ff", color: "var(--color-primary)" }}
            >
              {label}
              <button
                type="button"
                onClick={() => emit(selected.filter((s) => s !== label))}
                aria-label={`Remover ${label}`}
                className="rounded-full p-0.5 transition-colors hover:bg-[var(--color-primary)]/10"
              >
                <X size={13} strokeWidth={2.5} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Adicionar forma personalizada */}
      <div className="flex gap-2">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addCustom()
            }
          }}
          placeholder="Outra forma (ex: 50% entrada + 50% na entrega)"
          className="flex-1 px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm outline-none transition-all focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!custom.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-40 hover:bg-[var(--color-surface-secondary)]"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        >
          <Plus size={15} /> Adicionar
        </button>
      </div>
    </div>
  )
}
