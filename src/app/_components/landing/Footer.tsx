'use client';

import { Logo } from '@/components/Logo';

export default function Footer() {
    return (
        <footer className="border-t border-white/5 py-10 bg-black/50 relative z-10">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-16 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                    <Logo />
                    <span className="text-sm text-slate-500 font-body hidden sm:inline">
                        Carrosséis profissionais com IA para criadores de conteúdo.
                    </span>
                </div>
                <p className="text-slate-600 text-xs">
                    &copy; 2026 EasyPost. Todos os direitos reservados.
                </p>
            </div>
        </footer>
    );
}
