'use client';

import { useEffect } from 'react';
import { Type, Check, ArrowRight, Instagram, Linkedin } from 'lucide-react';
import { FONT_OPTIONS } from './FontSelector';
import { CarouselData, Platform } from '@/types';

interface Props {
    platform: Platform;
    carouselData: CarouselData;
    value: string;
    onChange: (font: string) => void;
    onContinue: () => void;
}

export default function FontSelectionStep({
    platform,
    carouselData,
    value,
    onChange,
    onContinue,
}: Props) {
    // Load all fonts once
    useEffect(() => {
        const url = `https://fonts.googleapis.com/css2?${FONT_OPTIONS.map(
            (f) => `family=${f.id.replace(/ /g, '+')}:wght@400;600;700`
        ).join('&')}&display=swap`;

        if (!document.getElementById('easypost-gfonts')) {
            const link = document.createElement('link');
            link.id = 'easypost-gfonts';
            link.rel = 'stylesheet';
            link.href = url;
            document.head.appendChild(link);
        }
    }, []);

    const selectedFont = FONT_OPTIONS.find((f) => f.id === value) || FONT_OPTIONS[0];
    const firstSlide = carouselData.slides[0];

    const PlatformIcon = platform === 'instagram' ? Instagram : Linkedin;
    const platformLabel = platform === 'instagram' ? 'Instagram' : 'LinkedIn';

    return (
        <div className="w-full animate-fade-in">
            {/* Step header */}
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                    <div
                        className="p-2 rounded-xl"
                        style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)' }}
                    >
                        <Type size={20} style={{ color: '#A855F7' }} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white font-display">Tipografia</h2>
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                            Escolha a fonte do seu post
                        </p>
                    </div>
                </div>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* LEFT: Font list (2/5) */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div
                        className="glass-panel rounded-2xl overflow-hidden flex flex-col"
                        style={{ background: 'rgba(25, 16, 34, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        {/* Font list header */}
                        <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                                17 fontes disponíveis
                            </p>
                        </div>

                        {/* Scrollable list */}
                        <div
                            className="flex flex-col overflow-y-auto py-2 px-2"
                            style={{ maxHeight: '460px', scrollbarWidth: 'thin' }}
                        >
                            {FONT_OPTIONS.map((font) => {
                                const isActive = value === font.id;
                                return (
                                    <button
                                        key={font.id}
                                        onClick={() => onChange(font.id)}
                                        aria-label={`Selecionar fonte ${font.label}`}
                                        aria-pressed={isActive}
                                        className="cursor-pointer w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 mb-1"
                                        style={{
                                            background: isActive ? 'rgba(168,85,247,0.12)' : 'transparent',
                                            border: `1px solid ${isActive ? '#A855F7' : 'rgba(255,255,255,0.05)'}`,
                                            boxShadow: isActive ? '0 0 20px -5px rgba(168,85,247,0.4)' : 'none',
                                            minHeight: '56px',
                                        }}
                                    >
                                        <div className="flex flex-col gap-0.5 min-w-0 flex-1 overflow-hidden">
                                            <span
                                                className="text-[10px] font-semibold uppercase tracking-wider"
                                                style={{
                                                    color: isActive ? '#A855F7' : 'rgba(255,255,255,0.35)',
                                                    fontFamily: 'var(--font-display)',
                                                }}
                                            >
                                                {font.label}
                                                <span className="ml-1.5 font-normal normal-case tracking-normal opacity-60">
                                                    · {font.category}
                                                </span>
                                            </span>
                                            <span
                                                className="text-sm truncate leading-snug"
                                                style={{
                                                    fontFamily: `'${font.id}', sans-serif`,
                                                    color: isActive ? '#e9d9ff' : 'rgba(255,255,255,0.5)',
                                                }}
                                            >
                                                Seu Post no Instagram
                                            </span>
                                        </div>
                                        {isActive && (
                                            <div
                                                className="ml-3 shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                                                style={{ background: '#A855F7' }}
                                            >
                                                <Check size={11} className="text-white" strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Continue button */}
                    <button
                        onClick={onContinue}
                        className="w-full py-4 bg-[#7f0df2] hover:bg-[#922cee] cursor-pointer rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-[0_0_30px_rgba(127,13,242,0.35)] group"
                    >
                        <span className="text-white font-bold text-base">Continuar</span>
                        <ArrowRight size={18} className="text-white group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* RIGHT: Live preview (3/5) */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                    {/* Preview header */}
                    <div className="flex items-center justify-between px-1">
                        <div>
                            <p className="text-sm font-semibold text-white">Preview do Post</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                Assim ficará a fonte nas suas imagens
                            </p>
                        </div>
                        <div
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                            style={{
                                background: 'rgba(168,85,247,0.1)',
                                border: '1px solid rgba(168,85,247,0.25)',
                                color: '#C084FC',
                            }}
                        >
                            <PlatformIcon size={12} />
                            {platformLabel}
                        </div>
                    </div>

                    {/* Mock slide card */}
                    <div
                        className="relative rounded-2xl overflow-hidden flex flex-col justify-between p-8"
                        style={{
                            background: 'linear-gradient(145deg, #1a0a2e 0%, #0d0820 45%, #18103a 100%)',
                            border: '1px solid rgba(168,85,247,0.2)',
                            minHeight: '420px',
                            boxShadow: '0 0 60px -15px rgba(168,85,247,0.35)',
                        }}
                    >
                        {/* Ambient glow top right */}
                        <div
                            className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
                            style={{
                                background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 65%)',
                                transform: 'translate(35%, -35%)',
                            }}
                        />
                        {/* Ambient glow bottom left */}
                        <div
                            className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
                            style={{
                                background: 'radial-gradient(circle, rgba(91,33,182,0.12) 0%, transparent 65%)',
                                transform: 'translate(-35%, 35%)',
                            }}
                        />

                        {/* Slide type badge */}
                        <div className="flex items-center justify-between relative z-10">
                            <span
                                className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full"
                                style={{
                                    background: 'rgba(168,85,247,0.15)',
                                    border: '1px solid rgba(168,85,247,0.3)',
                                    color: '#A855F7',
                                    fontFamily: 'var(--font-display)',
                                }}
                            >
                                Slide 1 · Capa
                            </span>
                            <span
                                className="text-[10px] font-semibold uppercase tracking-widest"
                                style={{
                                    color: 'rgba(255,255,255,0.25)',
                                    fontFamily: `'${selectedFont.id}', sans-serif`,
                                }}
                            >
                                {selectedFont.label}
                            </span>
                        </div>

                        {/* Main slide content */}
                        <div className="flex flex-col gap-4 relative z-10 my-auto py-8">
                            <h1
                                className="font-bold leading-tight"
                                style={{
                                    fontFamily: `'${selectedFont.id}', sans-serif`,
                                    color: '#ffffff',
                                    fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                                    letterSpacing: '-0.01em',
                                }}
                            >
                                {firstSlide?.title || 'Título do Post Aqui'}
                            </h1>

                            {/* Content bullets */}
                            <div className="flex flex-col gap-2.5">
                                {(firstSlide?.content || 'Conteúdo de exemplo do seu post gerado por IA.')
                                    .split(/[.•\n]/)
                                    .filter((s: string) => s.trim().length > 0)
                                    .slice(0, 3)
                                    .map((line: string, i: number) => (
                                        <div key={i} className="flex items-start gap-2.5">
                                            <span
                                                className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                                                style={{ background: '#A855F7' }}
                                            />
                                            <p
                                                className="text-sm leading-relaxed"
                                                style={{
                                                    fontFamily: `'${selectedFont.id}', sans-serif`,
                                                    color: 'rgba(255,255,255,0.65)',
                                                }}
                                            >
                                                {line.trim()}
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* CTA / footer */}
                        <div className="relative z-10 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                            <p
                                className="text-xs font-semibold"
                                style={{
                                    fontFamily: `'${selectedFont.id}', sans-serif`,
                                    color: 'rgba(255,255,255,0.35)',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Arraste para ver mais →
                            </p>
                        </div>
                    </div>

                    {/* Font name callout */}
                    <div
                        className="flex items-center justify-center gap-2 py-3 rounded-xl"
                        style={{
                            background: 'rgba(168,85,247,0.07)',
                            border: '1px solid rgba(168,85,247,0.18)',
                        }}
                    >
                        <Type size={13} style={{ color: '#A855F7' }} />
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                            Fonte selecionada:{' '}
                            <span
                                className="font-semibold"
                                style={{
                                    fontFamily: `'${selectedFont.id}', sans-serif`,
                                    color: '#C084FC',
                                }}
                            >
                                {selectedFont.label}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
