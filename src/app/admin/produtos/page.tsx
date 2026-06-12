import { prisma } from "@/lib/prisma"
import ProductForm from "./components/ProductForm"
import { formatCurrency } from "@/lib/calculations"
import { toggleProduct } from "@/lib/products"

export default async function ProdutosPage() {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Produtos</h1>
      </div>

      <ProductForm />

      <div className="mt-8 flex flex-col gap-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between p-4 rounded-xl border"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-surface)",
              opacity: p.isActive ? 1 : 0.5,
            }}
          >
            <div>
              <p className="font-medium text-sm">{p.name} <span className="text-xs text-gray-400">— {p.brand}</span></p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                {p.packageLabel} · {p.yieldM2} m²/embalagem · {formatCurrency(p.price)}
              </p>
            </div>
            <form action={async () => {
              "use server"
              await toggleProduct(p.id, !p.isActive)
            }}>
              <button type="submit" className="text-xs px-3 py-1 rounded border" style={{ borderColor: "var(--color-border)" }}>
                {p.isActive ? "Desativar" : "Ativar"}
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}
