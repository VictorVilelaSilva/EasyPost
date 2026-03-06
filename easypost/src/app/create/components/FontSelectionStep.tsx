'use client';

import { useEffect, useState } from 'react';
import { Type, CheckCircle, Sparkles, Instagram, Linkedin, MoreHorizontal, Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { FONT_OPTIONS } from './FontSelector';
import { CarouselData, Platform } from '@/types';

type FontCategory = 'Todos' | 'Sans-serif' | 'Display' | 'Serif';

interface Props {
    platform: Platform | null;
    carouselData: CarouselData | null;
    value: string;
    onChange: (font: string) => void;
    onContinue: () => void;
    onBack: () => void;
}

export default function FontSelectionStep({ platform, carouselData, value, onChange, onContinue, onBack }: Props) {
    const [activeCategory, setActiveCategory] = useState<FontCategory>('Todos');

    useEffect(() => {
        const url = `https://fonts.googleapis.com/css2?${FONT_OPTIONS.map(
            (f) => `family=${f.id.replace(/ /g, '+')}:wght@400;500;600;700`
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
    const firstSlide = carouselData?.slides[0];
    const PlatformIcon = platform === 'linkedin' ? Linkedin : Instagram;
    const platformLabel = platform === 'linkedin' ? 'LinkedIn' : 'Instagram';

    const categories: FontCategory[] = ['Todos', 'Sans-serif', 'Display', 'Serif'];
    const filtered = activeCategory === 'Todos'
        ? FONT_OPTIONS
        : FONT_OPTIONS.filter((f) => f.category === activeCategory);

    return (
        <div className="w-full flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row gap-6" style={{ minHeight: '600px' }}>

            {/* LEFT PANEL — font picker */}
            <div
                className="lg:w-[42%] flex flex-col rounded-2xl border border-white/8 overflow-hidden"
                style={{ background: 'rgba(14, 10, 22, 0.7)', backdropFilter: 'blur(16px)' }}
            >
                {/* Panel header */}
                <div className="px-6 pt-6 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center">
                            <Type size={16} className="text-purple-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                            Tipografia
                        </h2>
                    </div>
                    <p className="text-xs text-slate-500 ml-11">Escolha a fonte que vai definir o visual do seu post</p>
                </div>

                {/* Category tabs */}
                <div className="flex gap-1.5 px-6 py-3 border-b border-white/5">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setActiveCategory(cat)}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                            style={{
                                background: activeCategory === cat ? 'rgba(168, 85, 247, 0.18)' : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${activeCategory === cat ? 'rgba(168, 85, 247, 0.4)' : 'rgba(255,255,255,0.06)'}`,
                                color: activeCategory === cat ? '#c084fc' : '#64748b',
                                fontFamily: 'var(--font-display)',
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Font list — fills remaining height */}
                <div
                    className="overflow-y-auto px-4 py-3 flex flex-col gap-1.5"
                    style={{ height: '420px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(168, 85, 247, 0.15) transparent' }}
                >
                    {filtered.map((font) => {
                        const isActive = value === font.id;
                        return (
                            <button
                                key={font.id}
                                type="button"
                                onClick={() => onChange(font.id)}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-150 group"
                                style={{
                                    background: isActive ? 'rgba(168, 85, 247, 0.12)' : 'transparent',
                                    border: `1px solid ${isActive ? 'rgba(168, 85, 247, 0.35)' : 'transparent'}`,
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                                }}
                            >
                                <div className="flex flex-col gap-0.5 min-w-0">
                                    {/* Sample text in the actual font */}
                                    <span
                                        className="text-base leading-tight truncate"
                                        style={{
                                            fontFamily: `'${font.id}', sans-serif`,
                                            color: isActive ? '#ffffff' : '#94a3b8',
                                            fontWeight: isActive ? 700 : 500,
                                        }}
                                    >
                                        {font.label}
                                    </span>
                                    <span className="text-[10px] uppercase tracking-widest" style={{ color: isActive ? '#a78bfa' : '#475569', fontFamily: 'var(--font-display)' }}>
                                        {font.description}
                                    </span>
                                </div>
                                {isActive && <CheckCircle size={16} className="text-purple-400 shrink-0 ml-3" />}
                            </button>
                        );
                    })}
                </div>

            </div>

            {/* RIGHT PANEL — live preview */}
            <div
                className="lg:w-[58%] rounded-2xl flex flex-col p-6 relative overflow-hidden border border-white/5"
                style={{ background: 'rgba(8, 5, 16, 0.5)', backdropFilter: 'blur(12px)' }}
            >
                {/* Ambient glows */}
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
                <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, transparent 70%)', transform: 'translate(-20%, 20%)' }} />

                {/* Preview header */}
                <div className="flex items-center justify-between mb-5 z-10">
                    <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                        Preview do Post
                    </h3>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/8 bg-white/3">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>
                            ao vivo
                        </span>
                    </div>
                </div>

                {/* Phone mockup — full column width */}
                <div className="flex-1 flex items-center justify-center z-10">
                    <div className="w-full max-w-[380px] bg-black/50 rounded-[24px] p-4 border border-white/10 shadow-2xl">

                        {/* Mockup header */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[2px]">
                                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                        <span className="text-[9px] text-purple-300 font-bold">IA</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white leading-none mb-0.5" style={{ fontFamily: 'var(--font-display)' }}>seu_perfil</p>
                                    <p className="text-[9px] text-slate-500 leading-none">
                                        {platform === 'linkedin' ? 'Just now • 🌍' : 'Original Audio'}
                                    </p>
                                </div>
                            </div>
                            <MoreHorizontal size={16} className="text-slate-400" />
                        </div>

                        {/* Slide */}
                        <div className="aspect-[4/5] w-full rounded-xl overflow-hidden relative border border-white/8">
                            <div className="absolute inset-0 bg-[#0c0d15]">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-transparent to-purple-900/30" />
                                <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{ background: 'radial-gradient(circle at 50% 40%, rgba(168,85,247,0.4), transparent 65%)' }} />
                            </div>

                            <div className="relative h-full flex flex-col p-6 justify-between z-10">
                                <div className="flex items-center gap-1.5 self-start bg-white/10 backdrop-blur-md px-2 py-1 rounded-md border border-white/15">
                                    <PlatformIcon size={10} className="text-white" />
                                    <span className="text-[8px] font-bold tracking-widest text-white uppercase" style={{ fontFamily: 'var(--font-display)' }}>{platformLabel}</span>
                                </div>

                                <div className="space-y-5 my-auto pt-4">
                                    <h4
                                        className="font-bold leading-[1.1] text-white text-2xl"
                                        style={{ fontFamily: `'${selectedFont.id}', sans-serif` }}
                                    >
                                        {firstSlide?.title || 'Título do Post Aqui'}
                                    </h4>
                                    <ul className="space-y-3">
                                        {(firstSlide?.content || 'Conteúdo de exemplo do seu post gerado por IA.\nPonto explicativo sobre o slide.\nConclusão visual e leitura clara.')
                                            .split(/[.•\n]/)
                                            .filter((s: string) => s.trim().length > 0)
                                            .slice(0, 3)
                                            .map((line: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2.5 text-slate-200">
                                                    <span className="w-1.5 h-1.5 shrink-0 mt-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                                                    <span className="text-sm leading-snug opacity-85" style={{ fontFamily: `'${selectedFont.id}', sans-serif` }}>{line.trim()}</span>
                                                </li>
                                            ))}
                                    </ul>
                                </div>

                                <div className="border-t border-white/10 pt-3">
                                    <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: `'${selectedFont.id}', sans-serif` }}>
                                        {selectedFont.label} · {selectedFont.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Engagement row */}
                        <div className="mt-3 px-1">
                            {platform === 'linkedin' ? (
                                <div className="flex items-center justify-between border-t border-white/8 pt-2.5">
                                    {[Heart, MessageCircle, Send].map((Icon, i) => (
                                        <div key={i} className="flex items-center gap-1 text-slate-400">
                                            <Icon size={14} />
                                            <span className="text-[10px] font-bold">{['Gostei', 'Comentar', 'Enviar'][i]}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Heart size={18} className="text-white" />
                                        <MessageCircle size={18} className="text-white" />
                                        <Send size={18} className="text-white" />
                                    </div>
                                    <Bookmark size={18} className="text-white" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom hint */}
                <p className="text-center text-[11px] text-slate-600 mt-4 z-10 tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                    A fonte será aplicada em todos os slides do carrossel
                </p>
            </div>
        </div>
            <div className="w-full flex justify-between items-center border-t border-white/10 pt-8 mt-2">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center justify-center rounded-xl h-12 px-6 bg-transparent text-slate-400 hover:text-white text-base font-bold transition-colors"
                >
                    Voltar
                </button>
                <button
                    type="button"
                    onClick={onContinue}
                    className="flex items-center justify-center gap-2 rounded-xl h-12 px-8 bg-[#7f0df2] hover:bg-[#922cee] text-white text-base font-bold shadow-[0_0_20px_rgba(127,13,242,0.4)] transition-all transform hover:-translate-y-0.5"
                >
                    Próximo Passo
                    <Sparkles size={18} />
                </button>
            </div>
        </div>
    );
}
