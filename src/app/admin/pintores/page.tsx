import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function PintoresPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "ADMIN") redirect("/dashboard")

  const painters = await prisma.user.findMany({
    where: { role: "PAINTER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      _count: { select: { budgets: true } },
    },
  })

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Pintores cadastrados</h1>
      <div className="flex flex-col gap-3">
        {painters.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
            <div>
              <p className="font-medium text-sm">{p.name}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                {p.email} {p.phone ? `· ${p.phone}` : ""}
              </p>
            </div>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {p._count.budgets} orçamentos
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
