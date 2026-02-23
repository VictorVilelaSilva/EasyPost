import type { Metadata } from "next";
import { Sora, Space_Grotesk } from "next/font/google";
import "./globals.css";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${sora.variable} ${spaceGrotesk.variable} antialiased`}
      >
        {/* Animated gradient mesh background */}
        <div className="gradient-mesh" aria-hidden="true" />
        {/* Grain overlay */}
        <div className="grain-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
