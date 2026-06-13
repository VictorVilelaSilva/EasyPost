"use client"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { LogOut, PaintBucket } from "lucide-react"

export default function GlobalHeader() {
  const { data: session } = useSession()

  return (
    <header
      className="sticky top-0 z-50 px-4 py-3 shadow-sm"
      style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-headline font-extrabold"
          style={{ color: "var(--color-primary)" }}
        >
          <PaintBucket size={20} />
          Orçamento de Pintura
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
            {session?.user?.name}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1 text-sm transition-colors hover:opacity-70"
            style={{ color: "var(--color-text-muted)" }}
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}
