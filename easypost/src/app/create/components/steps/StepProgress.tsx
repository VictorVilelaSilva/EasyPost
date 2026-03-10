'use client';


const STEP_LABELS: Record<number, string> = {
    1: 'Passo 1 de 2',
    2: 'Passo 2 de 2',
    3: 'Concluido',
};

interface Props {
    currentStep: number;
}

export default function StepProgress({ currentStep }: Props) {
    return (
        <div className="flex flex-col gap-6 animate-reveal">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight text-white font-display">Configure seu Post</h1>
                </div>
                <span className="text-[#A855F7] font-medium px-3 py-1 bg-[#A855F7]/10 rounded-full text-xs uppercase tracking-widest border border-[#A855F7]/20">
                    {STEP_LABELS[currentStep]}
                </span>
            </div>
            <div className="flex items-center gap-2 w-full px-2">
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-500 cursor-default ${currentStep >= i
                            ? 'bg-[#A855F7] shadow-[0_0_10px_rgba(168,85,247,0.6)]'
                            : 'bg-white/10'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
