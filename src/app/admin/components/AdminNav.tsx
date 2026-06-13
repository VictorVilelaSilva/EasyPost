"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/pintores", label: "Pintores" },
]

export default function AdminNav() {
  const pathname = usePathname()
  return (
    <nav className="hidden sm:flex gap-6">
      {LINKS.map(({ href, label }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className="text-sm pb-1 border-b-2 transition-colors"
            style={{
              color: active ? "var(--color-primary)" : "var(--color-text-muted)",
              borderColor: active ? "var(--color-primary)" : "transparent",
              fontWeight: active ? 700 : 500,
            }}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
