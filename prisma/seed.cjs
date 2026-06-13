// Seed de produção em CommonJS — roda no container sem precisar de tsx/typescript.
// Mantém os mesmos dados do prisma/seed.ts (admin + tinta padrão R$300).
const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  await prisma.product.upsert({
    where: { id: "coral-padrao-inicial" },
    update: { price: 300 },
    create: {
      id: "coral-padrao-inicial",
      name: "Tinta Coral Padrão Inicial",
      brand: "Coral",
      line: "a definir",
      finish: "a definir",
      packageSize: 18,
      packageLabel: "lata 18L",
      yieldM2: 50,
      price: 300,
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
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
