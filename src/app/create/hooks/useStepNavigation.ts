import { useState } from 'react';
import { ReferenceImages } from '@/types';

export function useStepNavigation() {
    const [currentStep, setCurrentStep] = useState(1);
    const [referenceImages, setReferenceImages] = useState<ReferenceImages>({});

    const onSubmitGeneration = () => {
        setCurrentStep(2);
    };

    const goBack = () => setCurrentStep((s) => Math.max(1, s - 1));

    return {
        currentStep,
        referenceImages,
        setReferenceImages,
        onSubmitGeneration,
        goBack,
        goToStep: setCurrentStep,
    };
}
