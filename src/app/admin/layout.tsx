import Link from "next/link"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-surface-secondary)" }}>
      <header style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }} className="px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-6">
          <span className="font-semibold text-sm">Admin</span>
          <nav className="flex gap-4">
            {[
              { href: "/admin", label: "Dashboard" },
              { href: "/admin/produtos", label: "Produtos" },
              { href: "/admin/pintores", label: "Pintores" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {label}
              </Link>
            ))}
          </nav>
          <Link href="/dashboard" className="ml-auto text-sm" style={{ color: "var(--color-text-muted)" }}>
            ← Painel
          </Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
