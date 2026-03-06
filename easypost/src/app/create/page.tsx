'use client';

import { useCarouselWorkflow } from '@/hooks/useCarouselWorkflow';
import { useStepNavigation } from './hooks/useStepNavigation';
import LoadingCard from './components/LoadingCard';
import SkeletonImages from './components/SkeletonImages';
import StepProgress from './components/steps/StepProgress';
import Step2TemplateSelection from './components/steps/Step2TemplateSelection';
import Step2FontSelection from './components/steps/Step2FontSelection';
import Step3ImageConfig from './components/steps/Step3ImageConfig';
import Step5Preview from './components/steps/Step5Preview';
import Step1Configuration from './components/steps/Step1Configuration';

export default function CreatePage() {
    const workflow = useCarouselWorkflow();
    const {
        niche, selectedTopic, carouselData, images,
        platform, slideCount,
        isGeneratingText, isGeneratingImages,
        setPlatform, handleGenerateImages,
    } = workflow;

    const nav = useStepNavigation();

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

            <section className="w-full flex flex-col items-center gap-8 pb-32">
                <div className="w-full max-w-[840px]">
                    <StepProgress currentStep={nav.currentStep} />
                </div>

                {nav.currentStep === 1 && (
                    <div className="w-full max-w-[840px]">
                        <Step1Configuration
                            platform={platform} setPlatform={setPlatform}
                            onComplete={nav.onSubmitGeneration}
                            onBack={nav.goBack}
                        />
                    </div>
                )}

                {isGeneratingText && (
                    <div className="w-full max-w-[840px] glass-panel rounded-xl p-8 border border-white/5 shadow-2xl animate-fade-in" style={{ background: 'rgba(25, 16, 34, 0.6)', backdropFilter: 'blur(12px)' }}>
                        <LoadingCard message="Criando roteiro e legenda perfeitos baseados no seu tema..." color="primary" />
                    </div>
                )}

                {nav.currentStep === 2 && (
                    <div className="w-full max-w-[1200px]">
                        <Step2TemplateSelection
                            onContinue={nav.onTemplateSelected}
                            onBack={nav.goBack}
                        />
                    </div>
                )}

                {nav.currentStep === 3 && (
                    <div className="w-full max-w-[1200px]">
                        <Step2FontSelection
                            platform={platform}
                            carouselData={carouselData}
                            selectedFont={nav.selectedFont}
                            setSelectedFont={nav.setSelectedFont}
                            onContinue={() => nav.goToStep(4)}
                            onBack={nav.goBack}
                        />
                    </div>
                )}

                {nav.currentStep === 4 && (
                    <div className="w-full max-w-[1024px]">
                        <Step3ImageConfig
                            selectedTopic={selectedTopic ?? ''}
                            selectedFont={nav.selectedFont}
                            onContinue={(config) => {
                                nav.goToStep(5);
                                handleGenerateImages({ ...config, visualStyle: nav.selectedTemplate });
                            }}
                            onBack={nav.goBack}
                        />
                    </div>
                )}

                {isGeneratingImages && (
                    <div className="w-full max-w-[840px] glass-panel rounded-xl p-8 border border-white/5 shadow-2xl animate-fade-in" style={{ background: 'rgba(25, 16, 34, 0.6)', backdropFilter: 'blur(12px)' }}>
                        <LoadingCard message={`Renderizando sua obra prima com ${slideCount} slides! Quase lá...`} color="accent" />
                        <SkeletonImages count={slideCount} />
                    </div>
                )}

                {nav.currentStep === 5 && !isGeneratingImages && carouselData && images && images.length > 0 && (
                    <div className="w-full max-w-[840px]">
                        <Step5Preview
                            carouselData={carouselData}
                            selectedTopic={selectedTopic}
                            manualTopic={nav.manualTopic}
                            niche={niche}
                            images={images}
                        />
                    </div>
                )}
            </section>
        </main>
    );
}
