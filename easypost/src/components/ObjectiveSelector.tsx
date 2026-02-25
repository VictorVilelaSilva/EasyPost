'use client';

import { ShoppingCart, BookOpen, Award, MessageCircle } from 'lucide-react';
import type { PostObjective } from '../types';

const OBJECTIVES: { id: PostObjective; label: string; description: string; icon: typeof ShoppingCart }[] = [
    { id: 'comercial', label: 'Comercial', description: 'Venda e conversão', icon: ShoppingCart },
    { id: 'informativo', label: 'Informativo', description: 'Educar e informar', icon: BookOpen },
    { id: 'autoridade', label: 'Autoridade', description: 'Posicionamento especialista', icon: Award },
    { id: 'engajamento', label: 'Engajamento', description: 'Interação e conexão', icon: MessageCircle },
];

interface Props {
    value: PostObjective | null;
    onChange: (objective: PostObjective) => void;
}

export default function ObjectiveSelector({ value, onChange }: Props) {
    return (
        <section className="mb-8 step-enter">
            <h2
                className="text-lg font-semibold mb-4"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
            >
                Objetivo do Post
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
                {OBJECTIVES.map(({ id, label, description, icon: Icon }) => {
                    const selected = value === id;
                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => onChange(id)}
                            className={`glass-card cursor-pointer flex flex-col items-center gap-2 py-6 px-3 transition-all ${selected ? 'card-selected-accent' : 'opacity-60 hover:opacity-100'}`}
                            style={{ minHeight: '110px' }}
                            aria-pressed={selected}
                            aria-label={`Objetivo: ${label}`}
                        >
                            <Icon
                                size={26}
                                className="transition-colors duration-300"
                                style={{ color: selected ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
                            />
                            <span
                                className="font-medium text-sm transition-colors duration-300"
                                style={{
                                    fontFamily: 'var(--font-display)',
                                    color: selected ? 'var(--color-text)' : 'var(--color-text-muted)',
                                }}
                            >
                                {label}
                            </span>
                            <span
                                className="text-xs text-center leading-tight"
                                style={{ color: 'var(--color-text-subtle)' }}
                            >
                                {description}
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
