'use client';

import { Layers } from 'lucide-react';

interface Props {
    value: number;
    onChange: (count: number) => void;
    min?: number;
    max?: number;
}

export default function SlideCountInput({ value, onChange, min = 1, max = 15 }: Props) {
    return (
        <section className="flex flex-col gap-6 mt-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[#A855F7]"><Layers size={20} /></span>
                    <h3 className="text-lg font-semibold text-white font-display">4. Tamanho do Carrossel</h3>
                </div>
                <span className="text-[#A855F7] font-bold text-lg bg-[#A855F7]/10 px-3 py-1 rounded-md border border-[#A855F7]/20">
                    {value} Slides
                </span>
            </div>

            <div className="relative flex items-center h-12 w-full pt-4 pb-8">
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#A855F7]"
                    aria-label="Tamanho do Carrossel"
                />

                <div className="absolute top-10 left-0 w-full flex justify-between px-1">
                    {Array.from({ length: 5 }, (_, i) => {
                        // Spread labels across the range
                        const val = Math.round(min + (i * (max - min)) / 4);
                        const isSelected = Math.abs(val - value) <= (max - min) / 8;
                        return (
                            <span
                                key={val}
                                className={`text-[10px] font-bold ${isSelected ? 'text-[#A855F7]' : 'text-slate-500'}`}
                            >
                                {val}
                            </span>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
