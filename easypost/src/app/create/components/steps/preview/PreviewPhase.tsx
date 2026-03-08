'use client';

import { useState } from 'react';
import { ArrowLeft, Download, Pencil, Sparkles, Star } from 'lucide-react';
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

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0614] text-slate-100 overflow-hidden" style={{ fontFamily: 'var(--font-body)' }}>
            {/* ─── HEADER ─── */}
            <header className="flex items-center justify-between border-b border-white/5 px-6 py-4 bg-[#0a0614]/80 backdrop-blur-md z-50 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="size-8 text-[#7f0df2]">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                        EasyPost <span className="text-slate-500 font-normal text-sm ml-1 uppercase tracking-widest">Preview</span>
                    </h1>
                </div>
                <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold cursor-pointer"
                >
                    <ArrowLeft size={16} />
                    Voltar ao Editor
                </button>
            </header>

            {/* ─── MAIN ─── */}
            <main className="flex-1 flex flex-col items-center justify-center overflow-hidden p-8" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(127,13,242,0.08) 1px, transparent 0)',
                backgroundSize: '32px 32px',
            }}>
                {/* Hero image */}
                <div className="relative max-h-[calc(100vh-280px)] flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={images[activeIndex]}
                        alt={`Slide ${activeIndex + 1}`}
                        className="max-h-[calc(100vh-280px)] w-auto rounded-2xl shadow-2xl"
                        style={{ boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 40px rgba(127,13,242,0.15)' }}
                    />

                    {/* Slide label */}
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
                        <span className="text-xs font-bold text-white">
                            {activeIndex + 1}/{images.length} — {slideTypeLabels[slideTypes[activeIndex]] ?? slideTypes[activeIndex]}
                        </span>
                    </div>

                    {/* Loading overlay when editing this slide */}
                    {isEditing && editingIndex === activeIndex && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl">
                            <div className="flex items-center gap-3 text-white">
                                <span className="animate-spin text-2xl">&#x27F3;</span>
                                <span className="font-semibold">Editando com IA...</span>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ─── FILMSTRIP + FOOTER ─── */}
            <footer className="border-t border-white/5 bg-[#0a0614]/90 backdrop-blur-md px-6 py-4 z-50 shrink-0">
                {/* Filmstrip */}
                <div className="flex items-center justify-center gap-3 mb-4">
                    {images.map((img, i) => (
                        <div key={i} className="relative group">
                            <button
                                type="button"
                                onClick={() => setActiveIndex(i)}
                                className="block rounded-xl overflow-hidden transition-all cursor-pointer"
                                style={{
                                    width: 72,
                                    aspectRatio: platform === 'instagram' ? '4/5' : '1/1',
                                    border: activeIndex === i ? '2px solid #7f0df2' : '1px solid rgba(255,255,255,0.1)',
                                    opacity: activeIndex === i ? 1 : 0.6,
                                    boxShadow: activeIndex === i ? '0 0 15px rgba(127,13,242,0.5)' : 'none',
                                }}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
                            </button>

                            {/* Edit button */}
                            <button
                                type="button"
                                onClick={() => openEditModal(i)}
                                disabled={isEditing}
                                className="absolute -top-2 -right-2 size-7 rounded-full bg-[#7f0df2] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:scale-110 disabled:opacity-50"
                                title="Editar com IA"
                            >
                                <Pencil size={12} />
                                <Sparkles size={8} className="absolute -top-0.5 -right-0.5" />
                            </button>

                            {/* Save CTA default button */}
                            {slideTypes[i] === 'cta' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleSaveCtaDefault(img);
                                        setCtaSaved(true);
                                        setTimeout(() => setCtaSaved(false), 2000);
                                    }}
                                    className="absolute -bottom-2 -right-2 size-6 rounded-full bg-amber-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:scale-110"
                                    title="Salvar CTA como padrão"
                                >
                                    <Star size={10} fill="white" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* CTA saved toast */}
                {ctaSaved && (
                    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold animate-pulse">
                        CTA salvo como padrão!
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center justify-center gap-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                    >
                        <ArrowLeft size={16} />
                        Voltar ao Editor
                    </button>
                    <button
                        type="button"
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-[#7f0df2] hover:bg-[#7f0df2]/90 disabled:opacity-60 transition-all cursor-pointer"
                        style={{ fontFamily: 'var(--font-display)', boxShadow: '0 0 20px rgba(127,13,242,0.4)' }}
                    >
                        <Download size={16} />
                        {isDownloading ? 'Baixando...' : 'Baixar ZIP'}
                    </button>
                </div>
            </footer>

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

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(127,13,242,0.3); border-radius: 10px; }
            `}</style>
        </div>
    );
}
