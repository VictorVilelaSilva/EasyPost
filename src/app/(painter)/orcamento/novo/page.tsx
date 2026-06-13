import { prisma } from "@/lib/prisma"
import BudgetWizard from "./components/BudgetWizard"

export const dynamic = "force-dynamic"

export default async function NovoOrcamentoPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  })
  return <BudgetWizard products={products} />
}
