"use client"
import { useState } from "react"
import { Plus } from "lucide-react"
import { createProduct } from "@/lib/products"
import { toast } from "sonner"
import CurrencyInput from "@/components/CurrencyInput"
import DecimalInput from "@/components/DecimalInput"

const inputClass =
  "w-full px-4 py-2 rounded-lg border border-[#e2e8f0] text-sm outline-none transition-all focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"

function parseNum(v: FormDataEntryValue | null): number {
  const n = parseFloat(String(v ?? ""))
  if (isNaN(n)) throw new Error("Valor numérico inválido")
  return n
}

export default function ProductForm() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [packageSize, setPackageSize] = useState<number>(0)
  const [yieldM2, setYieldM2] = useState<number>(0)
  const [price, setPrice] = useState<number>(0)

  function resetNumerics() {
    setPackageSize(0)
    setYieldM2(0)
    setPrice(0)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const fd = new FormData(form)
    try {
      await createProduct({
        name: fd.get("name"),
        brand: fd.get("brand"),
        line: fd.get("line") || undefined,
        finish: fd.get("finish") || undefined,
        packageSize: parseNum(fd.get("packageSize")),
        packageLabel: fd.get("packageLabel"),
        yieldM2: parseNum(fd.get("yieldM2")),
        price: parseNum(fd.get("price")),
        notes: fd.get("notes") || undefined,
      })
      toast.success("Produto criado!")
      form.reset()
      resetNumerics()
      setOpen(false)
    } catch {
      toast.error("Erro ao criar produto.")
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white flex items-center gap-2 shadow-sm transition-all hover:brightness-110 active:scale-95"
        style={{ background: "var(--color-primary)" }}
      >
        <Plus size={18} /> Novo produto
      </button>
    )
  }

  const fields = [
    { name: "name", label: "Nome *", required: true, placeholder: "Ex: Tinta Acrílica Premium" },
    { name: "brand", label: "Marca *", required: true, placeholder: "Ex: Coral" },
    { name: "line", label: "Linha", placeholder: "Ex: Rende Muito" },
    { name: "finish", label: "Acabamento", placeholder: "Ex: Fosco, Acetinado" },
    { name: "packageSize", label: "Tamanho embalagem (L ou kg) *", kind: "decimal", placeholder: "Ex: 18" },
    { name: "packageLabel", label: "Label embalagem *", required: true, placeholder: "Ex: lata 18L" },
    { name: "yieldM2", label: "Rendimento (m²/embalagem) *", kind: "decimal", placeholder: "Ex: 50" },
    { name: "price", label: "Preço *", kind: "currency", placeholder: "0,00" },
  ] as const

  const numericValue = { packageSize, yieldM2, price } as const
  const numericSetter = { packageSize: setPackageSize, yieldM2: setYieldM2, price: setPrice } as const

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border shadow-sm overflow-hidden"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      <div className="px-6 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <h3 className="font-headline font-bold text-lg">Novo produto</h3>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {fields.map((field) => {
            const { name, label, placeholder } = field
            const kind = "kind" in field ? field.kind : undefined
            return (
              <div key={name}>
                <label className="block text-sm font-medium mb-1.5" htmlFor={name} style={{ color: "var(--color-text-muted)" }}>
                  {label}
                </label>
                {kind === "currency" ? (
                  <CurrencyInput
                    id={name}
                    name={name}
                    value={numericValue[name as keyof typeof numericValue]}
                    onChange={numericSetter[name as keyof typeof numericSetter]}
                    placeholder={placeholder}
                    className={inputClass}
                  />
                ) : kind === "decimal" ? (
                  <DecimalInput
                    id={name}
                    name={name}
                    value={numericValue[name as keyof typeof numericValue]}
                    onChange={numericSetter[name as keyof typeof numericSetter]}
                    placeholder={placeholder}
                    className={inputClass}
                  />
                ) : (
                  <input
                    id={name}
                    name={name}
                    type="text"
                    required={"required" in field ? field.required : undefined}
                    placeholder={placeholder}
                    className={inputClass}
                  />
                )}
              </div>
            )
          })}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1.5" htmlFor="notes" style={{ color: "var(--color-text-muted)" }}>
              Observações
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Informações adicionais sobre o uso ou aplicação"
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>
      </div>

      <div
        className="px-6 py-4 border-t flex justify-end gap-3"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface-secondary)" }}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-5 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-[var(--color-surface)]"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
          style={{ background: "var(--color-primary)" }}
        >
          {loading ? "Salvando..." : "Salvar produto"}
        </button>
      </div>
    </form>
  )
}
