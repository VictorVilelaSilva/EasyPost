"use client"

interface Props {
  value: number
  onChange: (value: number) => void
  /** Se informado, renderiza um input hidden para uso em <form> com FormData */
  name?: string
  placeholder?: string
  className?: string
  id?: string
}

function formatBRL(n: number): string {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * Input de moeda no padrão brasileiro com máscara "centavos primeiro":
 * digitar 1 → R$ 0,01, 10 → R$ 0,10, 100 → R$ 1,00 ...
 */
export default function CurrencyInput({ value, onChange, name, placeholder = "0,00", className = "", id }: Props) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "")
    const cents = digits === "" ? 0 : parseInt(digits, 10)
    onChange(cents / 100)
  }

  return (
    <div className="relative">
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none select-none"
        style={{ color: "var(--color-text-muted)" }}
      >
        R$
      </span>
      <input
        id={id}
        inputMode="numeric"
        value={value ? formatBRL(value) : ""}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
        style={{ paddingLeft: "2.25rem" }}
      />
      {name && <input type="hidden" name={name} value={value} />}
    </div>
  )
}
