import { useState } from 'react';
import { ReferenceImages } from '@/types';

export function useStepNavigation() {
    const [currentStep, setCurrentStep] = useState(1);
    const [referenceImages, setReferenceImages] = useState<ReferenceImages>({});

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const onSubmitGeneration = () => {
        setCurrentStep(2);
        scrollToTop();
    };

    const goBack = () => {
        setCurrentStep((s) => Math.max(1, s - 1));
        scrollToTop();
    };

    return {
        currentStep,
        referenceImages,
        setReferenceImages,
        onSubmitGeneration,
        goBack,
        goToStep: (step: number) => { setCurrentStep(step); scrollToTop(); },
    };
}
