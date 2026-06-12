"use server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { calcPaintableArea, calcAreaForPaint } from "@/lib/calculations"
import type { WizardState } from "@/types"

async function getSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Não autenticado")
  return session
}

export async function getMyBudgets() {
  const session = await getSession()
  return prisma.budget.findMany({
    where: { painterId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      clientName: true,
      status: true,
      totalValue: true,
      createdAt: true,
    },
  })
}

export async function saveBudget(state: WizardState) {
  const session = await getSession()

  const { calcTotals } = await import("@/lib/calculations")
  const { totalMaterials, totalValue } = calcTotals(state.products, state.extraItems, state.laborValue)

  const budget = await prisma.budget.create({
    data: {
      painterId: session.user.id,
      clientName: state.clientName,
      clientPhone: state.clientPhone || null,
      clientAddress: state.clientAddress || null,
      clientNotes: state.clientNotes || null,
      laborValue: state.laborValue,
      laborDeadline: state.laborDeadline || null,
      paymentMethod: state.paymentMethod || null,
      laborNotes: state.laborNotes || null,
      totalMaterials,
      totalValue,
      areas: {
        create: state.areas.map((a) => {
          const paintable = calcPaintableArea(a)
          const forPaint = calcAreaForPaint(paintable, a.coats)
          return {
            name: a.name,
            totalArea: paintable,
            coats: a.coats,
            areaForPaint: forPaint,
          }
        }),
      },
      products: {
        create: state.products.map((p) => ({
          productId: p.productId,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          subtotal: p.subtotal,
        })),
      },
      extraItems: {
        create: state.extraItems.map((e) => ({
          name: e.name,
          quantity: e.quantity,
          unitPrice: e.unitPrice,
          subtotal: e.subtotal,
        })),
      },
    },
  })

  revalidatePath("/dashboard")
  return { id: budget.id }
}

export async function updateBudgetStatus(
  id: string,
  status: "DRAFT" | "SENT" | "APPROVED" | "REJECTED"
) {
  const session = await getSession()
  await prisma.budget.update({
    where: { id, painterId: session.user.id },
    data: { status },
  })
  revalidatePath("/dashboard")
}

export async function deleteBudget(id: string) {
  const session = await getSession()
  await prisma.budget.delete({ where: { id, painterId: session.user.id } })
  revalidatePath("/dashboard")
}

export async function getBudgetById(id: string) {
  const session = await getSession()
  return prisma.budget.findFirst({
    where: { id, painterId: session.user.id },
    include: {
      areas: true,
      products: { include: { product: true } },
      extraItems: true,
    },
  })
}
