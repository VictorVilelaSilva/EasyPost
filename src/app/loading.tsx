import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <main className="min-h-screen flex items-center justify-center" style={{ color: 'var(--color-text)' }}>
            <div className="text-center">
                <Loader2 className="animate-spin mx-auto mb-4" size={40} style={{ color: 'var(--color-primary)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
                    Carregando…
                </p>
            </div>
        </main>
    );
}
