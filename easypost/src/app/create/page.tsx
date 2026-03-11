'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCarouselWorkflow } from '@/hooks/useCarouselWorkflow';
import { useStepNavigation } from './hooks/useStepNavigation';
import LoadingCard from './components/LoadingCard';
import SkeletonImages from './components/SkeletonImages';
import StepProgress from './components/steps/StepProgress';
import Step3ImageConfig from './components/steps/Step3ImageConfig';
import Step1Configuration from './components/steps/Step1Configuration';
import { usePreviewData } from '@/contexts/PreviewContext';

export default function CreatePage() {
    const router = useRouter();
    const { setPreviewData } = usePreviewData();
    const hasNavigated = useRef(false);

    const workflow = useCarouselWorkflow();
    const {
        carouselData, slideImages,
        platform, slideCount,
        isGeneratingText, isGeneratingImages,
        setPlatform, handleGenerateAll, setSlideImages,
        setCarouselData,
    } = workflow;

    const nav = useStepNavigation();

    // Navigate to standalone preview when images are ready
    useEffect(() => {
        if (
            nav.currentStep === 3 &&
            !isGeneratingImages &&
            slideImages &&
            carouselData &&
            !hasNavigated.current
        ) {
            hasNavigated.current = true;
            setPreviewData({
                images: slideImages,
                slideTypes: carouselData.slides.map(s => s.slideType),
                caption: carouselData.caption,
                platform,
            });
            setSlideImages(null);
            router.push('/preview');
        }
    }, [nav.currentStep, isGeneratingImages, slideImages, carouselData, platform, setPreviewData, setSlideImages, router]);

    // Reset navigation flag when going back to step 2
    useEffect(() => {
        if (nav.currentStep < 3) {
            hasNavigated.current = false;
        }
    }, [nav.currentStep]);

    // Debug helper to skip to preview
    const handleMockPreview = () => {
        const mockImages = ['/1.jpg', '/2.jpg', '/3.jpg'];
        const mockCarousel = {
            slides: [
                { slideType: 'cover', title: 'Mock 1', content: '' },
                { slideType: 'content', title: 'Mock 2', content: '' },
                { slideType: 'cta', title: 'Mock 3', content: '' },
            ],
            caption: 'Mock Caption'
        };
        setPreviewData({
            images: mockImages,
            slideTypes: mockCarousel.slides.map(s => s.slideType),
            caption: mockCarousel.caption,
            platform,
        });
        router.push('/preview');
    };

    return (
        <main
            className="min-h-screen flex flex-col items-center px-4 py-8"
            style={{ fontFamily: 'var(--font-body)' }}
        >
            {/* Dev bypass button */}
            {process.env.NODE_ENV === 'development' && (
                <button
                    onClick={handleMockPreview}
                    className="fixed bottom-4 right-4 z-[9999] bg-red-600 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-red-700 transition-colors"
                >
                    DEBUG: Mock Preview
                </button>
            )}

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

                {nav.currentStep === 2 && !isGeneratingText && !isGeneratingImages && !slideImages && (
                    <div className="w-full max-w-[1024px]">
                        <Step3ImageConfig
                            selectedTopic={''}
                            onContinue={(config) => {
                                nav.goToStep(3);
                                handleGenerateAll(config);
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
            </section>
        </main>
    );
}
