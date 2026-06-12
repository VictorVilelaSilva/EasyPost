import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { formatCurrency } from "@/lib/calculations"

export default async function ResumoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const budget = await prisma.budget.findUnique({
    where: { id },
    include: { areas: true, products: { include: { product: true } }, extraItems: true },
  })
  if (!budget) notFound()

  return (
    <div className="min-h-screen p-4" style={{ background: "var(--color-surface-secondary)" }}>
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Orçamento de Pintura</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            {new Date(budget.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </div>

        <div className="p-4 rounded-xl border mb-4" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
          <p className="font-semibold">{budget.clientName}</p>
          {budget.clientPhone && <p className="text-sm">{budget.clientPhone}</p>}
          {budget.clientAddress && <p className="text-sm">{budget.clientAddress}</p>}
        </div>

        <div className="p-4 rounded-xl border mb-4" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
          <p className="text-sm font-semibold mb-2">Áreas de pintura</p>
          {budget.areas.map((a) => (
            <div key={a.id} className="flex justify-between text-sm py-1">
              <span>{a.name} ({a.coats} demãos)</span>
              <span>{a.areaForPaint.toFixed(1)} m²</span>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl border mb-4" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
          <p className="text-sm font-semibold mb-2">Materiais</p>
          {budget.products.map((p) => (
            <div key={p.id} className="flex justify-between text-sm py-1">
              <span>{p.product.name} × {p.quantity} {p.product.packageLabel}</span>
              <span>{formatCurrency(p.subtotal)}</span>
            </div>
          ))}
          {budget.extraItems.map((e) => (
            <div key={e.id} className="flex justify-between text-sm py-1">
              <span>{e.name} × {e.quantity}</span>
              <span>{formatCurrency(e.subtotal)}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-semibold border-t pt-2 mt-1" style={{ borderColor: "var(--color-border)" }}>
            <span>Subtotal materiais</span><span>{formatCurrency(budget.totalMaterials)}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border mb-4" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
          <div className="flex justify-between text-sm py-1">
            <span>Mão de obra</span><span>{formatCurrency(budget.laborValue)}</span>
          </div>
          {budget.laborDeadline && <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Prazo: {budget.laborDeadline}</p>}
          {budget.paymentMethod && <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Pagamento: {budget.paymentMethod}</p>}
        </div>

        <div className="p-4 rounded-xl mb-4" style={{ background: "var(--color-primary)", color: "white" }}>
          <div className="flex justify-between items-center">
            <span className="font-semibold">TOTAL</span>
            <span className="text-2xl font-bold">{formatCurrency(budget.totalValue)}</span>
          </div>
        </div>

        <p className="text-xs text-center mb-6" style={{ color: "var(--color-text-muted)" }}>
          * Este orçamento é uma estimativa. Valores podem variar conforme condições da obra.
        </p>

        <a
          href={`/api/pdf/${budget.id}`}
          target="_blank"
          className="block w-full py-3 rounded-xl text-center text-sm font-medium border"
          style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
        >
          Exportar PDF
        </a>
      </div>
    </div>
  )
}
