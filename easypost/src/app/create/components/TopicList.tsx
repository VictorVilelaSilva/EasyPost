'use client';

import { ArrowRight } from 'lucide-react';

interface Props {
    topics: string[];
    onSelect: (topic: string) => void;
    isLoadingCarousel: boolean;
}

export default function TopicList({ topics, onSelect, isLoadingCarousel }: Props) {
    if (topics.length === 0) return null;

    return (
        <div className="w-full mt-8 animate-reveal">
            <h2 className="text-xl font-semibold mb-5" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                Escolha um Tema para Gerar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 stagger-children">
                {topics.map((topic, i) => (
                    <button
                        key={i}
                        onClick={() => onSelect(topic)}
                        disabled={isLoadingCarousel}
                        aria-label={`Gerar carrossel sobre ${topic}`}
                        className="glass-card group text-left p-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between gap-3"
                        style={{ minHeight: '48px' }}
                    >
                        <span style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }} className="text-sm font-medium leading-snug">
                            {topic}
                        </span>
                        <ArrowRight
                            size={16}
                            className="shrink-0 opacity-0 -translate-x-2 group-hover:opacity-70 group-hover:translate-x-0 transition-all duration-300"
                            style={{ color: 'var(--color-primary)' }}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
