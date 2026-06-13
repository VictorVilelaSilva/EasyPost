import { prisma } from "@/lib/prisma"
import ProductForm from "./components/ProductForm"
import { formatCurrency } from "@/lib/calculations"
import { toggleProduct } from "@/lib/products"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PaintBucket, Ban } from "lucide-react"

export default async function ProdutosPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "ADMIN") redirect("/dashboard")

  const products = await prisma.product.findMany({ orderBy: { name: "asc" } })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-headline font-extrabold tracking-tight">Produtos</h1>
        <p className="mt-2" style={{ color: "var(--color-text-muted)" }}>
          Gerencie as tintas e materiais usados nos orçamentos.
        </p>
      </div>

      <div className="mb-10">
        <ProductForm />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
            Produtos cadastrados
          </h3>
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {products.length} {products.length === 1 ? "item" : "itens"}
          </span>
        </div>

        {products.map((p) => (
          <div
            key={p.id}
            className="p-4 rounded-xl border flex items-center justify-between transition-shadow hover:shadow-md"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-surface)",
              opacity: p.isActive ? 1 : 0.55,
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: p.isActive ? "#eff6ff" : "var(--color-surface-secondary)",
                  color: p.isActive ? "var(--color-primary)" : "var(--color-text-muted)",
                }}
              >
                {p.isActive ? <PaintBucket size={22} /> : <Ban size={22} />}
              </div>
              <div>
                <h4 className="font-medium">{p.name}</h4>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                  {p.brand}{p.line ? ` · ${p.line}` : ""}
                </p>
                <p className="text-xs font-medium mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                  {p.packageLabel} · {p.yieldM2} m²/embalagem ·{" "}
                  <span style={{ color: "var(--color-primary)" }}>{formatCurrency(p.price)}</span>
                </p>
              </div>
            </div>
            <form
              action={async () => {
                "use server"
                await toggleProduct(p.id, !p.isActive)
              }}
            >
              {p.isActive ? (
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-sm font-medium border transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
                >
                  Desativar
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95"
                  style={{ background: "var(--color-primary)" }}
                >
                  Ativar
                </button>
              )}
            </form>
          </div>
        ))}

        {products.length === 0 && (
          <div
            className="p-8 rounded-xl border text-center"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-muted)" }}
          >
            Nenhum produto cadastrado ainda.
          </div>
        )}
      </div>
    </div>
  )
}
