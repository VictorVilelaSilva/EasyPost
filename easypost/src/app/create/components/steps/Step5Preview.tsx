'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { CarouselData } from '@/types';

const CarouselPreview = dynamic(() => import('../CarouselPreview'), {
    loading: () => (
        <div className="flex items-center justify-center py-12 glass-card-static border-dashed">
            <Loader2 className="animate-spin text-[#A855F7]" size={32} />
        </div>
    ),
});

interface Props {
    carouselData: CarouselData;
    selectedTopic: string | null;
    manualTopic: string;
    niche: string;
    images: string[];
}

export default function Step5Preview({ carouselData, selectedTopic, manualTopic, niche, images }: Props) {
    return (
        <CarouselPreview
            data={carouselData}
            topic={selectedTopic || manualTopic || niche}
            images={images}
        />
    );
}
