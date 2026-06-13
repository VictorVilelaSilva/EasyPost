import { getMyBudgets } from "@/lib/budget"
import BudgetList from "./components/BudgetList"
import Link from "next/link"
import { Plus } from "lucide-react"
import { formatCurrency } from "@/lib/calculations"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const rawBudgets = await getMyBudgets()
  const budgets = rawBudgets.map((b) => ({ ...b, createdAt: b.createdAt.toISOString() }))

  const total = budgets.length
  const approved = budgets.filter((b) => b.status === "APPROVED").length
  const approvedValue = budgets
    .filter((b) => b.status === "APPROVED")
    .reduce((sum, b) => sum + b.totalValue, 0)
  const approvedPct = total > 0 ? Math.round((approved / total) * 100) : 0

  return (
    <div>
      {/* Header */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-headline font-extrabold tracking-tight">Meus Orçamentos</h1>
          <p className="mt-1" style={{ color: "var(--color-text-muted)" }}>
            Gerencie e acompanhe suas propostas comerciais.
          </p>
        </div>
        <Link
          href="/orcamento/novo"
          className="px-5 py-2.5 rounded-lg font-medium text-white flex items-center gap-2 shadow-sm transition-all hover:brightness-110 active:scale-95"
          style={{ background: "var(--color-primary)" }}
        >
          <Plus size={18} />
          Novo orçamento
        </Link>
      </section>

      {/* Stat strip */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard label="Total de orçamentos" value={String(total)} />
        <StatCard
          label="Aprovados"
          value={String(approved)}
          badge={total > 0 ? `${approvedPct}%` : undefined}
        />
        <StatCard label="Valor total aprovado" value={formatCurrency(approvedValue)} accent />
      </section>

      {/* List sub-header */}
      <div className="flex justify-between items-center mb-4 px-1">
        <h2
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--color-text-muted)" }}
        >
          Lista recente
        </h2>
      </div>

      <BudgetList budgets={budgets} />
    </div>
  )
}

function StatCard({
  label,
  value,
  badge,
  accent,
}: {
  label: string
  value: string
  badge?: string
  accent?: boolean
}) {
  return (
    <div
      className="p-5 rounded-xl border shadow-sm"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <h3
          className="text-2xl font-headline font-bold"
          style={accent ? { color: "var(--color-primary)" } : undefined}
        >
          {value}
        </h3>
        {badge && (
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded"
            style={{ color: "var(--color-primary)", background: "#eff6ff" }}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  )
}
