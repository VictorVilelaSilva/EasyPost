'use client';

import { useState, useCallback } from 'react';
import { SlideBackgrounds, CarouselData, Platform } from '@/types';
import { BackgroundSelection } from './canvas-editor/BackgroundSelection';
import { CanvasEditorPhase } from './canvas-editor/CanvasEditorPhase';
import { SlideState, SlideType } from './canvas-editor/types';
import { initTextBlocks } from './canvas-editor/utils';

interface Props {
    backgrounds: SlideBackgrounds;
    carouselData: CarouselData | null;
    platform: Platform;
    selectedFont: string;
    onBack: () => void;
}

export default function Step5CanvasEditor({ backgrounds, carouselData, platform, selectedFont, onBack }: Props) {
    const hasVariants = backgrounds.cover.length > 1;

    const [phase, setPhase] = useState<'selection' | 'editor'>(hasVariants ? 'selection' : 'editor');
    const [selectedBgIndex, setSelectedBgIndex] = useState({ cover: 0, content: 0, cta: 0 });

    // Build slide states from carouselData + selected backgrounds
    const buildSlides = useCallback((): SlideState[] => {
        if (!carouselData) return [];
        return carouselData.slides.map((slide, i) => {
            const type = slide.slideType as SlideType;
            const bg = type === 'cover'
                ? backgrounds.cover[selectedBgIndex.cover]
                : type === 'cta'
                    ? backgrounds.cta[selectedBgIndex.cta]
                    : backgrounds.content[selectedBgIndex.content];
            return {
                slideIndex: i,
                slideType: type,
                backgroundBase64: bg,
                textBlocks: initTextBlocks(type, slide.title, slide.content, selectedFont),
                fusedImage: null,
            };
        });
    }, [carouselData, backgrounds, selectedBgIndex, selectedFont]);

    const [slides, setSlides] = useState<SlideState[]>(buildSlides);

    const updateSlide = useCallback((index: number, patch: Partial<SlideState>) => {
        setSlides(prev => prev.map((s, i) => i === index ? { ...s, ...patch } : s));
    }, []);

    const handleSelectBg = (type: SlideType, index: number) => {
        setSelectedBgIndex(prev => ({ ...prev, [type]: index }));
    };

    const handleContinueToEditor = () => {
        setSlides(buildSlides());
        setPhase('editor');
    };

    if (phase === 'selection') {
        return (
            <BackgroundSelection
                backgrounds={backgrounds}
                selected={selectedBgIndex}
                onSelect={handleSelectBg}
                onContinue={handleContinueToEditor}
                onBack={onBack}
            />
        );
    }

    return (
        <CanvasEditorPhase
            slides={slides}
            platform={platform}
            caption={carouselData?.caption ?? ''}
            onUpdateSlide={updateSlide}
            onBack={() => setPhase('selection')}
        />
    );
}
