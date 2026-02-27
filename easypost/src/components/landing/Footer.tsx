'use client';

import { Zap } from 'lucide-react';
import styles from '../LandingPage.module.css';

export function Footer() {
    return (
        <footer
            className="px-6 md:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ borderTop: '1px solid var(--lp-border)' }}
        >
            {/* Logo */}
            <div className="flex items-center gap-2">
                <div
                    className="flex items-center justify-center w-7 h-7 rounded-md"
                    style={{ background: 'var(--lp-accent)' }}
                >
                    <Zap size={14} color="#0a0a0a" strokeWidth={2.5} />
                </div>
                <span
                    className="text-sm font-bold"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--lp-text)' }}
                >
                    EasyPost
                </span>
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
