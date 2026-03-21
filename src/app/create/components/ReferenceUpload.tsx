'use client';

import { useState, useRef, useCallback } from 'react';
import { ImagePlus, LayoutTemplate, FileText, MousePointerClick, Upload, X, RefreshCw, Sparkles } from 'lucide-react';
import { ReferenceImages } from '@/types';
import { validateImageFile, resizeImageFile, ImageValidationError } from '@/lib/resizeImage';

type SlotType = 'cover' | 'content' | 'cta';

interface SlotConfig {
    type: SlotType;
    label: string;
    icon: typeof LayoutTemplate;
}

const SLOTS: SlotConfig[] = [
    { type: 'cover', label: 'Capa', icon: LayoutTemplate },
    { type: 'content', label: 'Conteúdo', icon: FileText },
    { type: 'cta', label: 'CTA', icon: MousePointerClick },
];

const ERROR_MESSAGES: Record<ImageValidationError, string> = {
    'too-large': 'Arquivo muito grande. Máximo 5MB.',
    'invalid-format': 'Formato não suportado. Use PNG, JPG ou WEBP.',
    'corrupted': 'Não foi possível ler esta imagem.',
};

interface Props {
    referenceImages: ReferenceImages;
    onUpdate: (images: ReferenceImages) => void;
    onContinue: () => void;
    onSkip: () => void;
    onBack: () => void;
}

