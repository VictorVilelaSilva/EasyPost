'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Sparkles } from 'lucide-react';
import TopicList from './TopicList';
import PlatformSelector from './PlatformSelector';
import ObjectiveSelector from './ObjectiveSelector';
import SlideCountInput from './SlideCountInput';
import StepIndicator, { StepKey } from './StepIndicator';
import { CarouselData, ImageConfig, Platform, PostObjective } from '../types';

const ImageConfigPanel = dynamic(() => import('./ImageConfig'), {
    loading: () => (
        <div className="flex items-center justify-center py-12 glass-card-static" style={{ borderStyle: 'dashed' }}>
            <Loader2 className="animate-spin" size={32} style={{ color: 'var(--color-primary)' }} />
        </div>
    ),
});

const CarouselPreview = dynamic(() => import('./CarouselPreview'), {
    loading: () => (
        <div className="flex items-center justify-center py-12 glass-card-static" style={{ borderStyle: 'dashed' }}>
            <Loader2 className="animate-spin" size={32} style={{ color: 'var(--color-accent)' }} />
        </div>
    ),
});

/* Skeleton loader for text generation */
function SkeletonSlides() {
    return (
        <div className="glass-card-static p-6 mb-8 step-enter" style={{ borderStyle: 'dashed' }}>
            <div className="flex items-center gap-3 mb-6">
                <Loader2 className="animate-spin" size={24} style={{ color: 'var(--color-primary)' }} />
                <span className="font-medium text-sm" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
                    Gerando texto dos slides e legenda…
                </span>
            </div>
            <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer aspect-square rounded-xl" />
                ))}
            </div>
        </div>
    );
}

/* Skeleton loader for image generation */
function SkeletonImages({ count }: { count: number }) {
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

export default function HomeClient() {
    // Post config state
    const [platform, setPlatform] = useState<Platform | null>(null);
    const [objective, setObjective] = useState<PostObjective | null>(null);
    const [slideCount, setSlideCount] = useState(5);

    // Content state
    const [niche, setNiche] = useState('');
    const [topics, setTopics] = useState<string[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [carouselData, setCarouselData] = useState<CarouselData | null>(null);
    const [images, setImages] = useState<string[] | null>(null);
    const [showConfig, setShowConfig] = useState(false);

    // Loading states
    const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
    const [isGeneratingText, setIsGeneratingText] = useState(false);
    const [isGeneratingImages, setIsGeneratingImages] = useState(false);

    const canProceedToNiche = platform !== null && objective !== null;

    // Step indicator logic
    const currentStep: StepKey = useMemo(() => {
        if (images) return 'preview';
        if (showConfig || isGeneratingImages) return 'config';
        if (selectedTopic || isGeneratingText) return 'config';
        if (topics.length > 0 || isGeneratingTopics) return 'niche';
        if (canProceedToNiche) return 'slides';
        if (platform) return 'objective';
        return 'platform';
    }, [platform, canProceedToNiche, topics, isGeneratingTopics, selectedTopic, isGeneratingText, showConfig, isGeneratingImages, images]);

    const completedSteps = useMemo(() => {
        const s = new Set<StepKey>();
        if (platform) s.add('platform');
        if (objective) s.add('objective');
        if (canProceedToNiche) s.add('slides');
        if (topics.length > 0) s.add('niche');
        if (carouselData) s.add('config');
        if (images) s.add('preview');
        return s;
    }, [platform, objective, canProceedToNiche, topics, carouselData, images]);

    const handleGenerateTopics = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!niche.trim() || !platform || !objective) return;

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
                body: JSON.stringify({ niche, platform, objective }),
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
        if (!platform || !objective) return;

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
        } catch (e: any) {
            console.error(e);
            alert(e.message || 'Erro de conexão ao gerar texto do carrossel');
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
                    platform,
                }),
            });
            const dataImages = await resImages.json();

            if (!dataImages.images) {
                throw new Error(dataImages.error || 'Falha ao gerar imagens');
            }

            setImages(dataImages.images);
        } catch (e: any) {
            console.error(e);
            alert(e.message || 'Erro de conexão ao gerar imagens');
            setShowConfig(true);
        }
        setIsGeneratingImages(false);
    };

    return (
        <>
            {/* Step Progress Indicator */}
            <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />

            {/* Step 1: Platform */}
            <PlatformSelector value={platform} onChange={setPlatform} />

            {/* Step 2: Objective */}
            {platform && (
                <ObjectiveSelector value={objective} onChange={setObjective} />
            )}

            {/* Step 3: Slide Count */}
            {canProceedToNiche && (
                <SlideCountInput
                    value={slideCount}
                    onChange={setSlideCount}
                    min={2}
                    max={platform === 'instagram' ? 10 : 20}
                />
            )}

            {/* Step 4: Niche + Generate Topics */}
            {canProceedToNiche && (
                <form onSubmit={handleGenerateTopics} className="max-w-2xl mx-auto mb-12 step-enter">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            value={niche}
                            onChange={(e) => setNiche(e.target.value)}
                            placeholder="Ex: Dicas de Design, Fitness para iniciantes…"
                            name="niche"
                            autoComplete="off"
                            aria-label="Seu nicho de conteúdo"
                            className="input-glow flex-1 px-5 py-3.5 rounded-xl text-base"
                            style={{
                                background: 'var(--color-card)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text)',
                                fontFamily: 'var(--font-body)',
                                minHeight: '48px',
                            }}
                            required
                        />
                        <button
                            type="submit"
                            disabled={isGeneratingTopics || !niche.trim()}
                            aria-label="Gerar temas em alta para seu nicho"
                            className="btn-glow cursor-pointer px-7 py-3.5 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                                fontFamily: 'var(--font-display)',
                                minHeight: '48px',
                            }}
                        >
                            {isGeneratingTopics ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    <Sparkles size={18} />
                                    Gerar 15 Temas em Alta
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}

            {/* Skeleton: gerando texto */}
            {isGeneratingText && <SkeletonSlides />}

            {/* Painel de Configuração */}
            {showConfig && carouselData && selectedTopic && (
                <div className="step-enter">
                    <ImageConfigPanel
                        topic={selectedTopic}
                        onGenerate={handleGenerateImages}
                        isLoading={isGeneratingImages}
                    />
                </div>
            )}

            {/* Skeleton: gerando imagens */}
            {isGeneratingImages && <SkeletonImages count={slideCount} />}

            {/* Preview do Carrossel */}
            {!isGeneratingImages && carouselData && selectedTopic && images && (
                <CarouselPreview data={carouselData} topic={selectedTopic} images={images} />
            )}

            {/* Lista de Temas */}
            {!carouselData && !isGeneratingText && (
                <TopicList
                    topics={topics}
                    onSelect={handleSelectTopic}
                    isLoadingCarousel={isGeneratingText}
                />
            )}
        </>
    );
}
