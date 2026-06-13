"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Link2, Trash2 } from "lucide-react"
import { updateBudgetStatus, deleteBudget } from "@/lib/budget"
import type { BudgetStatus } from "@/types"

const STATUS_OPTIONS: { value: BudgetStatus; label: string }[] = [
  { value: "DRAFT", label: "Rascunho" },
  { value: "SENT", label: "Enviado" },
  { value: "APPROVED", label: "Aprovado" },
  { value: "REJECTED", label: "Recusado" },
]

export default function BudgetActions({
  budgetId,
  status,
}: {
  budgetId: string
  status: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [deleting, setDeleting] = useState(false)

  function onStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as BudgetStatus
    startTransition(async () => {
      const res = await updateBudgetStatus(budgetId, next)
      if (res?.error) {
        toast.error(res.error)
        return
      }
      toast.success("Status atualizado.")
      router.refresh()
    })
  }

  async function onShare() {
    const url = `${window.location.origin}/resumo/${budgetId}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link do resumo copiado!")
    } catch {
      toast.error("Não foi possível copiar o link.")
    }
  }

  async function onDelete() {
    if (!confirm("Excluir este orçamento? Esta ação não pode ser desfeita.")) return
    setDeleting(true)
    const res = await deleteBudget(budgetId)
    if (res?.error) {
      toast.error(res.error)
      setDeleting(false)
      return
    }
    toast.success("Orçamento excluído.")
    router.push("/dashboard")
  }

  return (
    <div
      className="rounded-xl border p-4 shadow-sm flex flex-wrap items-center justify-between gap-4"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div className="flex flex-col gap-1.5 w-full sm:w-auto">
        <label
          htmlFor="status"
          className="text-[10px] font-bold uppercase tracking-widest pl-0.5"
          style={{ color: "var(--color-text-muted)" }}
        >
          Status do orçamento
        </label>
        <select
          id="status"
          value={status}
          onChange={onStatusChange}
          disabled={pending}
          className="rounded-lg border border-[#e2e8f0] text-sm font-medium px-3 py-2 outline-none transition-all focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 disabled:opacity-60"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={onShare}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--color-surface-secondary)]"
          style={{ color: "var(--color-text-muted)" }}
        >
          <Link2 size={16} /> Compartilhar
        </button>
        <div className="w-px h-6 mx-1" style={{ background: "var(--color-border)" }} />
        <button
          onClick={onDelete}
          disabled={deleting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
        >
          <Trash2 size={16} /> {deleting ? "Excluindo..." : "Excluir"}
        </button>
      </div>
    </div>
  )
}
