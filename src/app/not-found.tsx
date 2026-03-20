import Link from 'next/link';

export default function NotFound() {
    return (
        <main className="min-h-screen flex items-center justify-center px-4" style={{ color: 'var(--color-text)' }}>
            <div className="text-center max-w-md">
                <h1
                    className="text-7xl font-extrabold gradient-text mb-4"
                    style={{ fontFamily: 'var(--font-display)' }}
                >
                    404
                </h1>
                <h2
                    className="text-xl font-bold mb-3"
                    style={{ fontFamily: 'var(--font-display)' }}
                >
                    Página não encontrada
                </h2>
                <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
                    A página que você procura não existe ou foi movida.
                </p>
                <Link
                    href="/"
                    className="btn-glow inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl"
                    style={{
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                        fontFamily: 'var(--font-display)',
                        minHeight: '48px',
                    }}
                >
                    Voltar ao Início
                </Link>
            </div>
        </main>
    );
}
