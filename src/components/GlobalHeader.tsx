"use client"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { LogOut, PaintBucket } from "lucide-react"

export default function GlobalHeader() {
  const { data: session } = useSession()

  return (
    <header
      style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}
      className="px-4 py-3"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-sm">
          <PaintBucket size={18} style={{ color: "var(--color-primary)" }} />
          Orçamento de Pintura
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {session?.user?.name}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1 text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}
