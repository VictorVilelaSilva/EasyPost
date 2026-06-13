import Link from "next/link"
import { PaintBucket, ArrowLeft } from "lucide-react"
import AdminNav from "./components/AdminNav"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-surface-secondary)" }}>
      <header
        className="sticky top-0 z-50 px-4 sm:px-6 py-3 shadow-sm"
        style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="max-w-[1040px] mx-auto">
          <div className="flex items-center gap-8">
            <span
              className="font-headline font-extrabold flex items-center gap-2"
              style={{ color: "var(--color-primary)" }}
            >
              <PaintBucket size={20} /> Admin
            </span>
            {/* Nav inline no desktop */}
            <AdminNav className="hidden sm:flex gap-6" />
            <Link
              href="/dashboard"
              className="ml-auto flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70 shrink-0"
              style={{ color: "var(--color-text-muted)" }}
            >
              <ArrowLeft size={16} /> Painel
            </Link>
          </div>
          {/* Nav em linha rolável no mobile */}
          <AdminNav className="flex sm:hidden gap-5 mt-3 overflow-x-auto -mx-4 px-4" />
        </div>
      </header>
      <main className="max-w-[1040px] mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  )
}
