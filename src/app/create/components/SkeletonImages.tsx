'use client';

import { Loader2 } from 'lucide-react';

interface Props {
    count: number;
}

export default function SkeletonImages({ count }: Props) {
    return (
        <div className="glass-card-static p-6 mb-8 step-enter" style={{ borderStyle: 'dashed' }}>
            <div className="flex items-center gap-3 mb-6">
                <Loader2 className="animate-spin" size={24} style={{ color: 'var(--color-accent)' }} />
                <span className="font-medium text-sm" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
                    Criando suas {count} imagens com IA…
                </span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer aspect-square rounded-xl" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
            </div>
        </div>
    );
}
