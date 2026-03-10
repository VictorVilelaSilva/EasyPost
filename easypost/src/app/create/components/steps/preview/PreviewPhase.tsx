'use client';

import { useState } from 'react';
import {
    ArrowLeft,
    Download,
    Pencil,
    Sparkles,
    Star,
    ChevronLeft,
    ChevronRight,
    Instagram,
    Linkedin,
    ZoomIn,
    MoreHorizontal,
    Heart,
    MessageCircle,
    Send,
    Bookmark,
} from 'lucide-react';
import { Platform } from '@/types';
import { usePreviewLogic } from './usePreviewLogic';
import { EditPromptModal } from './EditPromptModal';
import { CompareModal } from './CompareModal';

interface PreviewPhaseProps {
    fusedImages: string[];
    slideTypes: string[];
    caption: string;
    platform: Platform;
    onBack: () => void;
    onImagesChange: (images: string[]) => void;
}

export function PreviewPhase({ fusedImages, slideTypes, caption, platform, onBack, onImagesChange }: PreviewPhaseProps) {
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
    } = usePreviewLogic(fusedImages, slideTypes, caption, platform);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editTargetIndex, setEditTargetIndex] = useState<number | null>(null);
    const [ctaSaved, setCtaSaved] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);

    const slideTypeLabels: Record<string, string> = { cover: 'Capa', content: 'Conteúdo', cta: 'CTA' };

    const openEditModal = (index: number) => {
        setEditTargetIndex(index);
        setShowEditModal(true);
    };

    const handleSubmitEdit = async (prompt: string) => {
        if (editTargetIndex === null) return;
        setShowEditModal(false);
        await handleEditSlide(editTargetIndex, prompt);
    };

    const handleAccept = () => {
        const updated = handleAcceptEdit();
        if (updated) onImagesChange(updated);
    };

    const goNext = () => setActiveIndex((prev: number) => (prev + 1) % images.length);
    const goPrev = () => setActiveIndex((prev: number) => (prev - 1 + images.length) % images.length);

    const aspectRatio = platform === 'instagram' ? '4/5' : '1/1';

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col text-slate-100 overflow-hidden"
            style={{
                fontFamily: 'var(--font-body)',
                backgroundColor: '#0a0614',
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(127,13,242,0.08) 1px, transparent 0)',
                backgroundSize: '32px 32px',
            }}
        >
            {/* ─── HEADER ─── */}
            <header className="flex-none flex items-center justify-between px-6 py-4 bg-[#0a0614]/80 backdrop-blur-md border-b border-white/10 z-10">
                {/* Left: Back button */}
                <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium cursor-pointer"
                >
                    <ArrowLeft size={18} />
                    Voltar ao Editor
                </button>

                {/* Center: Platform badge */}
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10"
                    style={{ boxShadow: '0 0 15px rgba(127,13,242,0.15)' }}
                >
                    <Sparkles size={14} className="text-[#7f0df2]" />
                    <span className="text-xs font-bold tracking-wider uppercase text-slate-300">
                        {platform === 'instagram' ? 'Instagram' : 'LinkedIn'}
                    </span>
                </div>

                {/* Right: Branding */}
                <div className="flex items-center gap-2 text-slate-100">
                    <div className="size-6 text-[#7f0df2]">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor" />
                        </svg>
                    </div>
                    <span className="font-bold text-base tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                        EasyPost <span className="text-slate-500 font-normal text-sm uppercase tracking-widest">Preview</span>
                    </span>
                </div>
            </header>

            {/* ─── MAIN ─── */}
            <main className="flex-1 flex flex-col relative min-h-0">
                {/* Hero Area */}
                <div className="flex-1 flex items-center justify-center relative p-6 overflow-hidden">

                    {/* Navigation Arrow Left */}
                    {images.length > 1 && (
                        <button
                            type="button"
                            onClick={goPrev}
                            className="absolute left-8 z-20 w-14 h-14 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:scale-105 transition-all cursor-pointer"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}

                    {/* Navigation Arrow Right */}
                    {images.length > 1 && (
                        <button
                            type="button"
                            onClick={goNext}
                            className="absolute right-8 z-20 w-14 h-14 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:scale-105 transition-all cursor-pointer"
                        >
                            <ChevronRight size={24} />
                        </button>
                    )}

                    {/* Main Slide Mockup Container */}
                    <div className="flex-1 flex items-center justify-center z-10 w-full px-4">
                        <div
                            className="w-full bg-black/60 rounded-[32px] p-4 border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative flex flex-col"
                            style={{
                                maxWidth: platform === 'instagram' ? '380px' : '500px',
                                maxHeight: 'calc(100vh - 240px)',
                            }}
                        >
                            {/* Mockup header */}
                            <div className="flex-none flex items-center justify-between mb-3 px-1">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[2px]">
                                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                            <span className="text-[9px] text-purple-300 font-bold"> IA </span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white leading-none mb-0.5" style={{ fontFamily: 'var(--font-display)' }}>seu_perfil</p>
                                        <p className="text-[9px] text-slate-500 leading-none">
                                            {platform === 'linkedin' ? 'Agora mesmo • 🌍' : 'Áudio Original'}
                                        </p>
                                    </div>
                                </div>
                                <MoreHorizontal size={16} className="text-slate-400" />
                            </div>

                            {/* Slide Container (Original Main Slide logic) */}
                            <div
                                className="relative overflow-hidden rounded-xl group cursor-pointer border border-white/10"
                                style={{
                                    aspectRatio,
                                    width: '100%',
                                }}
                                onClick={() => setIsZoomed(true)}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={images[activeIndex]}
                                    alt={`Slide ${activeIndex + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                />

                                {/* AI Editing Banner */}
                                {isEditing && editingIndex === activeIndex ? (
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-[#7f0df2]/30">
                                        <span className="w-2 h-2 rounded-full bg-[#7f0df2] animate-pulse" />
                                        <span className="text-xs font-medium text-purple-300">Editando com IA...</span>
                                    </div>
                                ) : (
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                                        <Sparkles size={10} className="text-[#7f0df2]" />
                                        <span className="text-xs font-medium text-slate-300">IA Gerada</span>
                                    </div>
                                )}

                                {/* Slide label badge */}
                                <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/10">
                                    <span className="text-xs font-bold text-white">
                                        {activeIndex + 1}/{images.length} — {slideTypeLabels[slideTypes[activeIndex]] ?? slideTypes[activeIndex]}
                                    </span>
                                </div>

                                {/* Hover overlay actions */}
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); openEditModal(activeIndex); }}
                                        disabled={isEditing}
                                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
                                    >
                                        <Pencil size={16} />
                                        <span>Editar Slide</span>
                                        <Sparkles size={12} className="text-[#7f0df2]" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setIsZoomed(true); }}
                                        className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors cursor-pointer"
                                    >
                                        <ZoomIn size={18} />
                                    </button>
                                </div>

                                {/* Loading overlay */}
                                {isEditing && editingIndex === activeIndex && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                        <div className="flex items-center gap-3 text-white">
                                            <span className="animate-spin text-2xl text-[#7f0df2]">⟳</span>
                                            <span className="font-semibold">Editando com IA...</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Engagement row */}
                            <div className="flex-none mt-4 px-1">
                                {platform === 'linkedin' ? (
                                    <div className="flex items-center justify-between border-t border-white/8 pt-3">
                                        {[Heart, MessageCircle, Send].map((Icon, i) => (
                                            <div key={i} className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
                                                <Icon size={16} />
                                                <span className="text-[11px] font-bold"> {['Gostei', 'Comentar', 'Enviar'][i]} </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between pb-1">
                                        <div className="flex items-center gap-4">
                                            <Heart size={20} className="text-white hover:text-red-500 transition-colors" />
                                            <MessageCircle size={20} className="text-white hover:text-slate-300 transition-colors" />
                                            <Send size={20} className="text-white hover:text-slate-300 transition-colors" />
                                        </div>
                                        <Bookmark size={20} className="text-white hover:text-slate-300 transition-colors" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filmstrip Area */}
                <div className="flex-none flex flex-col items-center pb-4">
                    {/* Filmstrip container */}
                    <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl">
                        {images.map((img, i) => (
                            <div key={i} className="relative group">
                                <button
                                    type="button"
                                    onClick={() => setActiveIndex(i)}
                                    className="block rounded-xl overflow-hidden transition-all cursor-pointer"
                                    style={{
                                        width: 88,
                                        aspectRatio,
                                        border: activeIndex === i ? '2px solid #7f0df2' : '1px solid rgba(255,255,255,0.1)',
                                        opacity: activeIndex === i ? 1 : 0.6,
                                        boxShadow: activeIndex === i ? '0 0 15px rgba(127,13,242,0.5)' : 'none',
                                        transform: activeIndex === i ? 'scale(1.05)' : 'scale(1)',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    {/* Gradient overlay at bottom */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
                                    {/* Slide number */}
                                    <div className="absolute bottom-1.5 left-2 text-[10px] font-bold text-white z-20">{i + 1}</div>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={img} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
                                </button>

                                {/* Hover actions */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center gap-1.5 z-30">
                                    <button
                                        type="button"
                                        onClick={() => openEditModal(i)}
                                        disabled={isEditing}
                                        className="p-1.5 rounded-full bg-white/20 hover:bg-[#7f0df2] text-white transition-colors cursor-pointer disabled:opacity-50"
                                        title="Editar com IA"
                                    >
                                        <Pencil size={12} />
                                    </button>
                                    {slideTypes[i] === 'cta' && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                handleSaveCtaDefault(img);
                                                setCtaSaved(true);
                                                setTimeout(() => setCtaSaved(false), 2000);
                                            }}
                                            className="p-1.5 rounded-full bg-white/20 hover:bg-amber-500 text-white transition-colors cursor-pointer"
                                            title="Salvar CTA como padrão"
                                        >
                                            <Star size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Keyboard nav hint */}
                    <p className="text-slate-500 text-xs font-medium tracking-wide uppercase mt-3 flex items-center gap-1">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono">←</span>
                        <span className="inline-block px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono mr-1">→</span>
                        para navegar
                    </p>
                </div>
            </main>

            {/* ─── FOOTER ─── */}
            <footer className="flex-none flex items-center justify-between px-8 py-4 bg-[#0a0614]/90 backdrop-blur-lg border-t border-white/10 z-10">
                {/* Left: Social sharing */}
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold tracking-wider uppercase text-slate-500 mr-1">Compartilhar</span>
                    <button
                        type="button"
                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                        title="Instagram"
                    >
                        <Instagram size={18} />
                    </button>
                    <button
                        type="button"
                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                        title="LinkedIn"
                    >
                        <Linkedin size={18} />
                    </button>
                </div>

                {/* Right: Download */}
                <button
                    type="button"
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-[#7f0df2] hover:bg-[#7f0df2]/90 disabled:opacity-60 transition-all cursor-pointer"
                    style={{
                        fontFamily: 'var(--font-display)',
                        boxShadow: '0 0 20px rgba(127,13,242,0.4)',
                    }}
                >
                    <Download size={18} />
                    {isDownloading ? 'Baixando...' : 'Baixar ZIP'}
                </button>
            </footer>

            {/* CTA saved toast */}
            {ctaSaved && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold animate-pulse z-50">
                    ⭐ CTA salvo como padrão!
                </div>
            )}

            {/* Zoom modal */}
            {isZoomed && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/80 backdrop-blur-sm"
                    onClick={() => setIsZoomed(false)}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={images[activeIndex]}
                        alt={`Slide ${activeIndex + 1}`}
                        className="max-h-full max-w-full rounded-2xl object-contain"
                        style={{ boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        type="button"
                        onClick={() => setIsZoomed(false)}
                        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* ─── MODALS ─── */}
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
                    onAccept={handleAccept}
                    onReject={handleRejectEdit}
                />
            )}
        </div>
    );
}
