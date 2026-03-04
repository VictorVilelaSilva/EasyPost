'use client';

import { useState } from 'react';
import { CarouselData, ImageConfig } from '../types';

interface CarouselWorkflowState {
    niche: string;
    platform: string;
    objective: string;
    language: string;
    slidesCount: string;
    topics: string[];
    selectedTopic: string | null;
    carouselData: CarouselData | null;
    images: string[] | null;
    showConfig: boolean;
    isGeneratingTopics: boolean;
    isGeneratingText: boolean;
    isGeneratingImages: boolean;
}

interface CarouselWorkflowActions {
    setNiche: (niche: string) => void;
    setPlatform: (platform: string) => void;
    setObjective: (objective: string) => void;
    setLanguage: (language: string) => void;
    setSlidesCount: (slidesCount: string) => void;
    handleGenerateTopics: (e: React.FormEvent) => Promise<void>;
    handleSelectTopic: (topic: string) => Promise<void>;
    handleGenerateImages: (config: ImageConfig) => Promise<void>;
}

export type CarouselWorkflow = CarouselWorkflowState & CarouselWorkflowActions;

export function useCarouselWorkflow(): CarouselWorkflow {
    const [niche, setNiche] = useState('');
    const [platform, setPlatform] = useState('instagram');
    const [objective, setObjective] = useState('commercial');
    const [language, setLanguage] = useState('portugueseBR');
    const [slidesCount, setSlidesCount] = useState('');
    const [topics, setTopics] = useState<string[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [carouselData, setCarouselData] = useState<CarouselData | null>(null);
    const [images, setImages] = useState<string[] | null>(null);
    const [showConfig, setShowConfig] = useState(false);

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
                body: JSON.stringify({ niche, platform, language }),
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

        const count = parseInt(slidesCount, 10);
        const finalSlidesCount = count > 0 ? count : 5;

        try {
            const resText = await fetch('/api/generate-carousel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, niche, platform, objective, language, slidesCount: finalSlidesCount }),
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
                    topic: selectedTopic,
                    niche,
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
        platform,
        objective,
        language,
        slidesCount,
        topics,
        selectedTopic,
        carouselData,
        images,
        showConfig,
        isGeneratingTopics,
        isGeneratingText,
        isGeneratingImages,
        setNiche,
        setPlatform,
        setObjective,
        setLanguage,
        setSlidesCount,
        handleGenerateTopics,
        handleSelectTopic,
        handleGenerateImages,
    };
}
