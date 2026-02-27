'use client';

import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';
import styles from '../LandingPage.module.css';

export function Navbar() {
    return (
        <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-center justify-between px-6 md:px-12 py-4"
            style={{ borderBottom: '1px solid var(--lp-border)' }}
        >
            {/* Logo */}
            <div>
                <Logo className="text-2xl" />
            </div>

            {/* Nav Links — hidden on mobile */}
            <div
                className="hidden md:flex items-center gap-8 text-sm"
                style={{ color: 'var(--lp-dim)', fontFamily: 'var(--font-body)' }}
            >
                <a href="#" className="hover:text-white transition-colors">Produto</a>
                <a href="#" className="hover:text-white transition-colors">Soluções</a>
                <a href="#" className="hover:text-white transition-colors">Galeria</a>
                <a href="#" className="hover:text-white transition-colors">Preços</a>
            </div>

            {/* Auth */}
            <div className="flex items-center gap-4">
                <a
                    href="/login"
                    className="hidden sm:inline text-sm hover:text-white transition-colors"
                    style={{ color: 'var(--lp-muted)', fontFamily: 'var(--font-body)' }}
                >
                    Entrar
                </a>
                <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="/login"
                    className={`${styles.btnPrimary} py-2! px-5! text-sm!`}
                >
                    Teste Grátis
                </motion.a>
            </div>
        </motion.nav>
    );
}
