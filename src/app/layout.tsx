import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "sonner"
import SessionProviderWrapper from "@/components/SessionProviderWrapper"

export const metadata: Metadata = {
  title: "Orçamento de Pintura",
  description: "Plataforma para pintores gerarem orçamentos profissionais",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
