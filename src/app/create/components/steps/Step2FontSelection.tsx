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
    platform: Platform | null;
    carouselData: CarouselData | null;
    selectedFont: string;
    setSelectedFont: (v: string) => void;
    onContinue: () => void;
    onBack: () => void;
}

export default function Step2FontSelection({ platform, carouselData, selectedFont, setSelectedFont, onContinue, onBack }: Props) {
    return (
        <div className="w-full animate-fade-in mt-4">
            <FontSelectionStep
                platform={platform}
                carouselData={carouselData}
                value={selectedFont}
                onChange={setSelectedFont}
                onContinue={onContinue}
                onBack={onBack}
            />
        </div>
    );
}
