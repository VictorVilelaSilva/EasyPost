'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';

export default function GlobalHeader() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    return (
        <header className="sticky top-0 w-full z-50 border-b border-white/5 backdrop-blur-md bg-black/75">
            <div className="w-full px-6 lg:px-12 xl:px-16 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/" className="transition-opacity hover:opacity-80">
                        <Logo />
                    </Link>
                </div>

                {/* Links centrais (opcional, pode adicionar navegação aqui futuramente) */}
                <div className="hidden md:flex items-center gap-10"></div>

                <div className="flex items-center gap-4">
                    {loading ? (
                        <div className="h-10 w-24 rounded-lg animate-pulse bg-white/10" />
                    ) : user ? (
                        <>
                            {/* Avatar + name */}
                            <div className="flex items-center gap-2 mr-2">
                                {user.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt={user.displayName ?? 'Usuário'}
                                        width={32}
                                        height={32}
                                        className="rounded-full border border-white/10"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-purple border border-white/10">
                                        {(user.displayName ?? user.email ?? 'U')[0].toUpperCase()}
                                    </div>
                                )}
                                <span className="hidden sm:block text-sm font-medium text-slate-300">
                                    {user.displayName?.split(' ')[0] ?? user.email?.split('@')[0]}
                                </span>
                            </div>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer text-slate-300 border border-white/10 hover:border-white/20 hover:text-white"
                            >
                                Sair
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-semibold text-slate-200 hover:text-white px-3 sm:px-4 py-2 whitespace-nowrap">
                                Entrar
                            </Link>
                            <Link href="/create" className="bg-purple hover:bg-purple/90 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-purple/25 hover:scale-105 active:scale-95 whitespace-nowrap">
                                Começar grátis
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
