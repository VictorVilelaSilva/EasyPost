"use client"
import { useState } from "react"
import { parseDecimal } from "@/lib/calculations"

interface Props {
  value: number | undefined
  onChange: (value: number) => void
  /** Se true, não permite vírgula/decimais (qtd. inteiras) */
  integer?: boolean
  /** Se informado, renderiza um input hidden para uso em <form> com FormData */
  name?: string
  placeholder?: string
  className?: string
  id?: string
}

function toText(value: number | undefined): string {
  if (value == null || value === 0) return ""
  return String(value).replace(".", ",")
}

/**
 * Input numérico que aceita e exibe vírgula como separador decimal,
 * preservando exatamente o que o usuário digita (ex: "2," enquanto digita).
 * Emite o valor já convertido para número.
 */
export default function DecimalInput({ value, onChange, integer, name, placeholder, className = "", id }: Props) {
  const [text, setText] = useState(() => toText(value))

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let v = e.target.value

    if (integer) {
      v = v.replace(/\D/g, "")
    } else {
      // aceita vírgula ou ponto, normaliza ponto -> vírgula, só dígitos e uma vírgula
      v = v.replace(/\./g, ",").replace(/[^0-9,]/g, "")
      const first = v.indexOf(",")
      if (first !== -1) {
        v = v.slice(0, first + 1) + v.slice(first + 1).replace(/,/g, "")
      }
    }

    setText(v)
    onChange(parseDecimal(v))
  }

  return (
    <>
      <input
        id={id}
        inputMode={integer ? "numeric" : "decimal"}
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
      />
      {name && <input type="hidden" name={name} value={parseDecimal(text)} />}
    </>
  )
}
