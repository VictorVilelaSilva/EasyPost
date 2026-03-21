'use client';

import { Instagram, Linkedin, Twitter, Music, Sparkles, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import type { Platform } from '@/types';
import { useRouter } from 'next/navigation';

interface UsageInfo {
    remaining: number;
    limit: number;
    tier: 'anonymous' | 'free' | 'paid';
    isLoading: boolean;
}

interface Props {
    platform: Platform | null;
    setPlatform: (v: Platform) => void;
    onComplete: () => void;
    onBack: () => void;
    usage?: UsageInfo;
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

export default function Step1Configuration({ platform, setPlatform, onComplete, onBack, usage }: Props) {
    const router = useRouter();
    const limitReached = usage && !usage.isLoading && usage.remaining <= 0 && usage.limit !== -1;
    const isValid = !!platform && !limitReached;

    return (
        <div className="w-full flex justify-center mt-2 animate-fade-in">
            <div className="w-full max-w-[840px] flex flex-col gap-10">

                {/* Limit reached banner */}
                {limitReached && (
                    <div
                        className="relative overflow-hidden rounded-2xl p-6 border animate-fade-in"
                        style={{
                            background: 'rgba(248, 113, 113, 0.06)',
                            border: '1px solid rgba(248, 113, 113, 0.2)',
                            backdropFilter: 'blur(12px)',
                        }}
                    >
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-red-500 opacity-[0.04] blur-[80px] rounded-full pointer-events-none" />
                        <div className="flex items-start gap-4 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                <AlertTriangle size={22} className="text-red-400" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-lg font-bold text-white font-display">
                                    Limite diário atingido
                                </h3>
                                <p className="text-sm text-slate-400 font-body leading-relaxed">
                                    {usage.tier === 'anonymous'
                                        ? 'Você usou sua demonstração gratuita.'
                                        : `Você já usou seus ${usage.limit} carrosséis de hoje.`
                                    }
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Clock size={14} className="text-[#a855f7]" />
                                    <span className="text-sm text-[#c08cf7] font-medium font-body">
                                        Disponível novamente em {getResetTime()}
                                    </span>
                                </div>
                                {usage.tier === 'anonymous' ? (
                                    <button
                                        onClick={() => router.push('/login')}
                                        className="mt-3 w-fit px-5 py-2.5 rounded-xl bg-[#7f0df2] hover:bg-[#922cee] text-white text-sm font-bold shadow-[0_0_20px_rgba(127,13,242,0.3)] transition-all cursor-pointer font-display"
                                    >
                                        Criar Conta Grátis
                                    </button>
                                ) : usage.tier === 'free' ? (
                                    <button
                                        onClick={() => router.push('/checkout')}
                                        className="mt-3 w-fit px-5 py-2.5 rounded-xl bg-[#7f0df2] hover:bg-[#922cee] text-white text-sm font-bold shadow-[0_0_20px_rgba(127,13,242,0.3)] transition-all cursor-pointer font-display"
                                    >
                                        Fazer Upgrade — Sem Limites
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </div>
                )}

                {/* 1. Seleção de Plataforma */}
                <section className={`flex flex-col gap-4 ${limitReached ? 'opacity-40 pointer-events-none select-none' : ''}`}>
                    <h3 className="text-xl font-bold text-white font-display">1. Seleção de Plataforma</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                        {/* Instagram */}
                        <button
                            type="button"
                            onClick={() => setPlatform('instagram')}
                            className={`glass-card rounded-2xl p-6 flex flex-col items-center justify-center gap-6 aspect-[4/5] group transition-all duration-300 relative overflow-hidden ${platform === 'instagram' ? 'selected border-2 border-[#7f0df2] shadow-[0_0_20px_rgba(127,13,242,0.3)]' : 'border border-[#7f0df2]/10 hover:border-[#7f0df2]/30 hover:bg-[#241930]/80'}`}
                            style={{
                                background: platform === 'instagram' ? 'rgba(36, 25, 48, 0.8)' : 'rgba(22, 16, 29, 0.6)',
                                backdropFilter: 'blur(12px)'
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#833ab4]/20 via-[#fd1d1d]/20 to-[#fcb045]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] flex items-center justify-center shadow-lg shadow-[#bc1888]/30">
                                <Instagram className="text-white" size={32} />
                            </div>
                            <div className="relative z-10 text-center">
                                <h3 className="text-xl font-bold text-white mb-2">Instagram</h3>
                                <p className="text-[11px] text-slate-400">Feed, Stories & Reels</p>
                            </div>
                            {platform === 'instagram' && (
                                <div className="absolute top-4 right-4 bg-[#7f0df2] text-white text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10">
                                    <CheckCircle2 size={12} /> Selecionado
                                </div>
                            )}
                        </button>

                        {/* LinkedIn */}
                        <div className="glass-card opacity-50 pointer-events-none grayscale rounded-2xl p-6 flex flex-col items-center justify-center gap-6 aspect-[4/5] relative border border-[#7f0df2]/10" style={{ background: 'rgba(22, 16, 29, 0.6)', backdropFilter: 'blur(12px)' }}>
                            <div className="relative z-10 w-20 h-20 rounded-2xl bg-[#0077b5] flex items-center justify-center">
                                <Linkedin className="text-white" size={32} />
                            </div>
                            <div className="relative z-10 text-center">
                                <h3 className="text-xl font-bold text-white mb-2">LinkedIn</h3>
                                <p className="text-[11px] text-slate-400">Artigos & Posts</p>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                <div className="bg-[#16101d]/90 border border-slate-700 backdrop-blur-sm px-3 py-1.5 rounded-full font-bold text-xs tracking-wide shadow-xl text-white">
                                    Em breve
                                </div>
                            </div>
                        </div>

                        {/* X (Twitter) */}
                        <div className="glass-card opacity-50 pointer-events-none grayscale rounded-2xl p-6 flex flex-col items-center justify-center gap-6 aspect-[4/5] relative border border-[#7f0df2]/10" style={{ background: 'rgba(22, 16, 29, 0.6)', backdropFilter: 'blur(12px)' }}>
                            <div className="relative z-10 w-20 h-20 rounded-2xl bg-white flex items-center justify-center">
                                <Twitter className="text-black" fill="currentColor" size={32} />
                            </div>
                            <div className="relative z-10 text-center">
                                <h3 className="text-xl font-bold text-white mb-2">X (Twitter)</h3>
                                <p className="text-[11px] text-slate-400">Threads & Tweets</p>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                <div className="bg-[#16101d]/90 border border-slate-700 backdrop-blur-sm px-3 py-1.5 rounded-full font-bold text-xs tracking-wide shadow-xl text-white">
                                    Em breve
                                </div>
                            </div>
                        </div>

                        {/* TikTok */}
                        <div className="glass-card opacity-50 pointer-events-none grayscale rounded-2xl p-6 flex flex-col items-center justify-center gap-6 aspect-[4/5] relative border border-[#7f0df2]/10" style={{ background: 'rgba(22, 16, 29, 0.6)', backdropFilter: 'blur(12px)' }}>
                            <div className="relative z-10 w-20 h-20 rounded-2xl bg-[#010101] flex items-center justify-center border border-[#69C9D0] shadow-[inset_0_0_10px_#EE1D52]">
                                <Music className="text-white" size={32} />
                            </div>
                            <div className="relative z-10 text-center">
                                <h3 className="text-xl font-bold text-white mb-2">TikTok</h3>
                                <p className="text-[11px] text-slate-400">Vídeos curtos</p>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                <div className="bg-[#16101d]/90 border border-slate-700 backdrop-blur-sm px-3 py-1.5 rounded-full font-bold text-xs tracking-wide shadow-xl text-white">
                                    Em breve
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {/* Actions */}
                <div className="w-full flex justify-between items-center border-t border-white/10 pt-8 mt-2">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex items-center justify-center rounded-xl h-12 px-6 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:text-white text-base font-bold transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onComplete}
                        disabled={!isValid}
                        className="flex items-center justify-center gap-2 rounded-xl h-12 px-8 bg-[#7f0df2] hover:bg-[#922cee] disabled:opacity-50 disabled:cursor-not-allowed text-white text-base font-bold shadow-[0_0_20px_rgba(127,13,242,0.4)] transition-all transform hover:-translate-y-0.5"
                    >
                        {limitReached ? 'Limite Atingido' : 'Próximo Passo'}
                        {limitReached ? <Clock size={18} /> : <Sparkles size={18} />}
                    </button>
                </div>

            </div>
        </div>
    );
}
