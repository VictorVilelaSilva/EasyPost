'use client';

import { Check } from 'lucide-react';

const STEPS = [
    { key: 'platform', label: 'Plataforma' },
    { key: 'objective', label: 'Objetivo' },
    { key: 'slides', label: 'Slides' },
    { key: 'niche', label: 'Nicho' },
    { key: 'config', label: 'Config' },
    { key: 'preview', label: 'Preview' },
] as const;

export type StepKey = (typeof STEPS)[number]['key'];

interface Props {
    currentStep: StepKey;
    completedSteps: Set<StepKey>;
}

export default function StepIndicator({ currentStep, completedSteps }: Props) {
    const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

    return (
        <nav
            className="mb-10 animate-reveal"
            aria-label="Progresso do wizard"
        >
            <div className="step-track justify-center">
                {STEPS.map((step, i) => {
                    const isCompleted = completedSteps.has(step.key);
                    const isActive = step.key === currentStep;
                    const connectorDone = i > 0 && (completedSteps.has(STEPS[i - 1].key) || currentIndex >= i);

                    return (
                        <div key={step.key} className="flex items-center">
                            {i > 0 && (
                                <div
                                    className={`step-connector ${connectorDone ? 'step-connector-done' : ''}`}
                                />
                            )}
                            <span
                                className={`step-badge ${isActive ? 'step-badge-active' : ''} ${isCompleted && !isActive ? 'step-badge-completed' : ''}`}
                                aria-current={isActive ? 'step' : undefined}
                            >
                                {isCompleted && !isActive && (
                                    <Check size={12} strokeWidth={3} />
                                )}
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </nav>
    );
}
