import GlobalHeader from "@/components/GlobalHeader"

export default function PainterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-surface-secondary)" }}>
      <GlobalHeader />
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
