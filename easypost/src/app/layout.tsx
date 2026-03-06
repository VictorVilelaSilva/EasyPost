import type { Metadata } from "next";
import { Sora, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "EasyPost — Gerador de Carrossel para Instagram com IA",
  description: "Gere carrosséis incríveis para Instagram com IA. Digite seu nicho, escolha um tema e receba 5 slides prontos para postar com legenda em segundos.",
  metadataBase: new URL('https://easypost.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'EasyPost — Carrosséis para Instagram com IA',
    description: 'Crie carrosséis profissionais para Instagram em segundos. IA gera imagens, textos e legendas para seu nicho.',
    url: 'https://easypost.app',
    siteName: 'EasyPost',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EasyPost — Carrosséis para Instagram com IA',
    description: 'Crie carrosséis profissionais para Instagram em segundos com IA.',
  },
  other: {
    'theme-color': '#0d1117',
  },
};

import GlobalHeader from "@/components/GlobalHeader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${sora.variable} ${spaceGrotesk.variable} antialiased`}
      >
        {/* Animated gradient mesh background */}
        <div className="gradient-mesh" aria-hidden="true" />
        {/* Grain overlay */}
        <div className="grain-overlay" aria-hidden="true" />
        <AuthProvider>
          <GlobalHeader />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
