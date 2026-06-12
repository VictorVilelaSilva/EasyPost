import { getBudgetById } from "@/lib/budget"
import { notFound } from "next/navigation"
import { formatCurrency } from "@/lib/calculations"
import StatusBadge from "@/components/StatusBadge"
import type { BudgetStatus } from "@/types"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

export default async function OrcamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const budget = await getBudgetById(id)
  if (!budget) notFound()

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{budget.clientName}</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            {new Date(budget.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={budget.status as BudgetStatus} />
          <Link
            href={`/resumo/${budget.id}`}
            target="_blank"
            className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border"
            style={{ borderColor: "var(--color-border)", color: "var(--color-primary)" }}
          >
            <ExternalLink size={14} /> Ver resumo
          </Link>
        </div>
      </div>

      {budget.clientAddress && (
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{budget.clientAddress}</p>
      )}

      <div className="p-4 rounded-xl border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <p className="text-sm font-semibold mb-2">Áreas</p>
        {budget.areas.map((a) => (
          <div key={a.id} className="flex justify-between text-sm py-1">
            <span>{a.name}</span>
            <span>{a.areaForPaint.toFixed(1)} m²</span>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <p className="text-sm font-semibold mb-2">Materiais</p>
        {budget.products.map((p) => (
          <div key={p.id} className="flex justify-between text-sm py-1">
            <span>{p.product.name} × {p.quantity}</span>
            <span>{formatCurrency(p.subtotal)}</span>
          </div>
        ))}
        {budget.extraItems.map((e) => (
          <div key={e.id} className="flex justify-between text-sm py-1">
            <span>{e.name} × {e.quantity}</span>
            <span>{formatCurrency(e.subtotal)}</span>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="flex justify-between text-sm py-1">
          <span>Subtotal materiais</span>
          <span>{formatCurrency(budget.totalMaterials)}</span>
        </div>
        <div className="flex justify-between text-sm py-1">
          <span>Mão de obra</span>
          <span>{formatCurrency(budget.laborValue)}</span>
        </div>
        <div className="flex justify-between font-bold py-1 border-t mt-1" style={{ borderColor: "var(--color-border)" }}>
          <span>TOTAL</span>
          <span>{formatCurrency(budget.totalValue)}</span>
        </div>
      </div>

      <Link href="/dashboard" className="text-sm" style={{ color: "var(--color-text-muted)" }}>
        ← Voltar ao painel
      </Link>
    </div>
  )
}
