import { useState, useEffect } from 'react';
import { CarouselData, ImageConfig } from '@/types';

interface WorkflowState {
    carouselData: CarouselData | null;
    isGeneratingText: boolean;
    images: string[] | null;
    isGeneratingImages: boolean;
    handleSelectTopic: (topic: string) => void;
    selectedTopic: string | null;
    niche: string;
}

export function useStepNavigation({
    carouselData,
    isGeneratingText,
    images,
    isGeneratingImages,
    handleSelectTopic,
    selectedTopic,
    niche,
}: WorkflowState) {
    const [currentStep, setCurrentStep] = useState(1);
    const [partialImageConfig, setPartialImageConfig] = useState<Omit<ImageConfig, 'visualStyle'> | null>(null);
    const [manualTopic, setManualTopic] = useState('');
    const [selectedFont, setSelectedFont] = useState('Inter');

    useEffect(() => {
        if (carouselData && !isGeneratingText && currentStep === 1) {
            setCurrentStep(2);
        }
    }, [carouselData, isGeneratingText, currentStep]);

    useEffect(() => {
        if (images && !isGeneratingImages && currentStep === 4) {
            setCurrentStep(5);
        }
    }, [images, isGeneratingImages, currentStep]);

    const onSubmitGeneration = () => {
        const activeTopic = manualTopic.trim() || selectedTopic || niche.trim();
        if (activeTopic) {
            handleSelectTopic(activeTopic);
        }
    };

    const goBack = () => setCurrentStep((s) => Math.max(1, s - 1));

    const onImageConfigDone = (config: Omit<ImageConfig, 'visualStyle'>) => {
        setPartialImageConfig(config);
        setCurrentStep(4);
    };

    return {
        currentStep,
        partialImageConfig,
        manualTopic,
        setManualTopic,
        selectedFont,
        setSelectedFont,
        onSubmitGeneration,
        goBack,
        goToStep: setCurrentStep,
        onImageConfigDone,
    };
}
