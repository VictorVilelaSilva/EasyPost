'use client';

import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

interface EditPromptModalProps {
    onSubmit: (prompt: string) => void;
    onClose: () => void;
    isLoading: boolean;
}

export function EditPromptModal({ onSubmit, onClose, isLoading }: EditPromptModalProps) {
    const [prompt, setPrompt] = useState('');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div
                className="w-full max-w-md mx-4 rounded-2xl border border-white/10 p-6"
                style={{ background: 'rgba(22,16,29,0.95)', backdropFilter: 'blur(24px)' }}
            >
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                        <Sparkles size={16} className="inline mr-2 text-[#7f0df2]" />
                        Editar com IA
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Descreva o que deseja alterar..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 resize-none focus:outline-none focus:border-[#7f0df2]/50 focus:ring-1 focus:ring-[#7f0df2]/30 transition-all"
                    disabled={isLoading}
                    autoFocus
                />

                <div className="flex items-center justify-end gap-3 mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={() => prompt.trim() && onSubmit(prompt.trim())}
                        disabled={isLoading || !prompt.trim()}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#7f0df2] hover:bg-[#7f0df2]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                        {isLoading ? (
                            <>
                                <span className="animate-spin">&#x27F3;</span>
                                Editando...
                            </>
                        ) : (
                            <>
                                <Sparkles size={14} />
                                Aplicar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
