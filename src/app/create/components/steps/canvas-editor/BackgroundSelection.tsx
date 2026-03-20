'use client';

import { Sparkles, Check } from 'lucide-react';
import { BgSelectionProps, SlideType } from './types';

export function BackgroundSelection({ backgrounds, selected, onSelect, onContinue, onBack }: BgSelectionProps) {
    const rows: Array<{ type: SlideType; label: string; images: string[] }> = [
        { type: 'cover', label: 'Capa', images: backgrounds.cover },
        { type: 'content', label: 'Conteúdo', images: backgrounds.content },
        { type: 'cta', label: 'Final (CTA)', images: backgrounds.cta },
    ];

    return (
        <div className="w-full flex flex-col gap-8 animate-fade-in" style={{ fontFamily: 'var(--font-display)' }}>
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-1">Escolha os Fundos</h2>
                <p className="text-sm text-slate-400">Selecione um fundo para cada tipo de slide</p>
            </div>

            <div className="flex flex-col gap-8">
                {rows.map(({ type, label, images }) => (
                    <div key={type} className="flex flex-col gap-3">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{label}</span>
                        <div className="flex gap-4">
                            {images.map((img, i) => {
                                const isSelected = selected[type] === i;
                                return (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => onSelect(type, i)}
                                        className="relative flex-1 aspect-[4/5] max-w-[200px] rounded-xl overflow-hidden transition-all duration-200 cursor-pointer"
                                        style={{
                                            border: isSelected ? '2px solid #7f0df2' : '1px solid rgba(255,255,255,0.08)',
                                            boxShadow: isSelected ? '0 0 20px rgba(127,13,242,0.4)' : 'none',
                                        }}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={`data:image/png;base64,${img}`}
                                            alt={`${label} opção ${i + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#7f0df2] flex items-center justify-center shadow-lg">
                                                <Check size={12} className="text-white" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center border-t border-white/10 pt-6">
                <button type="button" onClick={onBack} className="px-6 h-12 rounded-xl text-slate-400 hover:text-white font-bold transition-colors cursor-pointer">
                    Voltar
                </button>
                <button
                    type="button"
                    onClick={onContinue}
                    className="flex items-center gap-2 px-8 h-12 rounded-xl bg-[#7f0df2] hover:bg-[#922cee] text-white font-bold shadow-[0_0_20px_rgba(127,13,242,0.4)] transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                    Próximo: Editor
                    <Sparkles size={16} />
                </button>
            </div>
        </div>
    );
}
