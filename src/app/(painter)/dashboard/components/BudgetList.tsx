"use client"
import StatusBadge from "@/components/StatusBadge"
import type { BudgetStatus } from "@/types"
import { formatCurrency } from "@/lib/calculations"
import Link from "next/link"

interface Budget {
  id: string
  clientName: string
  status: string
  totalValue: number
  createdAt: Date
}

export default function BudgetList({ budgets }: { budgets: Budget[] }) {
  if (budgets.length === 0) {
    return (
      <div className="text-center py-16" style={{ color: "var(--color-text-muted)" }}>
        <p className="text-lg mb-2">Nenhum orçamento ainda</p>
        <p className="text-sm">Clique em "Novo orçamento" para começar.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {budgets.map((b) => (
        <Link
          key={b.id}
          href={`/orcamento/${b.id}`}
          className="flex items-center justify-between p-4 rounded-xl border"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <div>
            <p className="font-medium text-sm">{b.clientName}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              {new Date(b.createdAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">{formatCurrency(b.totalValue)}</span>
            <StatusBadge status={b.status as BudgetStatus} />
          </div>
        </Link>
      ))}
    </div>
  )
}
