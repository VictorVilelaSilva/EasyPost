"use client"
import { useState } from "react"
import { createProduct } from "@/lib/products"
import { toast } from "sonner"

function parseNum(v: FormDataEntryValue | null): number {
  const n = parseFloat(String(v ?? ""))
  if (isNaN(n)) throw new Error("Valor numérico inválido")
  return n
}

export default function ProductForm() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
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
        className="px-4 py-2 rounded-lg text-sm font-medium text-white"
        style={{ background: "var(--color-primary)" }}
      >
        + Novo produto
      </button>
    )
  }

  const fields = [
    { name: "name", label: "Nome *", required: true },
    { name: "brand", label: "Marca *", required: true },
    { name: "line", label: "Linha" },
    { name: "finish", label: "Acabamento" },
    { name: "packageSize", label: "Tamanho embalagem (L ou kg) *", type: "number", required: true },
    { name: "packageLabel", label: "Label embalagem (ex: lata 18L) *", required: true },
    { name: "yieldM2", label: "Rendimento (m²/embalagem) *", type: "number", required: true },
    { name: "price", label: "Preço R$ *", type: "number", required: true },
    { name: "notes", label: "Observações" },
  ]

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-xl border flex flex-col gap-3"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
      <h3 className="font-semibold">Novo produto</h3>
      <div className="grid grid-cols-2 gap-3">
        {fields.map(({ name, label, type, required }) => (
          <div key={name}>
            <label className="text-xs font-medium block mb-1" htmlFor={name}>{label}</label>
            <input
              id={name}
              name={name}
              type={type ?? "text"}
              required={required}
              step={type === "number" ? "0.01" : undefined}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: "var(--color-border)" }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2 rounded-lg text-sm border" style={{ borderColor: "var(--color-border)" }}>
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "var(--color-primary)" }}>
          {loading ? "Salvando..." : "Salvar produto"}
        </button>
      </div>
    </form>
  )
}
