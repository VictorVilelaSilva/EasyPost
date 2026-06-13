"use client"
import StatusBadge from "@/components/StatusBadge"
import type { BudgetStatus } from "@/types"
import { formatCurrency } from "@/lib/calculations"
import Link from "next/link"
import { User, FileText, Plus } from "lucide-react"

interface Budget {
  id: string
  clientName: string
  status: BudgetStatus
  totalValue: number
  createdAt: string
}

export default function BudgetList({ budgets }: { budgets: Budget[] }) {
  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
          style={{ background: "var(--color-surface-secondary)", border: "1px solid var(--color-border)" }}
        >
          <FileText size={32} style={{ color: "var(--color-text-muted)" }} />
        </div>
        <h3 className="text-xl font-headline font-bold">Nenhum orçamento ainda</h3>
        <p className="max-w-xs mt-2" style={{ color: "var(--color-text-muted)" }}>
          Crie seu primeiro orçamento profissional para seus clientes.
        </p>
        <Link
          href="/orcamento/novo"
          className="mt-6 font-semibold flex items-center gap-2 hover:underline"
          style={{ color: "var(--color-primary)" }}
        >
          <Plus size={18} /> Criar agora
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {budgets.map((b) => (
        <Link
          key={b.id}
          href={`/orcamento/${b.id}`}
          className="flex items-center justify-between p-5 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "var(--color-surface-secondary)", color: "var(--color-text-muted)" }}
            >
              <User size={20} />
            </div>
            <div>
              <h4 className="text-lg font-headline font-semibold">{b.clientName}</h4>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {new Date(b.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">{formatCurrency(b.totalValue)}</p>
            <div className="mt-1">
              <StatusBadge status={b.status} />
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
