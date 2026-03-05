'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Loader2, Sparkles, Wand2, Lightbulb, Bolt, ArrowLeft } from 'lucide-react';
import TopicList from './TopicList';
import LoadingCard from './LoadingCard';
import PlatformSelector from './PlatformSelector';
import ObjectiveSelector from './ObjectiveSelector';
import SlideCountInput from './SlideCountInput';
import { useCarouselWorkflow } from '@/hooks/useCarouselWorkflow';

const ImageConfigPanel = dynamic(() => import('./ImageConfig'), {
    loading: () => (
        <div className="flex items-center justify-center py-12 glass-card-static border-dashed">
            <Loader2 className="animate-spin text-[#A855F7]" size={32} />
        </div>
    ),
});

const CarouselPreview = dynamic(() => import('./CarouselPreview'), {
    loading: () => (
        <div className="flex items-center justify-center py-12 glass-card-static border-dashed">
            <Loader2 className="animate-spin text-[#A855F7]" size={32} />
        </div>
    ),
});

const STEP_LABELS: Record<number, string> = {
    1: 'Passo 1 de 4',
    2: 'Passo 2 de 4',
    3: 'Passo 3 de 4',
    4: 'Concluído',
};

const FontSelectionStep = dynamic(() => import('./FontSelectionStep'), {
    loading: () => (
        <div className="flex items-center justify-center py-12 glass-card-static border-dashed">
            <Loader2 className="animate-spin text-[#A855F7]" size={32} />
        </div>
    ),
});

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
    const {
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
    } = useCarouselWorkflow();

    const [manualTopic, setManualTopic] = useState('');
    const [selectedFont, setSelectedFont] = useState('Inter');
    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        if (carouselData && !isGeneratingText && currentStep === 1) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentStep((prev) => (prev === 1 ? 2 : prev));
        }
    }, [carouselData, isGeneratingText, currentStep]);

    useEffect(() => {
        if (images && !isGeneratingImages && currentStep === 3) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentStep((prev) => (prev === 3 ? 4 : prev));
        }
    }, [images, isGeneratingImages, currentStep]);

    const onSubmitGeneration = (e: React.FormEvent) => {
        e.preventDefault();
        const activeTopic = manualTopic.trim() || selectedTopic || niche.trim();
        if (activeTopic) {
            handleSelectTopic(activeTopic);
        }
    };

    const goBack = () => setCurrentStep((s) => Math.max(1, s - 1));

    return (
        <div className="mx-auto w-full max-w-[840px] flex flex-col gap-8 pb-32">

            {/* Header and Progress */}
            <div className="flex flex-col gap-6 animate-reveal">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-4">
                        {currentStep === 3 && !isGeneratingImages && (
                            <button
                                onClick={goBack}
                                aria-label="Voltar ao passo anterior"
                                className="cursor-pointer flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-white"
                                style={{ color: 'rgba(255,255,255,0.4)' }}
                            >
                                <ArrowLeft size={16} />
                                Voltar
                            </button>
                        )}
                        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Configure seu Post</h1>
                    </div>
                    <span className="text-[#A855F7] font-medium px-3 py-1 bg-[#A855F7]/10 rounded-full text-xs uppercase tracking-widest border border-[#A855F7]/20">
                        {STEP_LABELS[currentStep]}
                    </span>
                </div>
                <div className="flex items-center gap-2 w-full px-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 cursor-default ${currentStep >= i
                                ? 'bg-[#A855F7] shadow-[0_0_10px_rgba(168,85,247,0.6)]'
                                : 'bg-white/10'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* ── Step 1: Configuration form ── */}
            {currentStep === 1 && !isGeneratingText && (
                <div className="glass-panel rounded-xl p-8 flex flex-col gap-10 border border-white/5 shadow-2xl animate-fade-in" style={{ background: 'rgba(25, 16, 34, 0.6)', backdropFilter: 'blur(12px)' }}>

                    <PlatformSelector value={platform} onChange={setPlatform} />

                    {/* SECTION 2: Topic & Niche */}
                    <section className="flex flex-col gap-4 mt-2">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[#A855F7]"><Lightbulb size={20} /></span>
                            <h3 className="text-lg font-semibold text-white font-display">2. Definir Tópico & Nicho</h3>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2 flex flex-col gap-2">
                                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">
                                        Tema Manual (Opcional se usar sugestões)
                                    </label>
                                    <input
                                        type="text"
                                        value={manualTopic}
                                        onChange={(e) => setManualTopic(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] transition-all"
                                        placeholder="Ex: 5 ferramentas de IA para 2024"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">
                                        Nicho
                                    </label>
                                    <input
                                        type="text"
                                        value={niche}
                                        onChange={(e) => setNiche(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] transition-all"
                                        placeholder="Ex: Tech & AI"
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGenerateTopics}
                                disabled={isGeneratingTopics || !niche.trim()}
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-dashed border-[#A855F7]/40 text-[#A855F7] font-medium hover:bg-[#A855F7]/5 cursor-pointer transition-colors disabled:opacity-50"
                            >
                                {isGeneratingTopics ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                                Gerar Ideias Virais
                            </button>
                        </div>

                        {/* Lista de Temas */}
                        {topics.length > 0 && (
                            <div className="mt-2 p-4 bg-black/20 rounded-xl border border-white/5">
                                <TopicList
                                    topics={topics}
                                    onSelect={(selected) => setManualTopic(selected)}
                                    isLoadingCarousel={isGeneratingText}
                                />
                            </div>
                        )}
                    </section>

                    <ObjectiveSelector value={objective} onChange={setObjective} />

                    <SlideCountInput value={slideCount} onChange={setSlideCount} />

                    <div className="mt-4 pt-6 border-t border-white/5">
                        <button
                            type="button"
                            onClick={onSubmitGeneration}
                            disabled={!niche.trim() && !manualTopic.trim()}
                            className="w-full py-4 bg-[#7f0df2] hover:bg-[#922cee] cursor-pointer rounded-xl flex items-center justify-center gap-3 transition-transform active:scale-[0.98] shadow-[0_0_30px_rgba(127,13,242,0.3)] group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="text-white font-bold text-lg">Gerar Post com IA</span>
                            <Bolt size={20} className="text-white group-hover:translate-x-1 transition-transform" />
                        </button>
                        <p className="text-center text-slate-500 text-[11px] mt-4">Tempo médio de geração: <span className="text-slate-300">~24 segundos</span></p>
                    </div>
                </div>
            )}

            {/* Loading text wrapper */}
            {isGeneratingText && (
                <div className="glass-panel rounded-xl p-8 border border-white/5 shadow-2xl animate-fade-in mt-8" style={{ background: 'rgba(25, 16, 34, 0.6)', backdropFilter: 'blur(12px)' }}>
                    <LoadingCard message="Criando roteiro e legenda perfeitos baseados no seu tema..." color="primary" />
                </div>
            )}

            {/* ── Step 2: Font selection ── */}
            {currentStep === 2 && carouselData && !isGeneratingText && (
                <div className="glass-panel rounded-xl p-8 border border-white/5 shadow-2xl animate-fade-in mt-8" style={{ background: 'rgba(25, 16, 34, 0.6)', backdropFilter: 'blur(12px)' }}>
                    <FontSelectionStep
                        platform={platform}
                        carouselData={carouselData}
                        value={selectedFont}
                        onChange={setSelectedFont}
                        onContinue={() => setCurrentStep(3)}
                    />
                </div>
            )}

            {/* ── Step 3: Image config ── */}
            {currentStep === 3 && showConfig && carouselData && selectedTopic && (
                <div className="glass-panel rounded-xl p-0 overflow-hidden border border-white/5 shadow-2xl animate-fade-in mt-8" style={{ background: 'rgba(25, 16, 34, 0.6)', backdropFilter: 'blur(12px)' }}>
                    <ImageConfigPanel
                        topic={selectedTopic}
                        fontFamily={selectedFont}
                        onGenerate={handleGenerateImages}
                        isLoading={isGeneratingImages}
                    />
                </div>
            )}

            {/* Loading: gerando imagens */}
            {isGeneratingImages && (
                <div className="glass-panel rounded-xl p-8 border border-white/5 shadow-2xl animate-fade-in mt-8" style={{ background: 'rgba(25, 16, 34, 0.6)', backdropFilter: 'blur(12px)' }}>
                    <LoadingCard message={`Renderizando sua obra prima com ${slideCount} slides! Quase lá...`} color="accent" />
                    <SkeletonImages count={slideCount} />
                </div>
            )}

            {/* ── Step 4: Carousel preview ── */}
            {currentStep === 4 && !isGeneratingImages && carouselData && images && images.length > 0 && (
                <CarouselPreview data={carouselData} topic={selectedTopic || manualTopic || niche} images={images} />
            )}

        </div>
    );
}
