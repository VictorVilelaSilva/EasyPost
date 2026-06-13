import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PaintBucket } from "lucide-react"
import LoginForm from "./components/LoginForm"

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect("/dashboard")

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "var(--color-surface-secondary)" }}
    >
      {/* Decorative background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
        <div
          className="absolute -top-32 -right-24 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: "var(--color-primary)", opacity: 0.06 }}
        />
        <div
          className="absolute -bottom-32 -left-24 w-[420px] h-[420px] rounded-full blur-[110px]"
          style={{ background: "#0ea5e9", opacity: 0.05 }}
        />
      </div>

      <main className="relative z-10 w-full max-w-[400px] flex flex-col items-center">
        {/* Brand mark */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mb-4 border"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <PaintBucket size={32} style={{ color: "var(--color-primary)" }} />
          </div>
          <h1 className="text-2xl font-headline font-extrabold tracking-tight text-center">
            Orçamento de Pintura
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            Entre com sua conta para continuar
          </p>
        </div>

        {/* Sign-in card */}
        <div
          className="w-full rounded-xl border p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <LoginForm />
        </div>

        {/* Footer link */}
        <p className="mt-8 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
          Não tem conta?{" "}
          <Link href="/register" className="font-bold hover:underline" style={{ color: "var(--color-primary)" }}>
            Cadastre-se
          </Link>
        </p>
      </main>
    </div>
  )
}
