import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import RegisterForm from "./components/RegisterForm"

export default async function RegisterPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect("/dashboard")

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--color-surface-secondary)" }}>
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2">Criar conta</h1>
        <p className="text-center text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
          Preencha os dados para se cadastrar
        </p>
        <RegisterForm />
        <p className="text-center text-sm mt-4" style={{ color: "var(--color-text-muted)" }}>
          Já tem conta?{" "}
          <Link href="/login" style={{ color: "var(--color-primary)" }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
