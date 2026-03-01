'use client';

import { Instagram, Linkedin, CheckCircle2 } from 'lucide-react';
import type { Platform } from '@/types';

const PLATFORMS: { id: Platform; label: string; description: string; icon: typeof Instagram }[] = [
    { id: 'instagram', label: 'Instagram', description: 'Otimizado para Reels & Carrosseis', icon: Instagram },
    { id: 'linkedin', label: 'LinkedIn', description: 'Formatos profissionais e PDFs', icon: Linkedin },
];

interface Props {
    value: Platform | null;
    onChange: (platform: Platform) => void;
}

export default function PlatformSelector({ value, onChange }: Props) {
    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-[#A855F7]"><Instagram size={20} /></span>
                <h3 className="text-lg font-semibold text-white font-display">1. Plataforma</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {PLATFORMS.map(({ id, label, description, icon: Icon }) => {
                    const selected = value === id;
                    return (
                        <div
                            key={id}
                            onClick={() => onChange(id)}
                            className={`relative group cursor-pointer rounded-xl p-6 border-2 flex flex-col items-center gap-3 transition-all
                                ${selected
                                    ? 'border-[#A855F7] bg-[#A855F7]/10'
                                    : 'border-white/5 bg-white/5 hover:bg-white/10'
                                }`}
                        >
                            {/* Checkmark for selected state */}
                            {selected && (
                                <div className="absolute top-3 right-3 text-[#A855F7]">
                                    <CheckCircle2 size={16} />
                                </div>
                            )}

                            {/* Icon Container */}
                            <div className={`p-4 rounded-full transition-colors ${selected ? 'bg-[#A855F7]/20 text-[#A855F7]' : 'bg-[#1e293b] text-slate-400 group-hover:text-white'}`}>
                                <Icon size={28} />
                            </div>

                            <p className={`font-bold tracking-wide transition-colors ${selected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                {label}
                            </p>
                            <p className="text-xs text-slate-400 text-center">
                                {description}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
