'use client';

import React from 'react';
import { useCarouselWorkflow } from '@/hooks/useCarouselWorkflow';
import { useStepNavigation } from './hooks/useStepNavigation';
import LoadingCard from './components/LoadingCard';
import SkeletonImages from './components/SkeletonImages';
import StepProgress from './components/steps/StepProgress';
import Step1Configuration from './components/steps/Step1Configuration';
import Step2FontSelection from './components/steps/Step2FontSelection';
import Step3ImageConfig from './components/steps/Step3ImageConfig';
import Step4VisualStyle from './components/steps/Step4VisualStyle';
import Step5Preview from './components/steps/Step5Preview';

export default function CreatePage() {
    const workflow = useCarouselWorkflow();
    const {
        niche, topics, selectedTopic, carouselData, images,
        showConfig, platform, objective, slideCount,
        isGeneratingTopics, isGeneratingText, isGeneratingImages,
        setNiche, setPlatform, setObjective, setSlideCount,
        handleGenerateTopics, handleSelectTopic, handleGenerateImages,
    } = workflow;

    const nav = useStepNavigation({
        carouselData, isGeneratingText,
        images, isGeneratingImages,
        handleSelectTopic, selectedTopic, niche,
    });

    return (
        <main
            className="min-h-screen flex flex-col items-center px-4 py-8"
            style={{ fontFamily: 'var(--font-body)' }}
        >
            <div className="text-center mb-10 animate-reveal">
                <h1
                    className="text-3xl sm:text-4xl font-bold mb-3"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
                >
                    Crie seu Carrossel
                </h1>
                <p className="text-base max-w-lg mx-auto" style={{ color: 'var(--color-text-muted)' }}>
                    Digite seu nicho, escolha um tema em alta e deixe a IA gerar slides e imagens prontos para o Instagram.
                </p>
            </div>

            <section className="w-full max-w-[840px] flex flex-col gap-8 pb-32">
                <StepProgress
                    currentStep={nav.currentStep}
                    isGeneratingImages={isGeneratingImages}
                    onBack={nav.goBack}
                />

                {nav.currentStep === 1 && !isGeneratingText && (
                    <Step1Configuration
                        platform={platform} setPlatform={setPlatform}
                        manualTopic={nav.manualTopic} setManualTopic={nav.setManualTopic}
                        niche={niche} setNiche={setNiche}
                        isGeneratingTopics={isGeneratingTopics}
                        handleGenerateTopics={() => handleGenerateTopics({ preventDefault: () => { } } as React.SyntheticEvent)}
                        topics={topics} isGeneratingText={isGeneratingText}
                        objective={objective} setObjective={setObjective}
                        slideCount={slideCount} setSlideCount={setSlideCount}
                        onSubmitGeneration={nav.onSubmitGeneration}
                    />
                )}

                {isGeneratingText && (
                    <div className="glass-panel rounded-xl p-8 border border-white/5 shadow-2xl animate-fade-in mt-8" style={{ background: 'rgba(25, 16, 34, 0.6)', backdropFilter: 'blur(12px)' }}>
                        <LoadingCard message="Criando roteiro e legenda perfeitos baseados no seu tema..." color="primary" />
                    </div>
                )}

                {nav.currentStep === 2 && carouselData && !isGeneratingText && (
                    <Step2FontSelection
                        platform={platform}
                        carouselData={carouselData}
                        selectedFont={nav.selectedFont}
                        setSelectedFont={nav.setSelectedFont}
                        onContinue={() => nav.goToStep(3)}
                    />
                )}

                {nav.currentStep === 3 && showConfig && carouselData && selectedTopic && (
                    <Step3ImageConfig
                        selectedTopic={selectedTopic}
                        selectedFont={nav.selectedFont}
                        onContinue={nav.onImageConfigDone}
                    />
                )}

                {nav.currentStep === 4 && nav.partialImageConfig && !isGeneratingImages && (
                    <Step4VisualStyle
                        partialImageConfig={nav.partialImageConfig}
                        handleGenerateImages={handleGenerateImages}
                        isGeneratingImages={isGeneratingImages}
                    />
                )}

                {isGeneratingImages && (
                    <div className="glass-panel rounded-xl p-8 border border-white/5 shadow-2xl animate-fade-in mt-8" style={{ background: 'rgba(25, 16, 34, 0.6)', backdropFilter: 'blur(12px)' }}>
                        <LoadingCard message={`Renderizando sua obra prima com ${slideCount} slides! Quase lá...`} color="accent" />
                        <SkeletonImages count={slideCount} />
                    </div>
                )}

                {nav.currentStep === 5 && !isGeneratingImages && carouselData && images && images.length > 0 && (
                    <Step5Preview
                        carouselData={carouselData}
                        selectedTopic={selectedTopic}
                        manualTopic={nav.manualTopic}
                        niche={niche}
                        images={images}
                    />
                )}
            </section>
        </main>
    );
}
