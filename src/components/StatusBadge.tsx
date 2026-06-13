import type { BudgetStatus } from "@/types"

const config: Record<BudgetStatus, { label: string; color: string; bg: string }> = {
  DRAFT:    { label: "Rascunho", color: "#b45309", bg: "#fef3c7" },
  SENT:     { label: "Enviado",  color: "#1d4ed8", bg: "#dbeafe" },
  APPROVED: { label: "Aprovado", color: "#047857", bg: "#d1fae5" },
  REJECTED: { label: "Recusado", color: "#b91c1c", bg: "#fee2e2" },
}

export default function StatusBadge({ status }: { status: string }) {
  const cfg = config[status as BudgetStatus]
  if (!cfg) return null
  const { label, color, bg } = cfg
  return (
    <span
      className="inline-block text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
      style={{ color, background: bg }}
    >
      {label}
    </span>
  )
}
