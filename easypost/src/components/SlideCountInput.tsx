'use client';

import { Minus, Plus } from 'lucide-react';

interface Props {
    value: number;
    onChange: (count: number) => void;
    min?: number;
    max?: number;
}

export default function SlideCountInput({ value, onChange, min = 2, max = 15 }: Props) {
    const decrement = () => onChange(Math.max(min, value - 1));
    const increment = () => onChange(Math.min(max, value + 1));

    return (
        <section className="mb-8 step-enter">
            <h2
                className="text-lg font-semibold mb-4"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
            >
                Quantidade de Slides
            </h2>
            <div className="flex items-center gap-4 max-w-xs">
                <button
                    type="button"
                    onClick={decrement}
                    disabled={value <= min}
                    className="glass-card cursor-pointer flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-100"
                    style={{ width: '48px', height: '48px' }}
                    aria-label="Diminuir slides"
                >
                    <Minus size={18} style={{ color: 'var(--color-text-muted)' }} />
                </button>

                <div
                    className="glass-card-static flex items-center justify-center w-20 h-14 text-2xl font-bold tabular-nums gradient-text"
                    style={{ fontFamily: 'var(--font-display)' }}
                >
                    {value}
                </div>

                <button
                    type="button"
                    onClick={increment}
                    disabled={value >= max}
                    className="glass-card cursor-pointer flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-100"
                    style={{ width: '48px', height: '48px' }}
                    aria-label="Aumentar slides"
                >
                    <Plus size={18} style={{ color: 'var(--color-text-muted)' }} />
                </button>

                <span
                    className="text-sm ml-2"
                    style={{ color: 'var(--color-text-subtle)' }}
                >
                    slides no carrossel
                </span>
            </div>
        </section>
    );
}
