'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Download,
    Pencil,
    Sparkles,
    Star,
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    MoreHorizontal,
    Heart,
    MessageCircle,
    Send,
    Bookmark,
    Copy,
    Check,
} from 'lucide-react';
import { usePreviewData } from '@/contexts/PreviewContext';
import { usePreviewLogic } from '@/app/create/components/steps/preview/usePreviewLogic';
import { EditPromptModal } from '@/app/create/components/steps/preview/EditPromptModal';
import { CompareModal } from '@/app/create/components/steps/preview/CompareModal';

/* ─────────────────────────────────────────────
   Empty state — shown when no data in context
   ───────────────────────────────────────────── */
function EmptyState() {
    const router = useRouter();
    return (
        <div className="flex-1 flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
            <div className="text-center space-y-4 px-4">
                <div
                    className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(127,13,242,0.12)', border: '1px solid rgba(127,13,242,0.2)' }}
                >
                    <Sparkles size={22} className="text-[#7f0df2]" />
                </div>
                <h2
                    className="text-xl font-bold text-white"
                    style={{ fontFamily: 'var(--font-display)' }}
                >
                    Nenhum carrossel para visualizar
                </h2>
                <p className="text-sm text-slate-500">Crie um carrossel primeiro para visualizá-lo aqui.</p>
                <button
                    onClick={() => router.push('/create')}
                    className="mt-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors cursor-pointer"
                    style={{ background: '#7f0df2' }}
                >
                    Criar Carrossel
                </button>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   Main preview content
   ───────────────────────────────────────────── */
function PreviewContent({ previewData }: { previewData: NonNullable<ReturnType<typeof usePreviewData>['previewData']> }) {
    const router = useRouter();

    const {
        images,
        activeIndex,
        setActiveIndex,
        isDownloading,
        isEditing,
        editingIndex,
        compareData,
        handleDownload,
        handleEditSlide,
        handleAcceptEdit,
        handleRejectEdit,
        handleSaveCtaDefault,
    } = usePreviewLogic(previewData.images, previewData.slideTypes, previewData.caption, previewData.platform);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editTargetIndex, setEditTargetIndex] = useState<number | null>(null);
    const [ctaSaved, setCtaSaved] = useState(false);
    const [captionCopied, setCaptionCopied] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);

    const slideTypeLabels: Record<string, string> = { cover: 'Capa', content: 'Conteúdo', cta: 'CTA' };

    const goNext = useCallback(() => setActiveIndex(p => (p + 1) % images.length), [images.length, setActiveIndex]);
    const goPrev = useCallback(() => setActiveIndex(p => (p - 1 + images.length) % images.length), [images.length, setActiveIndex]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') goNext();
            else if (e.key === 'ArrowLeft') goPrev();
            else if (e.key === 'Escape') setIsZoomed(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [goNext, goPrev]);

    const openEditModal = (index: number) => {
        setEditTargetIndex(index);
        setShowEditModal(true);
    };

    const handleSubmitEdit = async (prompt: string) => {
        if (editTargetIndex === null) return;
        setShowEditModal(false);
        await handleEditSlide(editTargetIndex, prompt);
    };

    const handleCopyCaption = async () => {
        try {
            await navigator.clipboard.writeText(previewData.caption);
            setCaptionCopied(true);
            setTimeout(() => setCaptionCopied(false), 2000);
        } catch { }
    };

    return (
        <div
            className="flex flex-col lg:flex-row"
            style={{ minHeight: 'calc(100vh - 80px)' }}
        >
            {/* ═══════════════════════════════════════
                LEFT PANEL — Phone Mockup Stage
            ════════════════════════════════════════ */}
            <div
                className="flex-1 flex flex-col items-center justify-center relative p-8 lg:p-16"
                style={{
                    background: 'radial-gradient(ellipse 80% 70% at 50% 55%, rgba(127,13,242,0.07) 0%, transparent 65%)',
                }}
            >
                {/* Back */}
                <button
                    onClick={() => router.back()}
                    className="absolute top-5 left-5 flex items-center gap-1.5 text-[11px] font-medium text-slate-600 hover:text-slate-200 transition-colors cursor-pointer group"
                >
                    <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
                    Voltar
                </button>

                {/* Stage label */}
                <div className="mb-7 flex items-center gap-3">
                    <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-slate-700">Preview</span>
                    <div className="h-px w-6 bg-white/10" />
                    <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-[#7f0df2]">Instagram</span>
                </div>

                {/* Ambient glow */}
                <div
                    className="absolute pointer-events-none"
                    style={{
                        width: 300,
                        height: 440,
                        borderRadius: '50%',
                        background: 'radial-gradient(ellipse, rgba(127,13,242,0.18) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                    }}
                />

                {/* ── iPhone Frame ── */}
                <div
                    className="relative z-10 transition-all duration-300"
                    style={{
                        width: 'clamp(280px, min(45vw, calc((100vh - 240px) * 0.8)), 600px)',
                        background: 'linear-gradient(160deg, #281d38 0%, #18102a 55%, #201630 100%)',
                        borderRadius: 48,
                        padding: 10,
                        boxShadow: `
                            0 0 0 1px rgba(255,255,255,0.07),
                            0 0 0 2px rgba(0,0,0,0.5),
                            0 50px 100px rgba(0,0,0,0.85),
                            0 0 50px rgba(127,13,242,0.18),
                            inset 0 1px 0 rgba(255,255,255,0.1),
                            inset 0 -1px 0 rgba(0,0,0,0.4)
                        `,
                    }}
                >
                    {/* Volume buttons (left side) */}
                    {['22%', '34%'].map((top, i) => (
                        <div
                            key={i}
                            className="absolute"
                            style={{
                                left: -3,
                                top,
                                width: 3,
                                height: 28,
                                background: 'linear-gradient(to right, #160e24, #2d1f45)',
                                borderRadius: '2px 0 0 2px',
                            }}
                        />
                    ))}
                    {/* Power button (right side) */}
                    <div
                        className="absolute"
                        style={{
                            right: -3,
                            top: '30%',
                            width: 3,
                            height: 52,
                            background: 'linear-gradient(to left, #160e24, #2d1f45)',
                            borderRadius: '0 2px 2px 0',
                        }}
                    />

                    {/* Screen */}
                    <div style={{ background: '#000', borderRadius: 40, overflow: 'hidden', position: 'relative' }}>

                        {/* Dynamic Island */}
                        <div
                            style={{
                                position: 'absolute',
                                top: 'clamp(10px, 2%, 14px)',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 'clamp(88px, 25%, 120px)',
                                height: 'clamp(26px, 6%, 32px)',
                                background: '#000',
                                borderRadius: 20,
                                zIndex: 20,
                                border: '1.5px solid #111',
                                boxShadow: '0 0 0 1px rgba(255,255,255,0.04)',
                            }}
                        />

                        {/* Status bar space */}
                        <div style={{ height: 'clamp(44px, 10%, 56px)' }} />

                        {/* Instagram post chrome */}
                        <div style={{ padding: 'clamp(4px, 2%, 8px) clamp(10px, 3%, 16px)' }} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {/* Avatar — gradient ring */}
                                <div
                                    className="p-[1.5px] rounded-full flex-none"
                                    style={{ background: 'linear-gradient(135deg, #f58529, #dd2a7b, #8134af, #515bd4)' }}
                                >
                                    <div className="rounded-full bg-black flex items-center justify-center w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] md:w-[36px] md:h-[36px]">
                                        <span className="text-[8px] sm:text-[9px] md:text-[10px] text-purple-300 font-bold">IA</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="leading-none text-white font-bold text-[11px] sm:text-[13px] md:text-[14px] mb-[2px]" style={{ fontFamily: 'var(--font-display)' }}>
                                        seu_perfil
                                    </p>
                                    <p className="leading-none text-slate-600 text-[9px] sm:text-[11px] md:text-[12px]">Áudio original</p>
                                </div>
                            </div>
                            <MoreHorizontal className="text-slate-600 w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                        </div>

                        {/* Slide image */}
                        <div
                            className="relative cursor-pointer group flex items-center justify-center bg-black"
                            style={{ width: '100%', overflow: 'hidden' }}
                            onClick={() => setIsZoomed(true)}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={images[activeIndex]}
                                alt={`Slide ${activeIndex + 1}`}
                                className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                            />

                            {/* Progress dots */}
                            {images.length > 1 && (
                                <div className="absolute top-2.5 inset-x-0 flex justify-center gap-1 pointer-events-none z-10">
                                    {images.map((_, i) => (
                                        <div
                                            key={i}
                                            className="rounded-full transition-all duration-300"
                                            style={{
                                                height: 4,
                                                width: i === activeIndex ? 16 : 4,
                                                background: i === activeIndex ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.4)',
                                            }}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* AI editing overlay */}
                            {isEditing && editingIndex === activeIndex && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/65 backdrop-blur-sm z-20">
                                    <div className="flex items-center gap-2 text-white">
                                        <span className="animate-spin text-[#7f0df2] text-lg">⟳</span>
                                        <span style={{ fontSize: 11, fontFamily: 'var(--font-body)' }}>Editando com IA...</span>
                                    </div>
                                </div>
                            )}

                            {/* Zoom hint */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/25 z-10">
                                <div
                                    className="flex items-center gap-1.5 text-white"
                                    style={{
                                        padding: '5px 10px',
                                        borderRadius: 20,
                                        background: 'rgba(0,0,0,0.55)',
                                        backdropFilter: 'blur(8px)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        fontSize: 10,
                                    }}
                                >
                                    <ZoomIn size={11} />
                                    Ampliar
                                </div>
                            </div>
                        </div>

                        {/* Engagement row */}
                        <div style={{ padding: 'clamp(8px, 3%, 14px) clamp(12px, 4%, 16px) clamp(4px, 2%, 8px)' }} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Heart className="text-white cursor-pointer hover:text-red-400 transition-colors w-5 h-5 sm:w-6 sm:h-6" />
                                <MessageCircle className="text-white cursor-pointer hover:text-slate-300 transition-colors w-5 h-5 sm:w-6 sm:h-6" />
                                <Send className="text-white cursor-pointer hover:text-slate-300 transition-colors w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <Bookmark className="text-white cursor-pointer hover:text-slate-300 transition-colors w-5 h-5 sm:w-6 sm:h-6" />
                        </div>

                        {/* Home indicator */}
                        <div style={{ paddingBottom: 'clamp(8px, 3%, 12px)', paddingTop: 'clamp(6px, 2%, 10px)' }} className="flex justify-center">
                            <div style={{ width: 'clamp(90px, 35%, 120px)', height: 'clamp(4px, 1%, 5px)', background: 'rgba(255,255,255,0.25)', borderRadius: 4 }} />
                        </div>
                    </div>
                </div>

                {/* Navigation — prev / counter / next */}
                <div className="mt-7 flex items-center gap-4 z-10">
                    <button
                        onClick={goPrev}
                        disabled={images.length <= 1}
                        className="flex items-center justify-center transition-all cursor-pointer disabled:opacity-30"
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.04)',
                            color: 'rgba(255,255,255,0.6)',
                        }}
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <span
                        className="text-slate-600 text-center"
                        style={{ fontSize: 11, fontFamily: 'monospace', minWidth: 40 }}
                    >
                        {activeIndex + 1} / {images.length}
                    </span>

                    <button
                        onClick={goNext}
                        disabled={images.length <= 1}
                        className="flex items-center justify-center transition-all cursor-pointer disabled:opacity-30"
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.04)',
                            color: 'rgba(255,255,255,0.6)',
                        }}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* Keyboard hint */}
                <p className="mt-3 z-10 flex items-center gap-1.5" style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>
                    <span style={{ padding: '1px 5px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 }}>←</span>
                    <span style={{ padding: '1px 5px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 }}>→</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 9 }}>para navegar</span>
                </p>
            </div>

            {/* ═══════════════════════════════════════
                RIGHT PANEL — Control Deck
            ════════════════════════════════════════ */}
            <div
                className="w-full lg:w-[360px] xl:w-[400px] flex flex-col border-t lg:border-t-0 lg:border-l"
                style={{
                    borderColor: 'rgba(127,13,242,0.1)',
                    background: 'rgba(9,5,16,0.75)',
                    backdropFilter: 'blur(12px)',
                }}
            >
                {/* Panel header */}
                <div
                    className="px-6 pt-6 pb-4 border-b"
                    style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                >
                    <h2
                        className="text-sm font-bold text-white"
                        style={{ fontFamily: 'var(--font-display)' }}
                    >
                        Seu Carrossel
                    </h2>
                    <p className="text-slate-600 mt-0.5" style={{ fontSize: 10 }}>
                        {images.length} slides
                        {' · '}
                        {slideTypeLabels[previewData.slideTypes[activeIndex]] ?? previewData.slideTypes[activeIndex]}
                    </p>
                </div>

                {/* Filmstrip */}
                <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1.5" style={{ minHeight: 0 }}>
                    <p
                        className="px-2 mb-2"
                        style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}
                    >
                        Slides
                    </p>

                    {images.map((img, i) => (
                        <div key={i} className="relative group">
                            <button
                                onClick={() => setActiveIndex(i)}
                                className="w-full flex items-center gap-3 rounded-xl transition-all duration-150 cursor-pointer text-left"
                                style={{
                                    padding: '8px 10px',
                                    background: activeIndex === i ? 'rgba(127,13,242,0.12)' : 'rgba(255,255,255,0.025)',
                                    border: `1px solid ${activeIndex === i ? 'rgba(127,13,242,0.28)' : 'rgba(255,255,255,0.05)'}`,
                                }}
                            >
                                {/* Thumbnail */}
                                <div
                                    className="flex-none overflow-hidden rounded-lg bg-black flex items-center justify-center"
                                    style={{ width: 40, aspectRatio: '1/1' }}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={img} alt={`Slide ${i + 1}`} className="w-full h-full object-contain" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-semibold leading-none mb-1" style={{ fontSize: 11 }}>
                                        Slide {i + 1}
                                    </p>
                                    <p className="text-slate-600 leading-none" style={{ fontSize: 10 }}>
                                        {slideTypeLabels[previewData.slideTypes[i]] ?? previewData.slideTypes[i]}
                                    </p>
                                </div>

                                {isEditing && editingIndex === i && (
                                    <span className="text-[#7f0df2] animate-spin text-sm flex-none">⟳</span>
                                )}
                            </button>

                            {/* Hover actions */}
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {previewData.slideTypes[i] === 'cta' && (
                                    <button
                                        onClick={() => {
                                            handleSaveCtaDefault(img);
                                            setCtaSaved(true);
                                            setTimeout(() => setCtaSaved(false), 2000);
                                        }}
                                        className="flex items-center justify-center transition-colors cursor-pointer"
                                        style={{
                                            width: 26, height: 26, borderRadius: 8,
                                            background: 'rgba(245,158,11,0.15)',
                                            border: '1px solid rgba(245,158,11,0.25)',
                                            color: '#fbbf24',
                                        }}
                                        title="Salvar CTA como padrão"
                                    >
                                        <Star size={11} />
                                    </button>
                                )}
                                <button
                                    onClick={() => openEditModal(i)}
                                    disabled={isEditing}
                                    className="flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30"
                                    style={{
                                        width: 26, height: 26, borderRadius: 8,
                                        background: 'rgba(127,13,242,0.2)',
                                        border: '1px solid rgba(127,13,242,0.3)',
                                        color: '#c084fc',
                                    }}
                                    title="Editar com IA"
                                >
                                    <Pencil size={11} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Caption */}
                <div className="px-6 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center justify-between mb-2">
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>
                            Legenda
                        </p>
                        <button
                            onClick={handleCopyCaption}
                            className="flex items-center gap-1 transition-colors cursor-pointer"
                            style={{ fontSize: 10, color: captionCopied ? '#4ade80' : 'rgba(255,255,255,0.3)' }}
                        >
                            {captionCopied ? <Check size={10} /> : <Copy size={10} />}
                            {captionCopied ? 'Copiado!' : 'Copiar'}
                        </button>
                    </div>
                    <p
                        className="leading-relaxed"
                        style={{
                            fontSize: 11,
                            color: 'rgba(255,255,255,0.45)',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            fontFamily: 'var(--font-body)',
                        }}
                    >
                        {previewData.caption}
                    </p>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex flex-col gap-2.5">
                    <button
                        onClick={() => openEditModal(activeIndex)}
                        disabled={isEditing}
                        className="w-full flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
                        style={{
                            padding: '10px 16px',
                            borderRadius: 12,
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.04)',
                            fontSize: 12,
                            fontWeight: 600,
                            color: 'rgba(255,255,255,0.8)',
                            fontFamily: 'var(--font-body)',
                        }}
                    >
                        <Pencil size={13} />
                        <Sparkles size={11} className="text-[#7f0df2]" />
                        Editar slide com IA
                    </button>

                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="w-full flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                        style={{
                            padding: '12px 16px',
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, #7f0df2 0%, #6309c4 100%)',
                            boxShadow: '0 4px 20px rgba(127,13,242,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                            fontSize: 13,
                            fontWeight: 700,
                            color: '#fff',
                            fontFamily: 'var(--font-display)',
                        }}
                    >
                        <Download size={15} />
                        {isDownloading ? 'Baixando...' : 'Baixar ZIP'}
                    </button>
                </div>
            </div>

            {/* ─── Modals ─── */}
            {showEditModal && (
                <EditPromptModal
                    onSubmit={handleSubmitEdit}
                    onClose={() => setShowEditModal(false)}
                    isLoading={isEditing}
                />
            )}

            {compareData && (
                <CompareModal
                    original={compareData.original}
                    edited={compareData.edited}
                    onAccept={handleAcceptEdit}
                    onReject={handleRejectEdit}
                />
            )}

            {/* Toast: CTA saved */}
            {ctaSaved && (
                <div
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-amber-300 z-50"
                    style={{
                        padding: '8px 16px',
                        borderRadius: 12,
                        background: 'rgba(245,158,11,0.15)',
                        border: '1px solid rgba(245,158,11,0.25)',
                        backdropFilter: 'blur(12px)',
                        fontSize: 12,
                        fontWeight: 600,
                    }}
                >
                    <Star size={12} />
                    CTA salvo como padrão!
                </div>
            )}

            {/* Zoom modal */}
            {isZoomed && (
                <div
                    className="fixed inset-0 z-100 flex items-center justify-center p-8 cursor-pointer"
                    style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}
                    onClick={() => setIsZoomed(false)}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={images[activeIndex]}
                        alt={`Slide ${activeIndex + 1}`}
                        className="max-h-full max-w-full rounded-2xl object-contain"
                        style={{ boxShadow: '0 40px 120px rgba(0,0,0,0.9)' }}
                        onClick={e => e.stopPropagation()}
                    />
                    <button
                        onClick={() => setIsZoomed(false)}
                        className="absolute top-6 right-6 flex items-center justify-center text-white transition-all cursor-pointer"
                        style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            fontSize: 16,
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────
   Page entry point
   ───────────────────────────────────────────── */
export default function PreviewPage() {
    const { previewData } = usePreviewData();

    if (!previewData) return <EmptyState />;
    return <PreviewContent previewData={previewData} />;
}
