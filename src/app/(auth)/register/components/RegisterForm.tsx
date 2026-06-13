"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { User, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react"

const inputClass =
  "w-full pl-10 pr-3 py-2.5 rounded-lg border border-[#e2e8f0] text-sm outline-none transition-all focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"

export default function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
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
      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? "Erro ao criar conta.")
        return
      }
      toast.success("Conta criada! Faça login.")
      router.push("/login")
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nome completo */}
      <div className="space-y-1.5">
        <label htmlFor="name" className="block text-sm font-medium">
          Nome completo
        </label>
        <div className="relative">
          <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
          <input id="name" name="name" type="text" required placeholder="Seu nome" className={inputClass} />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <div className="relative">
          <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
          <input id="email" name="email" type="email" required placeholder="exemplo@email.com" className={inputClass} />
        </div>
      </div>

      {/* Telefone */}
      <div className="space-y-1.5">
        <label htmlFor="phone" className="block text-sm font-medium">
          Telefone <span className="font-normal" style={{ color: "var(--color-text-muted)" }}>(opcional)</span>
        </label>
        <div className="relative">
          <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
          <input id="phone" name="phone" type="tel" placeholder="(00) 00000-0000" className={inputClass} />
        </div>
      </div>

      {/* Senha */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium">
          Senha
        </label>
        <div className="relative">
          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            placeholder="Crie uma senha forte (mín. 6)"
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[#e2e8f0] text-sm outline-none transition-all focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
            style={{ color: "var(--color-text-muted)" }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
        style={{ background: "var(--color-primary)" }}
      >
        {loading ? "Criando..." : "Criar conta"}
      </button>
    </form>
  )
}
