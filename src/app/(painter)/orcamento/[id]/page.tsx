import { getBudgetById } from "@/lib/budget"
import { notFound } from "next/navigation"
import { formatCurrency } from "@/lib/calculations"
import StatusBadge from "@/components/StatusBadge"
import BudgetActions from "./components/BudgetActions"
import Link from "next/link"

export const dynamic = "force-dynamic"
import { ArrowLeft, ExternalLink, MapPin, Ruler, Paintbrush } from "lucide-react"

export default async function OrcamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const budget = await getBudgetById(id)
  if (!budget) notFound()

  const totalArea = budget.areas.reduce((sum, a) => sum + a.areaForPaint, 0)
  const hasMaterials = budget.products.length > 0 || budget.extraItems.length > 0

  return (
    <div className="flex flex-col gap-6">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 font-medium w-fit hover:gap-3 transition-all"
        style={{ color: "var(--color-primary)" }}
      >
        <ArrowLeft size={18} /> Voltar ao painel
      </Link>

      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <StatusBadge status={budget.status} />
            <span className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
              Criação: {new Date(budget.createdAt).toLocaleDateString("pt-BR")}
            </span>
          </div>
          <h1 className="text-3xl font-headline font-extrabold tracking-tight">{budget.clientName}</h1>
          {budget.clientAddress && (
            <p className="flex items-center gap-1.5" style={{ color: "var(--color-text-muted)" }}>
              <MapPin size={16} /> {budget.clientAddress}
            </p>
          )}
        </div>
        <Link
          href={`/resumo/${budget.id}`}
          target="_blank"
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border font-semibold text-sm transition-all hover:border-[#2563eb] shrink-0"
          style={{ borderColor: "var(--color-border)", color: "var(--color-primary)", background: "var(--color-surface)" }}
        >
          <ExternalLink size={16} /> Ver resumo
        </Link>
      </section>

      {/* Management toolbar */}
      <BudgetActions budgetId={budget.id} status={budget.status} />

      {/* Areas card */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface-secondary)" }}
        >
          <h3 className="font-headline font-bold flex items-center gap-2">
            <Ruler size={18} style={{ color: "var(--color-primary)" }} /> Áreas
          </h3>
          <span
            className="text-xs font-semibold px-2 py-1 rounded border"
            style={{ color: "var(--color-text-muted)", borderColor: "var(--color-border)", background: "var(--color-surface)" }}
          >
            Total: {totalArea.toFixed(1)} m²
          </span>
        </div>
        <div className="p-6 divide-y divide-[#e2e8f0]">
          {budget.areas.map((a) => (
            <div key={a.id} className="py-3 flex justify-between items-center gap-3 first:pt-0 last:pb-0">
              <span className="font-medium min-w-0 truncate">{a.name}</span>
              <span className="shrink-0 whitespace-nowrap" style={{ color: "var(--color-text-muted)" }}>{a.areaForPaint.toFixed(1)} m²</span>
            </div>
          ))}
        </div>
      </div>

      {/* Materials card */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <div
          className="px-6 py-4 border-b flex items-center gap-2"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface-secondary)" }}
        >
          <h3 className="font-headline font-bold flex items-center gap-2">
            <Paintbrush size={18} style={{ color: "var(--color-primary)" }} /> Materiais
          </h3>
        </div>
        <div className="p-6 space-y-4">
          {budget.products.map((p) => (
            <div key={p.id} className="flex justify-between items-start gap-3">
              <div className="min-w-0">
                <p className="font-medium truncate">{p.product.name}</p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  Quantidade: {p.quantity}
                </p>
              </div>
              <span className="font-semibold shrink-0 whitespace-nowrap">{formatCurrency(p.subtotal)}</span>
            </div>
          ))}
          {budget.extraItems.map((e) => (
            <div key={e.id} className="flex justify-between items-start gap-3">
              <div className="min-w-0">
                <p className="font-medium truncate">{e.name}</p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  Quantidade: {e.quantity}
                </p>
              </div>
              <span className="font-semibold shrink-0 whitespace-nowrap">{formatCurrency(e.subtotal)}</span>
            </div>
          ))}
          {!hasMaterials && (
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Nenhum material adicionado.
            </p>
          )}
        </div>
      </div>

      {/* Totals card */}
      <div className="rounded-xl p-8 shadow-lg text-white" style={{ background: "var(--color-primary)" }}>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm opacity-90">
            <span>Subtotal materiais</span>
            <span>{formatCurrency(budget.totalMaterials)}</span>
          </div>
          <div className="flex justify-between items-center text-sm opacity-90">
            <span>Mão de obra</span>
            <span>{formatCurrency(budget.laborValue)}</span>
          </div>
          <div className="h-px my-2" style={{ background: "rgba(255,255,255,0.2)" }} />
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-widest opacity-80">Total estimado</span>
            <h2 className="text-4xl font-headline font-extrabold">{formatCurrency(budget.totalValue)}</h2>
          </div>
        </div>
      </div>
    </div>
  )
}
