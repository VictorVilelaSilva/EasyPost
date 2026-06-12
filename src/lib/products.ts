"use server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "ADMIN") throw new Error("Acesso negado")
  return session
}

const productSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  line: z.string().optional(),
  finish: z.string().optional(),
  packageSize: z.number().positive(),
  packageLabel: z.string().min(1),
  yieldM2: z.number().positive(),
  price: z.number().min(0),
  notes: z.string().optional(),
})

export async function createProduct(data: unknown) {
  await requireAdmin()
  const parsed = productSchema.parse(data)
  await prisma.product.create({ data: parsed })
  revalidatePath("/admin/produtos")
}

export async function updateProduct(id: string, data: unknown) {
  await requireAdmin()
  const parsed = productSchema.partial().parse(data)
  await prisma.product.update({ where: { id }, data: parsed })
  revalidatePath("/admin/produtos")
}

export async function toggleProduct(id: string, isActive: boolean) {
  await requireAdmin()
  await prisma.product.update({ where: { id }, data: { isActive } })
  revalidatePath("/admin/produtos")
}
