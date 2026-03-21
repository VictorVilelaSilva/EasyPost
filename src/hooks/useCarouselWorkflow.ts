'use client';

import { useState } from 'react';
import { CarouselData, ImageConfig, Platform, PostObjective, ReferenceImages } from '../types';
import { useAuth } from '@/contexts/AuthContext';
import { incrementRequestCount } from '@/lib/userService';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

interface CarouselWorkflowState {
    carouselData: CarouselData | null;
    slideImages: string[] | null;   // data URLs — one per slide, text+background combined
    platform: Platform;
    objective: PostObjective;
    slideCount: number;
    isGeneratingText: boolean;
    isGeneratingImages: boolean;
}

interface CarouselWorkflowActions {
    setPlatform: (platform: Platform) => void;
    setObjective: (objective: PostObjective) => void;
    setSlideCount: (count: number) => void;
    setSlideImages: (images: string[] | null) => void;
    setCarouselData: (data: CarouselData | null) => void;
    handleGenerateAll: (config: ImageConfig, referenceImages?: ReferenceImages) => Promise<void>;
    onLimitReached: ((info: { type: 'carousel' | 'edit'; tier: string }) => void) | null;
    setOnLimitReached: (cb: ((info: { type: 'carousel' | 'edit'; tier: string }) => void) | null) => void;
}

export type CarouselWorkflow = CarouselWorkflowState & CarouselWorkflowActions;

export function useCarouselWorkflow(): CarouselWorkflow {
    const { user } = useAuth();
    const [carouselData, setCarouselData] = useState<CarouselData | null>(null);
    const [slideImages, setSlideImages] = useState<string[] | null>(null);

    const [platform, setPlatform] = useState<Platform>('instagram');
    const [objective, setObjective] = useState<PostObjective>('informativo');
    const [slideCount, setSlideCount] = useState(7);

    const [isGeneratingText, setIsGeneratingText] = useState(false);
    const [isGeneratingImages, setIsGeneratingImages] = useState(false);
    const [onLimitReached, setOnLimitReached] = useState<((info: { type: 'carousel' | 'edit'; tier: string }) => void) | null>(null);

    const getAuthHeaders = async (): Promise<Record<string, string>> => {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const currentUser = auth.currentUser;
        if (currentUser) {
            const token = await currentUser.getIdToken();
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    };

    const handleGenerateAll = async (config: ImageConfig, referenceImages?: ReferenceImages) => {
        const topic = config.customPrompt || '';
        const nicheVal = config.audience?.interests || '';
        const count = config.slideCount ?? slideCount;
        const headers = await getAuthHeaders();

        setIsGeneratingText(true);
        setCarouselData(null);
        setSlideImages(null);

        let carousel: CarouselData | null = null;

        try {
            const resText = await fetch('/api/generate-carousel', {
                method: 'POST',
                headers,
                body: JSON.stringify({ topic, niche: nicheVal, platform, objective, slideCount: count }),
            });

            if (resText.status === 429) {
                const limitData = await resText.json();
                onLimitReached?.({ type: 'carousel', tier: limitData.tier });
                setIsGeneratingText(false);
                return;
            }

            const dataText = await resText.json();

            if (!dataText.slides || !dataText.caption) {
                throw new Error(dataText.error || 'Falha ao gerar texto do carrossel');
            }
            carousel = dataText;
            setCarouselData(carousel);
        } catch (e: unknown) {
            console.error(e);
            toast.error(e instanceof Error ? e.message : 'Erro ao gerar texto do carrossel');
            setIsGeneratingText(false);
            return;
        }

        setIsGeneratingText(false);
        setIsGeneratingImages(true);

        try {
            const resImages = await fetch('/api/generate-images', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    slides: carousel!.slides,
                    platform,
                    handle: config.handle || '',
                    color: config.color || '',
                    ...(referenceImages && Object.keys(referenceImages).length > 0 && {
                        referenceImages: Object.fromEntries(
                            Object.entries(referenceImages).map(([key, val]) => [
                                key,
                                val ? val.replace(/^data:image\/\w+;base64,/, '') : undefined,
                            ]).filter(([, v]) => v)
                        ),
                    }),
                }),
            });

            if (resImages.status === 429) {
                const limitData = await resImages.json();
                onLimitReached?.({ type: 'carousel', tier: limitData.tier });
                setIsGeneratingImages(false);
                return;
            }

            const dataImages = await resImages.json();

            if (!dataImages.images) {
                throw new Error(dataImages.error || 'Falha ao gerar imagens');
            }

            setSlideImages(dataImages.images.map((b64: string) => `data:image/png;base64,${b64}`));

            if (user) {
                await incrementRequestCount(user.uid);
            }
        } catch (e: unknown) {
            console.error(e);
            toast.error(e instanceof Error ? e.message : 'Erro ao gerar imagens');
        }

        setIsGeneratingImages(false);
    };

    return {
        carouselData,
        slideImages,
        platform,
        objective,
        slideCount,
        isGeneratingText,
        isGeneratingImages,
        setPlatform,
        setObjective,
        setSlideCount,
        setSlideImages,
        setCarouselData,
        handleGenerateAll,
        onLimitReached,
        setOnLimitReached,
    };
}
