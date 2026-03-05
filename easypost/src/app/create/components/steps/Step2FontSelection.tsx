'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { CarouselData, Platform } from '@/types';

const FontSelectionStep = dynamic(() => import('../FontSelectionStep'), {
    loading: () => (
        <div className="flex items-center justify-center py-12 glass-card-static border-dashed">
            <Loader2 className="animate-spin text-[#A855F7]" size={32} />
        </div>
    ),
});

interface Props {
    platform: Platform;
    carouselData: CarouselData;
    selectedFont: string;
    setSelectedFont: (v: string) => void;
    onContinue: () => void;
}

export default function Step2FontSelection({ platform, carouselData, selectedFont, setSelectedFont, onContinue }: Props) {
    return (
        <div className="glass-panel rounded-xl p-8 border border-white/5 shadow-2xl animate-fade-in mt-8" style={{ background: 'rgba(25, 16, 34, 0.6)', backdropFilter: 'blur(12px)' }}>
            <FontSelectionStep
                platform={platform}
                carouselData={carouselData}
                value={selectedFont}
                onChange={setSelectedFont}
                onContinue={onContinue}
            />
        </div>
    );
}
