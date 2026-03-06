import { useState } from 'react';

export function useStepNavigation() {
    const [currentStep, setCurrentStep] = useState(1);
    const [manualTopic, setManualTopic] = useState('');
    const [selectedFont, setSelectedFont] = useState('Inter');
    const [selectedTemplate, setSelectedTemplate] = useState('ai-generated');

    const onSubmitGeneration = () => {
        setCurrentStep(2);
    };

    const onTemplateSelected = (template: string) => {
        setSelectedTemplate(template);
        setCurrentStep(3);
    };

    const goBack = () => setCurrentStep((s) => Math.max(1, s - 1));

    return {
        currentStep,
        manualTopic,
        setManualTopic,
        selectedFont,
        setSelectedFont,
        selectedTemplate,
        onSubmitGeneration,
        onTemplateSelected,
        goBack,
        goToStep: setCurrentStep,
    };
}
