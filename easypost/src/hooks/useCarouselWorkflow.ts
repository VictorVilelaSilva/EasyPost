'use client';

import { useState } from 'react';
import { CarouselData, ImageConfig, Platform, PostObjective } from '../types';
import { useAuth } from '@/contexts/AuthContext';
import { incrementRequestCount } from '@/lib/userService';

interface CarouselWorkflowState {
    niche: string;
    topics: string[];
    selectedTopic: string | null;
    carouselData: CarouselData | null;
    images: string[] | null;
    showConfig: boolean;
    platform: Platform;
    objective: PostObjective;
    slideCount: number;
    isGeneratingTopics: boolean;
    isGeneratingText: boolean;
    isGeneratingImages: boolean;
}

interface CarouselWorkflowActions {
    setNiche: (niche: string) => void;
    setPlatform: (platform: Platform) => void;
    setObjective: (objective: PostObjective) => void;
    setSlideCount: (count: number) => void;
    handleGenerateTopics: (e: React.FormEvent) => Promise<void>;
    handleSelectTopic: (topic: string) => Promise<void>;
    handleGenerateImages: (config: ImageConfig) => Promise<void>;
}

export type CarouselWorkflow = CarouselWorkflowState & CarouselWorkflowActions;

export function useCarouselWorkflow(): CarouselWorkflow {
    const { user } = useAuth();
    const [niche, setNiche] = useState('');
    const [topics, setTopics] = useState<string[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [carouselData, setCarouselData] = useState<CarouselData | null>(null);
    const [images, setImages] = useState<string[] | null>(null);
    const [showConfig, setShowConfig] = useState(false);

    const [platform, setPlatform] = useState<Platform>('instagram');
    const [objective, setObjective] = useState<PostObjective>('informativo');
    const [slideCount, setSlideCount] = useState(7);

    const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
    const [isGeneratingText, setIsGeneratingText] = useState(false);
    const [isGeneratingImages, setIsGeneratingImages] = useState(false);

    const handleGenerateTopics = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!niche.trim()) return;

        setIsGeneratingTopics(true);
        setTopics([]);
        setSelectedTopic(null);
        setCarouselData(null);
        setImages(null);
        setShowConfig(false);

        try {
            const res = await fetch('/api/generate-topics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ niche }),
            });
            const data = await res.json();
            if (data.topics) {
                setTopics(data.topics);
            } else {
                alert(data.error || 'Falha ao gerar tópicos');
            }
        } catch (e) {
            console.error(e);
            alert('Erro de conexão ao gerar tópicos');
        }
        setIsGeneratingTopics(false);
    };

    const handleSelectTopic = async (topic: string) => {
        setSelectedTopic(topic);
        setIsGeneratingText(true);
        setCarouselData(null);
        setImages(null);
        setShowConfig(false);

        try {
            const resText = await fetch('/api/generate-carousel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, niche, platform, objective, slideCount }),
            });
            const dataText = await resText.json();

            if (!dataText.slides || !dataText.caption) {
                throw new Error(dataText.error || 'Falha ao gerar texto do carrossel');
            }
            setCarouselData(dataText);
            setShowConfig(true);
        } catch (e: unknown) {
            console.error(e);
            if (e instanceof Error) {
                alert(e.message || 'Erro de conexão ao gerar texto do carrossel');
            } else {
                alert('Erro de conexão ao gerar texto do carrossel');
            }
        }
        setIsGeneratingText(false);
    };

    const handleGenerateImages = async (config: ImageConfig) => {
        if (!carouselData) return;

        setIsGeneratingImages(true);
        setImages(null);
        setShowConfig(false);

        try {
            const resImages = await fetch('/api/generate-images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slides: carouselData.slides,
                    visualStyle: config.visualStyle,
                    colorPalette: config.colorPalette,
                    brandColors: config.brandColors,
                    audience: config.audience,
                    customPrompt: config.customPrompt,
                }),
            });
            const dataImages = await resImages.json();

            if (!dataImages.images) {
                throw new Error(dataImages.error || 'Falha ao gerar imagens');
            }

            setImages(dataImages.images);
            if (user) {
                await incrementRequestCount(user.uid);
            }
        } catch (e: unknown) {
            console.error(e);
            if (e instanceof Error) {
                alert(e.message || 'Erro de conexão ao gerar imagens');
            } else {
                alert('Erro de conexão ao gerar imagens');
            }
            setShowConfig(true);
        }
        setIsGeneratingImages(false);
    };

    return {
        niche,
        topics,
        selectedTopic,
        carouselData,
        images,
        showConfig,
        platform,
        objective,
        slideCount,
        isGeneratingTopics,
        isGeneratingText,
        isGeneratingImages,
        setNiche,
        setPlatform,
        setObjective,
        setSlideCount,
        handleGenerateTopics,
        handleSelectTopic,
        handleGenerateImages,
    };
}
