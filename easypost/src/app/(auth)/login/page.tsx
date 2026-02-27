import type { Metadata } from 'next'
import LoginForm from '@/components/LoginForm'

export const metadata: Metadata = {
  title: 'Entrar — EasyPost',
  description:
    'Faça login na sua conta EasyPost e comece a criar carrosséis incríveis para o Instagram com IA.',
  robots: { index: false },
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <LoginForm />
    </main>
  )
}
