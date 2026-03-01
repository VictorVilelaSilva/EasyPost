'use client';

import { ShoppingCart, BookOpen, Award, MessageCircle, Target } from 'lucide-react';
import type { PostObjective } from '@/types';

const OBJECTIVES: { id: PostObjective; label: string; description: string; icon: typeof ShoppingCart }[] = [
    { id: 'comercial', label: 'Vendas', description: 'Pitch direto & foco em conversão', icon: ShoppingCart },
    { id: 'informativo', label: 'Informativo', description: 'Foco no valor e educacional', icon: BookOpen },
    { id: 'autoridade', label: 'Autoridade', description: 'Liderança e posiciomaneto', icon: Award },
    { id: 'engajamento', label: 'Engajamento', description: 'Perguntas e ganchos virais', icon: MessageCircle },
];

interface Props {
    value: PostObjective | null;
    onChange: (objective: PostObjective) => void;
}

export default function ObjectiveSelector({ value, onChange }: Props) {
    return (
        <section className="flex flex-col gap-4 mt-8">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-[#A855F7]"><Target size={20} /></span>
                <h3 className="text-lg font-semibold text-white font-display">3. Objetivo do Conteúdo</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {OBJECTIVES.map(({ id, label, description, icon: Icon }) => {
                    const selected = value === id;
                    return (
                        <div
                            key={id}
                            onClick={() => onChange(id)}
                            className={`cursor-pointer p-4 rounded-lg border transition-all flex flex-col gap-2 group
                                ${selected
                                    ? 'border-[#A855F7]/60 bg-[#A855F7]/5'
                                    : 'bg-white/5 border-white/10 hover:border-[#A855F7]/50'
                                }`}
                        >
                            <Icon
                                size={24}
                                className={`transition-transform group-hover:scale-110 ${selected ? 'text-[#A855F7]' : 'text-slate-400 group-hover:text-[#A855F7]'}`}
                            />
                            <h4 className="font-bold text-sm text-white">{label}</h4>
                            <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                {description}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
