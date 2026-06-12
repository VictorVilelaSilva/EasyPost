import type { BudgetStatus } from "@/types"

const config: Record<BudgetStatus, { label: string; color: string; bg: string }> = {
  DRAFT:    { label: "Rascunho", color: "#92400e", bg: "#fef3c7" },
  SENT:     { label: "Enviado",  color: "#1e40af", bg: "#dbeafe" },
  APPROVED: { label: "Aprovado", color: "#065f46", bg: "#d1fae5" },
  REJECTED: { label: "Recusado", color: "#991b1b", bg: "#fee2e2" },
}

export default function StatusBadge({ status }: { status: string }) {
  const cfg = config[status as BudgetStatus]
  if (!cfg) return null
  const { label, color, bg } = cfg
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ color, background: bg }}
    >
      {label}
    </span>
  )
}
