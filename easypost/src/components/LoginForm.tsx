'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  AuthError,
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { Sparkles, ArrowRight, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type Step = 'email' | 'password'

function getAuthErrorMessage(error: AuthError): string {
  switch (error.code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email ou senha incorretos.'
    case 'auth/email-already-in-use':
      return 'Este email já está em uso.'
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres.'
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde.'
    case 'auth/popup-closed-by-user':
      return ''
    default:
      return 'Erro ao entrar. Tente novamente.'
  }
}

const currentYear = new Date().getFullYear()

export default function LoginForm() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redireciona se já autenticado
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/create')
    }
  }, [user, authLoading, router])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    try {
      await signInWithPopup(auth, googleProvider)
      router.push('/create')
    } catch (err) {
      const message = getAuthErrorMessage(err as AuthError)
      if (message) setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setError(null)
    setStep('password')
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/create')
    } catch (err) {
      const authErr = err as AuthError
      if (authErr.code === 'auth/user-not-found') {
        try {
          await createUserWithEmailAndPassword(auth, email, password)
          router.push('/create')
        } catch (createErr) {
          setError(getAuthErrorMessage(createErr as AuthError))
        }
      } else {
        setError(getAuthErrorMessage(authErr))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative z-10 w-full max-w-[480px] animate-reveal">
      <div className="glass-card-static rounded-2xl p-8 md:p-12 flex flex-col items-center shadow-2xl relative">
        {/* Back Button */}
        <Link
          href="/"
          className="absolute left-6 top-6 sm:left-8 sm:top-8 p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50"
          title="Voltar para a página inicial"
        >
          <ArrowLeft className="size-5" />
          <span className="sr-only">Voltar</span>
        </Link>

        {/* Branding */}
        <div className="flex items-center gap-3 mb-10 w-full justify-center">
          <div
            className="size-10 rounded-lg flex items-center justify-center text-white shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            }}
          >
            <Sparkles className="size-5 text-white" />
          </div>
          <h1 className="text-slate-900 dark:text-slate-100 text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            EasyPost
          </h1>
        </div>

        {/* Hero Text */}
        <div className="text-center mb-10">
          <h2 className="text-slate-900 dark:text-slate-100 text-3xl font-bold leading-tight mb-3 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            {step === 'email' ? 'Desbloqueie Seu Potencial Criativo' : 'Digite sua senha'}
          </h2>
          <div className="text-slate-600 dark:text-slate-400 text-base">
            {step === 'email'
              ? 'Entre para começar a criar visuais profissionais em segundos.'
              : <div className="flex items-center justify-center gap-2">
                <span>{email}</span>
                <button type="button" onClick={() => setStep('email')} className="text-primary hover:underline font-medium text-sm">
                  Editar
                </button>
              </div>
            }
          </div>
        </div>

        {/* Primary Action: Google Login */}
        {step === 'email' && (
          <div className="w-full mb-8">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-900 h-14 rounded-xl font-bold transition-all border border-slate-200 shadow-sm group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              <span className="text-base">{loading ? 'Entrando...' : 'Continuar com Google'}</span>
            </button>
          </div>
        )}

        {/* Divider */}
        {step === 'email' && (
          <div className="w-full flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800 border-none"></div>
            <span className="text-slate-500 font-medium uppercase tracking-widest text-[10px]">ou use seu email</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800 border-none"></div>
          </div>
        )}

        {error && (
          <div className="w-full mb-6 p-4 rounded-xl border border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm animate-fade-in" role="alert">
            {error}
          </div>
        )}

        {/* Secondary Action: Email Login form */}
        <form className="w-full flex flex-col gap-4" onSubmit={step === 'email' ? handleEmailContinue : handleSignIn} noValidate>
          <div className={`relative ${step === 'password' ? 'hidden' : ''}`}>
            <label className="sr-only" htmlFor="email">Endereço de email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-14 px-5 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
              placeholder="seu@email.com"
              required={step === 'email'}
            />
          </div>

          {step === 'password' && (
            <div className="relative animate-fade-in">
              <label className="sr-only" htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                autoFocus
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-14 px-5 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                placeholder="••••••••"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (step === 'email' && !email.trim())}
            className="btn-glow w-full h-14 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: step === 'password'
                ? 'linear-gradient(135deg, var(--color-primary), var(--color-accent))'
                : 'var(--color-surface-elevated)',
              color: step === 'password' ? 'var(--color-1)' : 'var(--color-text)',
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin size-5" />
                Processando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {step === 'email' ? 'Continuar' : 'Entrar na plataforma'}
                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Footer Links */}
      <footer className="mt-8 flex flex-col items-center gap-4 text-center pb-8">
        <div className="flex flex-wrap items-center justify-center gap-6 text-slate-500 dark:text-slate-400 text-sm font-medium">
          <a href="/terms" className="hover:text-primary transition-colors">Termos de Uso</a>
          <a href="/privacy" className="hover:text-primary transition-colors">Privacidade</a>
        </div>
        <div className="text-slate-400 dark:text-slate-600 text-xs">
          © {currentYear} EasyPost Inc. Todos os direitos reservados.
        </div>
      </footer>
    </main>
  )
}
