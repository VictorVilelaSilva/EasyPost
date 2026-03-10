import { useState } from 'react';

export function useStepNavigation() {
    const [currentStep, setCurrentStep] = useState(1);

    const onSubmitGeneration = () => {
        setCurrentStep(2);
    };

    const goBack = () => setCurrentStep((s) => Math.max(1, s - 1));

    return {
        currentStep,
        onSubmitGeneration,
        goBack,
        goToStep: setCurrentStep,
    };
}
