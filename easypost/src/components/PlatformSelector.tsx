'use client';

import { Instagram, Linkedin } from 'lucide-react';
import type { Platform } from '../types';

const PLATFORMS: { id: Platform; label: string; icon: typeof Instagram }[] = [
    { id: 'instagram', label: 'Instagram', icon: Instagram },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
];

interface Props {
    value: Platform | null;
    onChange: (platform: Platform) => void;
}

export default function PlatformSelector({ value, onChange }: Props) {
    return (
        <section className="mb-8 step-enter">
            <h2
                className="text-lg font-semibold mb-4"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
            >
                Plataforma de Destino
            </h2>
            <div className="grid grid-cols-2 gap-4 max-w-md">
                {PLATFORMS.map(({ id, label, icon: Icon }) => {
                    const selected = value === id;
                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => onChange(id)}
                            className={`glass-card cursor-pointer flex flex-col items-center gap-3 py-8 px-4 transition-all ${selected ? 'card-selected' : 'opacity-60 hover:opacity-100'}`}
                            style={{ minHeight: '120px' }}
                            aria-pressed={selected}
                            aria-label={`Selecionar ${label}`}
                        >
                            <Icon
                                size={36}
                                className="transition-colors duration-300"
                                style={{ color: selected ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
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
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
