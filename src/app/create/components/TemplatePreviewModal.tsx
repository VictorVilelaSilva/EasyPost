import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Template {
    id: string;
    title: string;
    description: string;
    tag: string;
    preview: string;
    previewContent: React.ReactNode;
}

interface TemplatePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    templates: Template[];
    initialTemplateId: string | null;
    onSelect: (id: string) => void;
}

const ANIM_DURATION = 450;

const POSITIONS = {
    'left': { transform: 'translateX(-60%) scale(0.75) rotate(-6deg)', opacity: 1 },
    'center': { transform: 'scale(1.05)', opacity: 1 },
    'right': { transform: 'translateX(60%) scale(0.75) rotate(6deg)', opacity: 1 },
} as const;

type Position = keyof typeof POSITIONS;

export default function TemplatePreviewModal({ isOpen, onClose, templates, initialTemplateId, onSelect }: TemplatePreviewModalProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [anim, setAnim] = useState<'next' | 'prev' | null>(null);

    useEffect(() => {
        if (isOpen && initialTemplateId && templates.length > 0) {
            const idx = templates.findIndex(t => t.id === initialTemplateId);
            if (idx >= 0) setCurrentIndex(idx);
        }
    }, [isOpen, initialTemplateId, templates]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const goNext = useCallback(() => {
        if (anim || templates.length <= 1) return;
        setAnim('next');
        setTimeout(() => {
            setCurrentIndex(prev => (prev + 1) % templates.length);
            setAnim(null);
        }, ANIM_DURATION);
    }, [anim, templates.length]);

    const goPrev = useCallback(() => {
        if (anim || templates.length <= 1) return;
        setAnim('prev');
        setTimeout(() => {
            setCurrentIndex(prev => (prev - 1 + templates.length) % templates.length);
            setAnim(null);
        }, ANIM_DURATION);
    }, [anim, templates.length]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, goNext, goPrev, onClose]);

    if (!isOpen || templates.length === 0) return null;

    const idx = (offset: number) => (currentIndex + offset + templates.length) % templates.length;
    const current = templates[currentIndex];
    const hasMultiple = templates.length > 1;
    const hasThreeOrMore = templates.length >= 3;

    type CardDef = {
        templateIdx: number;
        animClass: string;
        targetPosition: Position;
        zIndex: number;
        isCenter: boolean;
        hideMobile: boolean;
        keyPrefix: string;
    };

    const cards: CardDef[] = [];

    if (!anim) {
        // Static state: left, center, right
        if (hasMultiple) {
            cards.push({ templateIdx: idx(-1), animClass: '', targetPosition: 'left', zIndex: 10, isCenter: false, hideMobile: true, keyPrefix: 'card' });
        }
        cards.push({ templateIdx: currentIndex, animClass: '', targetPosition: 'center', zIndex: 30, isCenter: true, hideMobile: false, keyPrefix: 'card' });
        if (hasMultiple) {
            cards.push({ templateIdx: idx(1), animClass: '', targetPosition: 'right', zIndex: 10, isCenter: false, hideMobile: true, keyPrefix: 'card' });
        }
    } else if (anim === 'next') {
        // Going next: center→left, right→center, new enters right (3 cards)
        cards.push({ templateIdx: currentIndex, animClass: 'animate-c-center-to-left', targetPosition: 'left', zIndex: 15, isCenter: false, hideMobile: false, keyPrefix: 'card' });
        cards.push({ templateIdx: idx(1), animClass: 'animate-c-right-to-center', targetPosition: 'center', zIndex: 30, isCenter: true, hideMobile: false, keyPrefix: 'card' });
        if (hasThreeOrMore) {
            cards.push({ templateIdx: idx(2), animClass: 'animate-c-enter-right', targetPosition: 'right', zIndex: 10, isCenter: false, hideMobile: true, keyPrefix: 'card' });
        }
    } else {
        // Going prev: center→right, left→center, new enters left (3 cards)
        cards.push({ templateIdx: currentIndex, animClass: 'animate-c-center-to-right', targetPosition: 'right', zIndex: 15, isCenter: false, hideMobile: false, keyPrefix: 'card' });
        cards.push({ templateIdx: idx(-1), animClass: 'animate-c-left-to-center', targetPosition: 'center', zIndex: 30, isCenter: true, hideMobile: false, keyPrefix: 'card' });
        if (hasThreeOrMore) {
            cards.push({ templateIdx: idx(-2), animClass: 'animate-c-enter-left', targetPosition: 'left', zIndex: 10, isCenter: false, hideMobile: true, keyPrefix: 'card' });
        }
    }

    if (typeof document === 'undefined') return null;

    return createPortal(
        <>
            <style jsx global>{`
                @keyframes c-center-to-left {
                    from { transform: scale(1.05); opacity: 1; }
                    to   { transform: translateX(-60%) scale(0.75) rotate(-6deg); opacity: 1; }
                }
                @keyframes c-right-to-center {
                    from { transform: translateX(60%) scale(0.75) rotate(6deg); opacity: 1; }
                    to   { transform: scale(1.05); opacity: 1; }
                }
                @keyframes c-enter-right {
                    from { transform: translateX(130%) scale(0.6) rotate(12deg); opacity: 0; }
                    to   { transform: translateX(60%) scale(0.75) rotate(6deg); opacity: 1; }
                }
                @keyframes c-center-to-right {
                    from { transform: scale(1.05); opacity: 1; }
                    to   { transform: translateX(60%) scale(0.75) rotate(6deg); opacity: 1; }
                }
                @keyframes c-left-to-center {
                    from { transform: translateX(-60%) scale(0.75) rotate(-6deg); opacity: 1; }
                    to   { transform: scale(1.05); opacity: 1; }
                }
                @keyframes c-enter-left {
                    from { transform: translateX(-130%) scale(0.6) rotate(-12deg); opacity: 0; }
                    to   { transform: translateX(-60%) scale(0.75) rotate(-6deg); opacity: 1; }
                }
                .animate-c-center-to-left { animation: c-center-to-left 450ms cubic-bezier(0.4, 0, 0.2, 1) both; }
                .animate-c-right-to-center { animation: c-right-to-center 450ms cubic-bezier(0.4, 0, 0.2, 1) both; }
                .animate-c-enter-right { animation: c-enter-right 450ms cubic-bezier(0.4, 0, 0.2, 1) both; }
                .animate-c-center-to-right { animation: c-center-to-right 450ms cubic-bezier(0.4, 0, 0.2, 1) both; }
                .animate-c-left-to-center { animation: c-left-to-center 450ms cubic-bezier(0.4, 0, 0.2, 1) both; }
                .animate-c-enter-left { animation: c-enter-left 450ms cubic-bezier(0.4, 0, 0.2, 1) both; }
            `}</style>

            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:p-8 animate-in fade-in duration-300" onClick={onClose}>
                <div
                    className="relative w-full max-w-[1200px] h-[90vh] max-h-[800px] bg-[#f7f5f8]/90 dark:bg-[#191022]/90 backdrop-blur-md rounded-xl border border-[#7f0df2]/20 shadow-2xl flex flex-col overflow-hidden z-50 animate-in zoom-in-95 duration-300"
                    onClick={e => e.stopPropagation()}
                    style={{ fontFamily: 'var(--font-display)' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-[#7f0df2]/10 bg-white/5">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white transition-all duration-300">
                                {current.title}
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 text-sm transition-all duration-300">
                                {current.description}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-[#7f0df2]/10 transition-colors text-slate-500 dark:text-slate-400 hover:text-[#7f0df2]"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Body - Preview Area */}
                    <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-linear-to-br from-[#f7f5f8] to-[#f7f5f8]/50 dark:from-[#191022] dark:to-[#7f0df2]/5">
                        {hasMultiple && (
                            <button
                                onClick={goPrev}
                                disabled={!!anim}
                                className="absolute left-4 lg:left-8 z-40 p-4 rounded-full bg-[#7f0df2]/20 hover:bg-[#7f0df2] text-[#7f0df2] hover:text-white transition-all backdrop-blur-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={32} />
                            </button>
                        )}

                        <div className="relative w-full max-w-4xl h-[400px] md:h-[540px]">
                            {cards.map(({ templateIdx, animClass, targetPosition, zIndex, isCenter, hideMobile, keyPrefix }) => {
                                const template = templates[templateIdx];
                                const pos = POSITIONS[targetPosition];
                                return (
                                    <div
                                        key={`${keyPrefix}-${targetPosition}-${templateIdx}`}
                                        className={`absolute inset-0 m-auto w-[280px] h-[420px] md:w-[360px] md:h-[540px] bg-white dark:bg-[#2a2233] rounded-xl overflow-hidden flex-col ${isCenter ? 'border-2 border-[#7f0df2]/30 shadow-[0_20px_50px_rgba(0,0,0,0.3)]' : 'border border-[#7f0df2]/10 shadow-xl'
                                            } ${animClass} ${hideMobile ? 'hidden md:flex' : 'flex'}`}
                                        style={{
                                            transform: pos.transform,
                                            opacity: pos.opacity,
                                            zIndex,
                                        }}
                                    >
                                        <div className={`w-full flex-1 relative ${template.preview} overflow-hidden`}>
                                            {template.previewContent}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {hasMultiple && (
                            <button
                                onClick={goNext}
                                disabled={!!anim}
                                className="absolute right-4 lg:right-8 z-40 p-4 rounded-full bg-[#7f0df2]/20 hover:bg-[#7f0df2] text-[#7f0df2] hover:text-white transition-all backdrop-blur-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={32} />
                            </button>
                        )}

                        {/* Pagination Dots */}
                        {hasMultiple && (
                            <div className="absolute bottom-8 z-40 flex gap-2">
                                {templates.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            if (anim || i === currentIndex) return;
                                            if (i > currentIndex) goNext();
                                            else goPrev();
                                        }}
                                        className={`rounded-full transition-all duration-300 cursor-pointer ${i === currentIndex
                                            ? 'w-8 h-2 bg-[#7f0df2]'
                                            : 'w-2 h-2 bg-[#7f0df2]/30 hover:bg-[#7f0df2]/50'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-[#7f0df2]/10 bg-[#f7f5f8]/50 dark:bg-[#191022]/50 flex justify-center backdrop-blur-md">
                        <button
                            onClick={() => {
                                onSelect(current.id);
                                onClose();
                            }}
                            className="flex min-w-[200px] cursor-pointer items-center justify-center gap-2 rounded-lg h-12 px-8 bg-[#7f0df2] hover:bg-[#7f0df2]/90 text-white text-base font-bold transition-colors shadow-lg shadow-[#7f0df2]/30"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 14 10 10 10-10-10-10Z" /><path d="m12 22 10-10" /><path d="m2 14 10-10" /></svg>
                            <span>Usar este Estilo</span>
                        </button>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
