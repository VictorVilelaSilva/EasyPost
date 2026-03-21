'use client';

import { useRouter } from 'next/navigation';
import { Clock } from 'lucide-react';

interface Props {
    type: 'carousel' | 'edit';
    tier: 'anonymous' | 'free' | 'paid';
    onClose: () => void;
}

function getResetTime(): string {
    const now = new Date();
    const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
    return tomorrow.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function UsageLimitModal({ type, tier, onClose }: Props) {
    const router = useRouter();

    const isAnonymous = tier === 'anonymous';

    const title = isAnonymous
        ? 'Limite de demonstração atingido'
        : type === 'carousel'
            ? 'Você usou todos os carrosséis de hoje'
            : 'Edições diárias esgotadas';

    const body = isAnonymous
        ? 'Crie uma conta grátis para gerar até 6 carrosséis por dia e editar imagens com IA.'
        : type === 'carousel'
            ? 'Seus carrosséis diários se renovam amanhã. Faça upgrade para gerar sem limites.'
            : 'Suas edições de imagem se renovam amanhã. Faça upgrade para editar sem limites.';

    const primaryLabel = isAnonymous ? 'Criar Conta Grátis' : 'Fazer Upgrade';
    const primaryAction = () => {
        if (isAnonymous) {
            router.push('/login');
        } else {
            // Future: open payment modal
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0a1a] p-8 shadow-2xl shadow-purple/10">
                {/* Icon */}
                <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-purple/10 border border-purple/20 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>

                <h3 className="text-xl font-bold text-white text-center mb-2 font-display">
                    {title}
                </h3>
                <p className="text-sm text-slate-400 text-center mb-4 font-body leading-relaxed">
                    {body}
                </p>

                {!isAnonymous && (
                    <div className="flex items-center justify-center gap-2 mb-8 px-4 py-2 rounded-xl bg-purple/5 border border-purple/10 mx-auto w-fit">
                        <Clock size={14} className="text-purple" />
                        <span className="text-xs text-slate-300 font-body">
                            Disponível novamente em <strong className="text-purple">{getResetTime()}</strong>
                        </span>
                    </div>
                )}

                {isAnonymous && <div className="mb-4" />}

                <div className="flex flex-col gap-3">
                    <button
                        onClick={primaryAction}
                        className="w-full py-3 rounded-xl bg-purple text-white font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-purple/25 cursor-pointer font-display"
                    >
                        {primaryLabel}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl border border-white/10 text-slate-400 text-sm font-medium hover:text-white hover:border-white/20 transition-all cursor-pointer font-body"
                    >
                        {isAnonymous ? 'Continuar sem conta' : 'Voltar amanhã'}
                    </button>
                </div>
            </div>
        </div>
    );
}
