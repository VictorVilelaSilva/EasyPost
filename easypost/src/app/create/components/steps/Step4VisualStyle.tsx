'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { ImageConfig } from '@/types';

const VisualStyleGallery = dynamic(() => import('../VisualStyleGallery'), {
    loading: () => (
        <div className="flex items-center justify-center py-12 glass-card-static border-dashed">
            <Loader2 className="animate-spin text-[#A855F7]" size={32} />
        </div>
    ),
});

interface Props {
    partialImageConfig: Omit<ImageConfig, 'visualStyle'>;
    handleGenerateImages: (config: ImageConfig) => void;
    isGeneratingImages: boolean;
}

export default function Step4VisualStyle({ partialImageConfig, handleGenerateImages, isGeneratingImages }: Props) {
    return (
        <div className="glass-panel rounded-xl p-0 overflow-hidden border border-white/5 shadow-2xl animate-fade-in mt-8" style={{ background: 'rgba(25, 16, 34, 0.6)', backdropFilter: 'blur(12px)' }}>
            <VisualStyleGallery
                onGenerate={(visualStyle: string) => handleGenerateImages({ ...partialImageConfig, visualStyle })}
                isLoading={isGeneratingImages}
            />
        </div>
    );
}
