import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "ADMIN") redirect("/dashboard")

  const [totalBudgets, totalPainters, totalProducts] = await Promise.all([
    prisma.budget.count(),
    prisma.user.count({ where: { role: "PAINTER" } }),
    prisma.product.count({ where: { isActive: true } }),
  ])

  const cards = [
    { label: "Orçamentos", value: totalBudgets },
    { label: "Pintores", value: totalPainters },
    { label: "Produtos ativos", value: totalProducts },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Dashboard Admin</h1>
      <div className="grid grid-cols-3 gap-4">
        {cards.map(({ label, value }) => (
          <div key={label} className="p-5 rounded-xl border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
