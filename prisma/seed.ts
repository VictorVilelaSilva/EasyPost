import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  await prisma.product.upsert({
    where: { id: "coral-padrao-inicial" },
    update: {},
    create: {
      id: "coral-padrao-inicial",
      name: "Tinta Coral Padrão Inicial",
      brand: "Coral",
      line: "a definir",
      finish: "a definir",
      packageSize: 18,
      packageLabel: "lata 18L",
      yieldM2: 50,
      price: 0,
      notes: "Produto padrão inicial. Atualize o preço e rendimento na área admin.",
    },
  })

  const hashed = await bcrypt.hash("Admin@123", 12)
  await prisma.user.upsert({
    where: { email: "admin@pintores.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@pintores.com",
      password: hashed,
      role: "ADMIN",
    },
  })

  console.log("Seed concluído.")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
