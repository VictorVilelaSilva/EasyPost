"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const data = new FormData(e.currentTarget)
    const result = await signIn("credentials", {
      email: data.get("email"),
      password: data.get("password"),
      redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError("Email ou senha incorretos.")
      return
    }
    router.push("/dashboard")
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        className="w-full px-3 py-2 rounded-lg border text-sm"
        style={{ borderColor: "var(--color-border)" }}
      />
      <input
        name="password"
        type="password"
        placeholder="Senha"
        required
        className="w-full px-3 py-2 rounded-lg border text-sm"
        style={{ borderColor: "var(--color-border)" }}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 rounded-lg text-sm font-medium text-white"
        style={{ background: loading ? "#93c5fd" : "var(--color-primary)" }}
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  )
}
