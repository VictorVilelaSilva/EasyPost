'use client';

import { AlertTriangle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <main className="min-h-screen flex items-center justify-center px-4" style={{ color: 'var(--color-text)' }}>
            <div className="text-center max-w-md">
                <div className="mx-auto mb-6 w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
                    <AlertTriangle size={32} style={{ color: 'var(--color-accent)' }} />
                </div>
                <h2
                    className="text-2xl font-bold mb-3"
                    style={{ fontFamily: 'var(--font-display)' }}
                >
                    Algo deu errado
                </h2>
                <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
                    Ocorreu um erro inesperado. Tente novamente ou recarregue a página.
                </p>
                <button
                    onClick={() => reset()}
                    className="btn-glow cursor-pointer px-6 py-3 text-white font-semibold rounded-xl"
                    style={{
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                        fontFamily: 'var(--font-display)',
                        minHeight: '48px',
                    }}
                >
                    Tentar Novamente
                </button>
            </div>
        </main>
    );
}