export default function ReferenceUpload({ referenceImages, onUpdate, onContinue, onSkip, onBack }: Props) {
    const [dragOverSlot, setDragOverSlot] = useState<SlotType | null>(null);
    const [slotErrors, setSlotErrors] = useState<Partial<Record<SlotType, string>>>({});
    const [loadingSlot, setLoadingSlot] = useState<SlotType | null>(null);
    const fileInputRefs = useRef<Partial<Record<SlotType, HTMLInputElement>>>({});

    const hasAnyImage = !!(referenceImages.cover || referenceImages.content || referenceImages.cta);

    const showError = useCallback((slot: SlotType, message: string) => {
        setSlotErrors(prev => ({ ...prev, [slot]: message }));
        setTimeout(() => {
            setSlotErrors(prev => {
                const next = { ...prev };
                delete next[slot];
                return next;
            });
        }, 3000);
    }, []);

    const handleFile = useCallback(async (file: File, slot: SlotType) => {
        const validationError = validateImageFile(file);
        if (validationError) {
            showError(slot, ERROR_MESSAGES[validationError]);
            return;
        }

        setLoadingSlot(slot);
        try {
            const dataUrl = await resizeImageFile(file);
            onUpdate({ ...referenceImages, [slot]: dataUrl });
        } catch {
            showError(slot, ERROR_MESSAGES['corrupted']);
        }
        setLoadingSlot(null);
    }, [referenceImages, onUpdate, showError]);

    const handleDrop = useCallback((e: React.DragEvent, slot: SlotType) => {
        e.preventDefault();
        setDragOverSlot(null);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file, slot);
    }, [handleFile]);

    const handleDragOver = useCallback((e: React.DragEvent, slot: SlotType) => {
        e.preventDefault();
        setDragOverSlot(slot);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragOverSlot(null);
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, slot: SlotType) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file, slot);
        e.target.value = '';
    }, [handleFile]);

    const handleRemove = useCallback((slot: SlotType) => {
        const updated = { ...referenceImages };
        delete updated[slot];
        onUpdate(updated);
    }, [referenceImages, onUpdate]);

    const containerStyle = {
        background: 'rgba(22, 10, 38, 0.7)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(168, 85, 247, 0.12)',
        boxShadow: '0 8px 40px rgba(127, 13, 242, 0.08), 0 2px 16px rgba(0,0,0,0.3)',
    };

    return (
        <div className="w-full flex justify-center mt-2 animate-fade-in font-display">
            <div className="w-full max-w-[840px] flex flex-col gap-6">
                <section className="relative overflow-hidden rounded-[24px] p-6 sm:p-8 flex flex-col gap-8" style={containerStyle}>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#a855f7] opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />

                    {/* Header */}
                    <div className="flex flex-col gap-3 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#a855f7]/20 to-transparent flex items-center justify-center border border-[#a855f7]/10">
                                <ImagePlus size={18} className="text-[#c08cf7]" />
                            </div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-white tracking-tight">Referência Visual</h2>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#a855f7] px-2 py-0.5 bg-[#a855f7]/10 rounded-full border border-[#a855f7]/20">
                                    Opcional
                                </span>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 font-body ml-[52px]">
                            Suba até 3 imagens de posts anteriores para manter seu design system.
                        </p>
                    </div>

                    {/* Drop Zone Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 relative z-10">
                        {SLOTS.map(({ type, label, icon: Icon }) => {
                            const image = referenceImages[type];
                            const isDragOver = dragOverSlot === type;
                            const isLoading = loadingSlot === type;
                            const error = slotErrors[type];

                            return (
                                <div key={type} className="flex flex-col gap-2">
                                    <div
                                        className={`relative aspect-[4/5] rounded-2xl overflow-hidden transition-all duration-150 cursor-pointer group ${
                                            image
                                                ? 'border border-[#a855f7]/30'
                                                : isDragOver
                                                    ? 'border-2 border-dashed border-[#a855f7]/60 bg-[#a855f7]/[0.08]'
                                                    : 'border-2 border-dashed border-[#a855f7]/25 hover:border-[#a855f7]/50 bg-[rgba(22,10,38,0.3)] hover:bg-[#a855f7]/[0.05]'
                                        }`}
                                        onDrop={(e) => handleDrop(e, type)}
                                        onDragOver={(e) => handleDragOver(e, type)}
                                        onDragLeave={handleDragLeave}
                                        onClick={() => fileInputRefs.current[type]?.click()}
                                    >
                                        <input
                                            ref={(el) => { if (el) fileInputRefs.current[type] = el; }}
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            className="hidden"
                                            onChange={(e) => handleInputChange(e, type)}
                                        />

                                        {/* Empty State */}
                                        {!image && !isLoading && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
                                                {isDragOver ? (
                                                    <Upload size={28} className="text-[#a855f7]" />
                                                ) : (
                                                    <Icon size={28} className="text-slate-500 group-hover:text-[#c08cf7] transition-colors" />
                                                )}
                                                <div>
                                                    <p className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                                                        {label}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {isDragOver ? 'Solte aqui' : 'Arraste ou clique para enviar'}
                                                    </p>
                                                </div>
                                                <p className="text-[10px] text-slate-600">
                                                    PNG, JPG ou WEBP &bull; até 5MB
                                                </p>
                                            </div>
                                        )}

                                        {/* Loading State */}
                                        {isLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-[rgba(22,10,38,0.6)]">
                                                <div className="w-8 h-8 border-2 border-[#a855f7]/30 border-t-[#a855f7] rounded-full animate-spin" />
                                            </div>
                                        )}

                                        {/* Filled State */}
                                        {image && !isLoading && (
                                            <>
                                                <img
                                                    src={image}
                                                    alt={`Referência ${label}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/90 px-2 py-1 bg-white/10 rounded-md backdrop-blur-sm">
                                                            {label}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemove(type);
                                                            }}
                                                            className="w-7 h-7 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center transition-colors cursor-pointer"
                                                        >
                                                            <X size={14} className="text-white" />
                                                        </button>
                                                    </div>
                                                    <div className="flex justify-center">
                                                        <span className="flex items-center gap-1.5 text-xs font-medium text-white/80 px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                                                            <RefreshCw size={12} />
                                                            Trocar
                                                        </span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <p className="text-xs text-red-400 font-medium animate-fade-in px-1">
                                            {error}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Info Note */}
                    <div className="flex gap-2 text-slate-500 px-1 relative z-10">
                        <Sparkles size={14} className="mt-0.5 text-slate-400 shrink-0" />
                        <p className="text-[12px] font-medium italic font-body">
                            A IA usará suas imagens como inspiração para manter o estilo visual, não como cópia exata.
                        </p>
                    </div>

                    <div className="w-full h-px bg-white/5 relative z-10" />

                    {/* Footer Controls */}
                    <div className="w-full flex justify-between items-center pt-2 relative z-10">
                        <button
                            type="button"
                            onClick={onBack}
                            className="flex items-center justify-center rounded-xl h-12 px-6 bg-transparent border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white text-sm font-bold transition-all cursor-pointer"
                        >
                            Voltar
                        </button>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onSkip}
                                className={hasAnyImage 
                                    ? "flex items-center justify-center rounded-xl h-12 px-6 bg-transparent border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white text-sm font-bold transition-all cursor-pointer"
                                    : "group flex items-center justify-center gap-2 rounded-xl h-12 px-8 bg-[#7f0df2] hover:bg-[#922cee] text-white text-base font-bold shadow-[0_0_20px_rgba(127,13,242,0.4)] hover:shadow-[0_0_30px_rgba(127,13,242,0.6)] transition-all transform hover:-translate-y-0.5 cursor-pointer animate-fade-in"}
                                style={!hasAnyImage ? { fontFamily: 'var(--font-display)' } : undefined}
                            >
                                <span>Pular</span>
                                {!hasAnyImage && <Sparkles size={18} className="text-[#dab4ff] group-hover:text-white transition-colors" />}
                            </button>
                            {hasAnyImage && (
                                <button
                                    type="button"
                                    onClick={onContinue}
                                    className="group flex items-center justify-center gap-2 rounded-xl h-12 px-8 bg-[#7f0df2] hover:bg-[#922cee] text-white text-base font-bold shadow-[0_0_20px_rgba(127,13,242,0.4)] hover:shadow-[0_0_30px_rgba(127,13,242,0.6)] transition-all transform hover:-translate-y-0.5 cursor-pointer animate-fade-in"
                                    style={{ fontFamily: 'var(--font-display)' }}
                                >
                                    <span>Continuar</span>
                                    <Sparkles size={18} className="text-[#dab4ff] group-hover:text-white transition-colors" />
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
