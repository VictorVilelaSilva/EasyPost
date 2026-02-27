'use client';

import { Logo } from '@/components/Logo';

export function Footer() {
    return (
        <footer
            className="px-6 md:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ borderTop: '1px solid var(--lp-border)' }}
        >
            {/* Logo */}
            <div>
                <Logo className="text-lg" />
            </div>

            {/* Links */}
            <div
                className="flex items-center gap-6 text-sm"
                style={{ color: 'var(--lp-dim)', fontFamily: 'var(--font-body)' }}
            >
                <a href="#" className="hover:text-white transition-colors">Twitter</a>
                <a href="#" className="hover:text-white transition-colors">Comunidade</a>
                <a href="#" className="hover:text-white transition-colors">Changelog</a>
                <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            </div>

            {/* Copyright */}
            <p className="text-xs" style={{ color: 'var(--lp-subtle)', fontFamily: 'var(--font-body)' }}>
                © 2025 EasyPost Inc. Todos os direitos reservados.
            </p>
        </footer>
    );
}
