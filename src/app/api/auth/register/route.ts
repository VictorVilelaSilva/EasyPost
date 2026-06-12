import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 })
  }
  const { name, email, phone, password } = result.data
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) {
    return NextResponse.json({ error: "Email já cadastrado." }, { status: 409 })
  }
  const hashed = await bcrypt.hash(password, 12)
  await prisma.user.create({ data: { name, email, phone, password: hashed } })
  return NextResponse.json({ ok: true }, { status: 201 })
}
