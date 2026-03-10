'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { ImageConfig } from '@/types';

const ImageConfigPanel = dynamic(() => import('../ImageConfig'), {
    loading: () => (
        <div className="flex items-center justify-center py-12 glass-card-static border-dashed">
            <Loader2 className="animate-spin text-[#A855F7]" size={32} />
        </div>
    ),
});

interface Props {
    selectedTopic: string;
    onContinue: (config: ImageConfig) => void;
    onBack: () => void;
}

export default function Step3ImageConfig({ selectedTopic, onContinue, onBack }: Props) {
    return (
        <div className="glass-panel rounded-xl p-0 overflow-hidden border border-white/5 shadow-2xl animate-fade-in mt-8" style={{ background: 'rgba(25, 16, 34, 0.6)', backdropFilter: 'blur(12px)' }}>
            <ImageConfigPanel
                topic={selectedTopic}
                onContinue={onContinue}
                onBack={onBack}
            />
        </div>
    );
}
