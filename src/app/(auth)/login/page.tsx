import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import LoginForm from "./components/LoginForm"

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect("/dashboard")

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--color-surface-secondary)" }}>
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2">Orçamento de Pintura</h1>
        <p className="text-center text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
          Entre com sua conta para continuar
        </p>
        <LoginForm />
        <p className="text-center text-sm mt-4" style={{ color: "var(--color-text-muted)" }}>
          Não tem conta?{" "}
          <Link href="/register" style={{ color: "var(--color-primary)" }}>
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}
