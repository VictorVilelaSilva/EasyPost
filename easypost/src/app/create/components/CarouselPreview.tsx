'use client';

import { useState, useEffect, useCallback } from 'react';
import { CarouselData } from '@/types';
import { downloadCarouselZip } from '@/lib/downloadZip';
import { Download, Copy, CheckCircle2, ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
    data: CarouselData | null;
    topic: string;
    images: string[];
}

export default function CarouselPreview({ data, topic, images }: Props) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    if (!data || !images) return null;

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            await downloadCarouselZip(topic, data, images);
        } catch (e) {
            console.error(e);
            alert('Falha ao baixar o pacote');
        }
        setIsDownloading(false);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(data.caption);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const openLightbox = (index: number) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);

    const goToPrev = () => {
        if (lightboxIndex === null) return;
        setLightboxIndex(lightboxIndex === 0 ? images.length - 1 : lightboxIndex - 1);
    };

    const goToNext = () => {
        if (lightboxIndex === null) return;
        setLightboxIndex(lightboxIndex === images.length - 1 ? 0 : lightboxIndex + 1);
    };

    return (
        <>
            <div className="w-full mt-12 glass-card-static p-6 step-enter">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                        Seu Carrossel está Pronto
                    </h2>
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        aria-label="Baixar pacote do carrossel"
                        className="btn-glow cursor-pointer flex items-center gap-2 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
                        style={{
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                            fontFamily: 'var(--font-display)',
                            minHeight: '48px',
                        }}
                    >
                        <Download size={18} />
                        {isDownloading ? 'Compactando…' : 'Baixar Pacote'}
                    </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8 stagger-children">
                    {images.map((base64Image, i) => (
                        <div
                            key={i}
                            className="group relative aspect-square rounded-xl overflow-hidden shadow-lg animate-fade-in cursor-pointer"
                            style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}
                            onClick={() => openLightbox(i)}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={base64Image}
                                alt={`Slide ${i + 1} gerado por IA`}
                                width={1080}
                                height={1080}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {/* Zoom icon overlay */}
                            <div
                                className="absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{
                                    background: 'rgba(0, 0, 0, 0.6)',
                                    backdropFilter: 'blur(4px)',
                                }}
                            >
                                <ZoomIn size={16} className="text-white" />
                            </div>
                            {/* Slide number */}
                            <div
                                className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-xs font-medium"
                                style={{
                                    background: 'rgba(0, 0, 0, 0.6)',
                                    color: 'rgba(255, 255, 255, 0.85)',
                                    backdropFilter: 'blur(4px)',
                                }}
                            >
                                {i + 1}/{images.length}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="glass-card-static p-5 relative">
                    <button
                        onClick={copyToClipboard}
                        className="cursor-pointer absolute top-4 right-4 transition-colors"
                        style={{ color: copied ? '#34d399' : 'var(--color-text-muted)' }}
                        aria-label={copied ? 'Legenda copiada' : 'Copiar legenda'}
                        aria-live="polite"
                    >
                        {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                    </button>
                    <h3 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-subtle)', fontFamily: 'var(--font-display)' }}>
                        Legenda
                    </h3>
                    <p className="whitespace-pre-wrap pr-8 text-sm leading-relaxed" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
                        {data.caption}
                    </p>
                </div>
            </div>

            {/* Lightbox Modal with keyboard navigation */}
            {lightboxIndex !== null && (
                <LightboxModal
                    images={images}
                    index={lightboxIndex}
                    onClose={closeLightbox}
                    onPrev={goToPrev}
                    onNext={goToNext}
                />
            )}
        </>
    );
}

/* Separated to use hooks cleanly */
function LightboxModal({
    images,
    index,
    onClose,
    onPrev,
    onNext,
}: {
    images: string[];
    index: number;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
}) {
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') onPrev();
            if (e.key === 'ArrowRight') onNext();
        },
        [onClose, onPrev, onNext]
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [handleKeyDown]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
            style={{ background: 'rgba(0, 0, 0, 0.92)' }}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Visualização ampliada do slide"
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="cursor-pointer absolute top-4 right-4 z-50 w-11 h-11 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', minWidth: '44px', minHeight: '44px' }}
                aria-label="Fechar visualização (Escape)"
            >
                <X size={22} />
            </button>

            {/* Slide counter */}
            <div
                className="absolute top-5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-medium"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
            >
                {index + 1} / {images.length}
            </div>

            {/* Previous button */}
            <button
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                className="cursor-pointer absolute left-3 sm:left-6 z-50 w-11 h-11 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', minWidth: '44px', minHeight: '44px' }}
                aria-label="Slide anterior (←)"
            >
                <ChevronLeft size={24} />
            </button>

            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={images[index]}
                alt={`Slide ${index + 1} ampliado`}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[85vh] max-w-[90vw] rounded-2xl shadow-2xl object-contain"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            />

            {/* Next button */}
            <button
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                className="cursor-pointer absolute right-3 sm:right-6 z-50 w-11 h-11 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', minWidth: '44px', minHeight: '44px' }}
                aria-label="Próximo slide (→)"
            >
                <ChevronRight size={24} />
            </button>
        </div>
    );
}
