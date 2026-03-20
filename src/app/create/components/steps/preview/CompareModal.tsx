'use client';

import { X } from 'lucide-react';

interface CompareModalProps {
    original: string;
    edited: string;
    onAccept: () => void;
    onReject: () => void;
}

export function CompareModal({ original, edited, onAccept, onReject }: CompareModalProps) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div
                className="w-full max-w-3xl mx-4 rounded-2xl border border-white/10 p-6"
                style={{ background: 'rgba(22,16,29,0.95)', backdropFilter: 'blur(24px)' }}
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                        Comparar Versões
                    </h3>
                    <button
                        type="button"
                        onClick={onReject}
                        className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Original</p>
                        <div className="rounded-xl overflow-hidden border border-white/10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={original} alt="Original" className="w-full h-auto" />
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-[#c084fc] uppercase tracking-wider mb-2">Nova Versão</p>
                        <div className="rounded-xl overflow-hidden border border-[#7f0df2]/30">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={edited} alt="Nova versão" className="w-full h-auto" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onReject}
                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                    >
                        Manter Original
                    </button>
                    <button
                        type="button"
                        onClick={onAccept}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#7f0df2] hover:bg-[#7f0df2]/90 transition-all cursor-pointer"
                        style={{ boxShadow: '0 0 15px rgba(127,13,242,0.4)' }}
                    >
                        Usar Nova
                    </button>
                </div>
            </div>
        </div>
    );
}
