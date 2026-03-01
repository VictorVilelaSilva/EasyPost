'use client';

import dynamic from 'next/dynamic';
import { Loader2, Sparkles } from 'lucide-react';
import TopicList from './TopicList';
import LoadingCard from './LoadingCard';
import { useCarouselWorkflow } from '../../hooks/useCarouselWorkflow';

const ImageConfigPanel = dynamic(() => import('../../components/ImageConfig'), {
    loading: () => (
        <div className="flex items-center justify-center py-12 glass-card-static border-dashed">
            <Loader2 className="animate-spin text-primary" size={32} />
        </div>
    ),
});

const CarouselPreview = dynamic(() => import('../../components/CarouselPreview'), {
    loading: () => (
        <div className="flex items-center justify-center py-12 glass-card-static border-dashed">
            <Loader2 className="animate-spin text-accent" size={32} />
        </div>
    ),
});

export default function HomeClient() {
    const {
        niche,
        topics,
        selectedTopic,
        carouselData,
        images,
        showConfig,
        isGeneratingTopics,
        isGeneratingText,
        isGeneratingImages,
        setNiche,
        handleGenerateTopics,
        handleSelectTopic,
        handleGenerateImages,
    } = useCarouselWorkflow();

    return (
        <>
            {/* Search */}
            <form onSubmit={handleGenerateTopics} className="max-w-2xl mx-auto mb-12 animate-reveal animate-reveal-delay-1">
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={niche}
                        onChange={(e) => setNiche(e.target.value)}
                        placeholder="Ex: Dicas de Design, Fitness para iniciantes…"
                        name="niche"
                        autoComplete="off"
                        aria-label="Seu nicho de conteúdo"
                        className="input-glow flex-1 px-5 py-3.5 rounded-xl text-base bg-card border-default text-[var(--color-text)] font-body min-h-12"
                        required
                    />
                    <button
                        type="submit"
                        disabled={isGeneratingTopics || !niche.trim()}
                        aria-label="Gerar temas em alta para seu nicho"
                        className="btn-glow cursor-pointer px-7 py-3.5 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-primary font-display min-h-12"
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

            {/* Loading: gerando texto */}
            {isGeneratingText && (
                <LoadingCard message="Gerando texto dos slides e legenda…" color="primary" />
            )}

            {/* Painel de Configuração */}
            {showConfig && carouselData && selectedTopic && (
                <ImageConfigPanel
                    topic={selectedTopic}
                    onGenerate={handleGenerateImages}
                    isLoading={isGeneratingImages}
                />
            )}

            {/* Loading: gerando imagens */}
            {isGeneratingImages && (
                <LoadingCard message="Criando suas 5 imagens com IA. Isso pode levar alguns segundos…" color="accent" />
            )}

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
