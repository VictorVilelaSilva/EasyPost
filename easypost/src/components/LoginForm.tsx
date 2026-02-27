'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  AuthError,
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'

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

export default function LoginForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    try {
      await signInWithPopup(auth, googleProvider)
      router.push('/')
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
      router.push('/')
    } catch (err) {
      const authErr = err as AuthError
      if (authErr.code === 'auth/user-not-found') {
        try {
          await createUserWithEmailAndPassword(auth, email, password)
          router.push('/')
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
    <div className="w-full max-w-[420px] relative">
      {/* Ambient glow behind card */}
      <div
        className="pointer-events-none absolute -inset-24 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 600px 500px at 50% 50%, var(--color-primary-glow), transparent)',
        }}
        aria-hidden
      />

      <div className="glass-card-static px-10 py-12 animate-reveal stagger-children">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              aria-hidden
            >
              <path
                d="M12 2L13.09 8.26L19 6L15.45 11.09L21 13L15.45 14.91L19 20L13.09 15.74L12 22L10.91 15.74L5 20L8.55 14.91L3 13L8.55 11.09L5 6L10.91 8.26L12 2Z"
                fill="white"
                fillOpacity="0.9"
              />
            </svg>
          </div>
          <span
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            EasyPost
          </span>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1
            className="text-2xl font-bold mb-1.5 gradient-text"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {step === 'email' ? 'Bem-vindo de volta' : 'Digite sua senha'}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            {step === 'email'
              ? 'Entre para criar carrosséis incríveis com IA'
              : email}
          </p>
        </div>

        {/* Google sign-in */}
        {step === 'email' && (
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 mb-6 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--color-border-hover)',
              color: 'var(--color-text)',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'
            }}
          >
            {/* Google G logo */}
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 shrink-0"
              aria-hidden
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {loading ? 'Entrando...' : 'Continuar com Google'}
          </button>
        )}

        {/* Divider */}
        {step === 'email' && (
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
            <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>
              ou
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
          </div>
        )}

        {/* Form */}
        <form onSubmit={step === 'email' ? handleEmailContinue : handleSignIn} noValidate>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-xs font-medium mb-1.5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              readOnly={step === 'password'}
              onClick={() => step === 'password' && setStep('email')}
              className="input-glow w-full px-4 py-3 rounded-xl text-sm transition-colors"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                cursor: step === 'password' ? 'pointer' : 'text',
              }}
            />
          </div>

          {step === 'password' && (
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-xs font-medium mb-1.5"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                autoFocus
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input-glow w-full px-4 py-3 rounded-xl text-sm"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
            </div>
          )}

          {error && (
            <p
              className="text-xs mb-4 px-3 py-2.5 rounded-lg"
              style={{ color: '#f87171', background: 'rgba(248,113,113,0.08)' }}
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="btn-glow w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              color: '#fff',
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Entrando...
              </span>
            ) : (
              <>
                Continuar
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p
          className="text-center mt-8 text-xs leading-relaxed"
          style={{ color: 'var(--color-text-subtle)' }}
        >
          Ao continuar, você concorda com os{' '}
          <a
            href="/terms"
            className="transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = 'var(--color-text)')}
            onMouseLeave={e =>
              ((e.target as HTMLAnchorElement).style.color = 'var(--color-text-muted)')
            }
          >
            Termos de Uso
          </a>{' '}
          e{' '}
          <a
            href="/privacy"
            className="transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = 'var(--color-text)')}
            onMouseLeave={e =>
              ((e.target as HTMLAnchorElement).style.color = 'var(--color-text-muted)')
            }
          >
            Privacidade
          </a>
        </p>
      </div>
    </div>
  )
}
