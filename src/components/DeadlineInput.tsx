"use client"
import { useState } from "react"

interface Props {
  value: string
  onChange: (value: string) => void
  className?: string
  id?: string
}

type UnitKey = "hora" | "dia" | "semana" | "mes"

const UNITS: { key: UnitKey; singular: string; plural: string }[] = [
  { key: "hora", singular: "hora", plural: "horas" },
  { key: "dia", singular: "dia", plural: "dias" },
  { key: "semana", singular: "semana", plural: "semanas" },
  { key: "mes", singular: "mês", plural: "meses" },
]

function compose(count: string, unitKey: UnitKey): string {
  const n = parseInt(count, 10)
  if (!n || n < 1) return ""
  const unit = UNITS.find((u) => u.key === unitKey)!
  return `${n} ${n === 1 ? unit.singular : unit.plural}`
}

function parse(value: string): { count: string; unit: UnitKey } {
  const m = value.match(/^(\d+)\s+(.*)$/)
  if (!m) return { count: "", unit: "dia" }
  const word = m[2].toLowerCase()
  const unit =
    UNITS.find((u) => word.startsWith(u.singular) || word.startsWith(u.plural))?.key ?? "dia"
  return { count: m[1], unit }
}

export default function DeadlineInput({ value, onChange, className = "", id }: Props) {
  const initial = parse(value)
  const [count, setCount] = useState(initial.count)
  const [unit, setUnit] = useState<UnitKey>(initial.unit)

  function update(nextCount: string, nextUnit: UnitKey) {
    setCount(nextCount)
    setUnit(nextUnit)
    onChange(compose(nextCount, nextUnit))
  }

  return (
    <div className="flex gap-2">
      <input
        id={id}
        type="number"
        min={1}
        inputMode="numeric"
        value={count}
        onChange={(e) => update(e.target.value.replace(/\D/g, ""), unit)}
        placeholder="1"
        className={`w-20 text-center ${className}`}
      />
      <select
        value={unit}
        onChange={(e) => update(count, e.target.value as UnitKey)}
        className={`flex-1 ${className}`}
        aria-label="Unidade de prazo"
      >
        {UNITS.map((u) => (
          <option key={u.key} value={u.key}>
            {parseInt(count, 10) === 1 ? u.singular : u.plural}
          </option>
        ))}
      </select>
    </div>
  )
}
