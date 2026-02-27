'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <header
      className="sticky top-0 z-40 w-full"
      style={{
        background: 'rgba(10, 12, 20, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          aria-label="EasyPost — início"
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-3.5 h-3.5"
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
            className="text-sm font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            EasyPost
          </span>
        </Link>

        {/* Auth area */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div
              className="h-8 w-20 rounded-lg animate-pulse"
              style={{ background: 'var(--color-card)' }}
            />
          ) : user ? (
            <>
              {/* Avatar + name */}
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.photoURL}
                    alt={user.displayName ?? 'Usuário'}
                    width={28}
                    height={28}
                    className="rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    {(user.displayName ?? user.email ?? 'U')[0].toUpperCase()}
                  </div>
                )}
                <span
                  className="hidden sm:block text-sm"
                  style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
                >
                  {user.displayName?.split(' ')[0] ?? user.email}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                style={{
                  color: 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)',
                  background: 'transparent',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.borderColor = 'var(--color-border-hover)'
                  el.style.color = 'var(--color-text)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.borderColor = 'var(--color-border)'
                  el.style.color = 'var(--color-text-muted)'
                }}
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm px-4 py-1.5 rounded-lg font-medium transition-all"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                color: '#fff',
              }}
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
