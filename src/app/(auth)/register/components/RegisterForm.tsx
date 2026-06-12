"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const data = new FormData(e.currentTarget)
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        email: data.get("email"),
        phone: data.get("phone") || undefined,
        password: data.get("password"),
      }),
    })
    setLoading(false)
    if (!res.ok) {
      const body = await res.json()
      setError(body.error ?? "Erro ao criar conta.")
      return
    }
    toast.success("Conta criada! Faça login.")
    router.push("/login")
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input name="name" type="text" placeholder="Nome completo" required
        className="w-full px-3 py-2 rounded-lg border text-sm"
        style={{ borderColor: "var(--color-border)" }} />
      <input name="email" type="email" placeholder="Email" required
        className="w-full px-3 py-2 rounded-lg border text-sm"
        style={{ borderColor: "var(--color-border)" }} />
      <input name="phone" type="text" placeholder="Telefone (opcional)"
        className="w-full px-3 py-2 rounded-lg border text-sm"
        style={{ borderColor: "var(--color-border)" }} />
      <input name="password" type="password" placeholder="Senha (mín. 6 caracteres)" required
        className="w-full px-3 py-2 rounded-lg border text-sm"
        style={{ borderColor: "var(--color-border)" }} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 rounded-lg text-sm font-medium text-white"
        style={{ background: loading ? "#93c5fd" : "var(--color-primary)" }}
      >
        {loading ? "Criando..." : "Criar conta"}
      </button>
    </form>
  )
}
