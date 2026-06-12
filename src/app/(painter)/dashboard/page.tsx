import { getMyBudgets } from "@/lib/budget"
import BudgetList from "./components/BudgetList"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function DashboardPage() {
  const budgets = await getMyBudgets()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Meus Orçamentos</h1>
        <Link
          href="/orcamento/novo"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "var(--color-primary)" }}
        >
          <Plus size={16} />
          Novo orçamento
        </Link>
      </div>
      <BudgetList budgets={budgets} />
    </div>
  )
}
