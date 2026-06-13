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
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-headline font-extrabold min-w-0"
          style={{ color: "var(--color-primary)" }}
        >
          <PaintBucket size={20} className="shrink-0" />
          <span className="truncate">Orçamento de Pintura</span>
        </Link>
        <div className="flex items-center gap-4 shrink-0">
          <span className="hidden sm:inline text-sm font-medium truncate max-w-[12rem]" style={{ color: "var(--color-text-muted)" }}>
            {session?.user?.name}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1 text-sm transition-colors hover:opacity-70 shrink-0"
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
