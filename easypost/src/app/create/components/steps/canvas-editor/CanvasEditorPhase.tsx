'use client';

import { Sparkles, Download, ArrowLeft, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, SlidersHorizontal, Eye } from 'lucide-react';
import { CanvasEditorProps } from './types';
import { CANVAS_W, CANVAS_H_INSTAGRAM, CANVAS_H_LINKEDIN } from './constants';
import { DraggableTextBlock } from './DraggableTextBlock';
import { PropertiesPanel } from './PropertiesPanel';
import { useCanvasLogic } from './useCanvasLogic';

export function CanvasEditorPhase({ slides, platform, caption, onUpdateSlide, onBack, onGoToPreview, onFusedImagesChange }: CanvasEditorProps) {
    const canvasH = platform === 'instagram' ? CANVAS_H_INSTAGRAM : CANVAS_H_LINKEDIN;

    const {
        activeSlide,
        setActiveSlide,
        selectedBlockId,
        setSelectedBlockId,
        selectedBlock,
        isFusing,
        fusedImages,
        isDownloading,
        allFused,
        aiMode,
        setAiMode,
        canvasRef,
        updateBlock,
        handleDragStart,
        handleFuseAll,
        handleDownload,
        currentSlide,
    } = useCanvasLogic(slides, platform, caption, onUpdateSlide, onFusedImagesChange);

    const slideTypeLabels: Record<string, string> = { cover: 'Capa', content: 'Conteudo', cta: 'CTA' };

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
                        EasyPost <span className="text-slate-500 font-normal text-sm ml-1 uppercase tracking-widest">Editor</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    {/* Slide type tabs */}
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-full px-1 py-1">
                        {(['cover', 'content', 'cta'] as const).map(type => {
                            const isActive = currentSlide?.slideType === type;
                            return (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => {
                                        const idx = slides.findIndex(s => s.slideType === type);
                                        if (idx >= 0) { setActiveSlide(idx); setSelectedBlockId(null); }
                                    }}
                                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${isActive ? 'bg-[#7f0df2] text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    {slideTypeLabels[type]}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* ─── MAIN (3 columns) ─── */}
            <main className="flex flex-1 overflow-hidden">
                {/* LEFT SIDEBAR — Slides */}
                <aside
                    className="w-[220px] flex flex-col p-5 z-40 shrink-0"
                    style={{ background: 'rgba(22,16,29,0.6)', backdropFilter: 'blur(16px)', borderRight: '1px solid rgba(127,13,242,0.1)' }}
                >
                    <h3 className="text-[11px] font-bold tracking-[0.25em] text-slate-500 uppercase mb-6">Slides</h3>
                    <div className="flex flex-col gap-5 overflow-y-auto pr-2 flex-1 custom-scrollbar">
                        {slides.map((s, i) => {
                            const isActive = activeSlide === i;
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => { setActiveSlide(i); setSelectedBlockId(null); }}
                                    className="relative group cursor-pointer text-left"
                                >
                                    <div
                                        className={`aspect-[4/5] w-full rounded-xl overflow-hidden bg-slate-900 transition-all duration-300 ${isActive ? '' : 'opacity-50 hover:opacity-100'}`}
                                        style={{
                                            border: isActive ? '2px solid #7f0df2' : '1px solid rgba(255,255,255,0.1)',
                                            boxShadow: isActive ? '0 0 15px rgba(127,13,242,0.6)' : 'none',
                                        }}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={fusedImages[i] ?? `data:image/png;base64,${s.backgroundBase64}`}
                                            alt={`Slide ${i + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <span
                                        className="absolute -top-2 -left-2 size-6 text-[10px] font-bold flex items-center justify-center rounded-lg shadow-lg"
                                        style={{
                                            background: isActive ? '#7f0df2' : 'rgb(30,25,42)',
                                            border: isActive ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                            color: '#fff',
                                        }}
                                    >
                                        {i + 1}
                                    </span>
                                    {fusedImages[i] && (
                                        <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-green-500 border border-green-400" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </aside>

                {/* CENTER — Canvas */}
                <section className="flex-1 flex flex-col relative" style={{
                    backgroundColor: '#0a0614',
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(127,13,242,0.08) 1px, transparent 0)',
                    backgroundSize: '32px 32px',
                }}>
                    {/* Canvas toolbar */}
                    <div className="w-full flex items-center justify-between px-8 py-4 bg-[#0a0614]/40 backdrop-blur-sm border-b border-white/5 shrink-0">
                        <h2 className="text-sm font-semibold text-slate-300" style={{ fontFamily: 'var(--font-display)' }}>
                            Slide {activeSlide + 1} — {slideTypeLabels[currentSlide?.slideType ?? 'cover']}
                        </h2>
                    </div>

                    {/* Canvas */}
                    <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
                        {platform === 'instagram' ? (
                            /* Instagram phone mockup */
                            <div className="shrink-0 bg-black/50 rounded-[24px] p-4 border border-white/10 shadow-2xl" style={{ width: CANVAS_W + 32, maxHeight: 'calc(100vh - 200px)' }}>
                                {/* Profile header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[2px]">
                                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                                <span className="text-[9px] text-purple-300 font-bold">IA</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white leading-none mb-0.5" style={{ fontFamily: 'var(--font-display)' }}>seu_perfil</p>
                                            <p className="text-[9px] text-slate-500 leading-none">Original Audio</p>
                                        </div>
                                    </div>
                                    <MoreHorizontal size={16} className="text-slate-400" />
                                </div>

                                {/* Canvas inside mockup */}
                                <div
                                    ref={canvasRef}
                                    onClick={() => setSelectedBlockId(null)}
                                    className="relative bg-slate-950 rounded-xl overflow-hidden"
                                    style={{
                                        width: CANVAS_W,
                                        aspectRatio: '4/5',
                                    }}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={`data:image/png;base64,${currentSlide?.backgroundBase64}`}
                                        alt="fundo"
                                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    {currentSlide?.textBlocks.map(block => (
                                        <DraggableTextBlock
                                            key={block.id}
                                            block={block}
                                            isSelected={selectedBlockId === block.id}
                                            canvasH={canvasH}
                                            onSelect={() => setSelectedBlockId(block.id)}
                                            onDragStart={handleDragStart}
                                        />
                                    ))}
                                </div>

                                {/* Engagement bar */}
                                <div className="mt-3 px-1 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Heart size={18} className="text-white" />
                                        <MessageCircle size={18} className="text-white" />
                                        <Send size={18} className="text-white" />
                                    </div>
                                    <Bookmark size={18} className="text-white" />
                                </div>
                            </div>
                        ) : (
                            /* LinkedIn / default — canvas without mockup */
                            <div
                                ref={canvasRef}
                                onClick={() => setSelectedBlockId(null)}
                                className="relative bg-slate-950 rounded-sm overflow-hidden shrink-0"
                                style={{
                                    width: CANVAS_W,
                                    aspectRatio: '1/1',
                                    maxHeight: 'calc(100vh - 240px)',
                                    boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
                                }}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={`data:image/png;base64,${currentSlide?.backgroundBase64}`}
                                    alt="fundo"
                                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                {currentSlide?.textBlocks.map(block => (
                                    <DraggableTextBlock
                                        key={block.id}
                                        block={block}
                                        isSelected={selectedBlockId === block.id}
                                        canvasH={canvasH}
                                        onSelect={() => setSelectedBlockId(block.id)}
                                        onDragStart={handleDragStart}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* RIGHT SIDEBAR — Properties */}
                <aside
                    className="w-[280px] flex flex-col z-40 overflow-y-auto custom-scrollbar shrink-0"
                    style={{ background: 'rgba(22,16,29,0.6)', backdropFilter: 'blur(16px)', borderLeft: '1px solid rgba(127,13,242,0.1)' }}
                >
                    {aiMode === 'auto' && (
                        <div className="mx-4 mt-4 px-3 py-2.5 rounded-xl bg-[#7f0df2]/10 border border-[#7f0df2]/20">
                            <p className="text-[11px] text-purple-300 leading-relaxed">
                                <Sparkles size={12} className="inline mr-1.5 -mt-0.5" />
                                A IA vai decidir o melhor estilo visual para o texto
                            </p>
                        </div>
                    )}
                    <PropertiesPanel block={selectedBlock} onChange={updateBlock} />
                </aside>
            </main>

            {/* ─── FOOTER ─── */}
            <footer className="h-20 border-t border-white/5 bg-[#0a0614]/90 backdrop-blur-md px-10 flex items-center justify-between z-50 shrink-0">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-semibold cursor-pointer"
                >
                    <ArrowLeft size={16} />
                    Voltar
                </button>

                {/* Mini slide strip */}
                <div className="flex items-center gap-2 px-6">
                    <div className="flex gap-2 p-1.5 bg-white/5 rounded-xl border border-white/5">
                        {slides.map((s, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => { setActiveSlide(i); setSelectedBlockId(null); }}
                                className="size-11 rounded-lg overflow-hidden cursor-pointer transition-all"
                                style={{
                                    border: activeSlide === i ? '2px solid rgba(127,13,242,0.5)' : '1px solid rgba(255,255,255,0.1)',
                                    opacity: activeSlide === i ? 1 : 0.5,
                                }}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={fusedImages[i] ?? `data:image/png;base64,${s.backgroundBase64}`}
                                    alt={`Slide ${i + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Toggle IA Criativa / Meu Estilo */}
                    <button
                        type="button"
                        onClick={() => setAiMode(prev => prev === 'auto' ? 'manual' : 'auto')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border"
                        style={{
                            background: aiMode === 'auto' ? 'rgba(127,13,242,0.15)' : 'rgba(255,255,255,0.05)',
                            borderColor: aiMode === 'auto' ? 'rgba(127,13,242,0.3)' : 'rgba(255,255,255,0.1)',
                            color: aiMode === 'auto' ? '#c084fc' : '#94a3b8',
                        }}
                    >
                        {aiMode === 'auto' ? <Sparkles size={14} /> : <SlidersHorizontal size={14} />}
                        {aiMode === 'auto' ? 'IA Criativa' : 'Meu Estilo'}
                    </button>

                    {allFused && (
                        <>
                            <button
                                type="button"
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-white/8 border border-white/15 hover:bg-white/12 transition-all cursor-pointer"
                            >
                                <Download size={16} />
                                {isDownloading ? 'Baixando...' : 'Baixar'}
                            </button>
                            {onGoToPreview && (
                                <button
                                    type="button"
                                    onClick={() => onGoToPreview(fusedImages.filter(Boolean) as string[])}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-[#7f0df2]/80 border border-[#7f0df2]/40 hover:bg-[#7f0df2] transition-all cursor-pointer"
                                    style={{ boxShadow: '0 0 15px rgba(127,13,242,0.3)' }}
                                >
                                    <Eye size={16} />
                                    Ver Preview
                                </button>
                            )}
                        </>
                    )}
                    <button
                        type="button"
                        onClick={handleFuseAll}
                        disabled={isFusing}
                        className="flex items-center gap-3 px-10 py-3.5 rounded-2xl bg-[#7f0df2] hover:bg-[#7f0df2]/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                        style={{
                            fontFamily: 'var(--font-display)',
                            boxShadow: '0 0 20px rgba(127,13,242,0.4)',
                        }}
                    >
                        {isFusing ? (
                            <>
                                <span className="animate-spin">&#x27F3;</span>
                                Fundindo...
                            </>
                        ) : (
                            <>
                                Fundir com IA
                                <Sparkles size={18} />
                            </>
                        )}
                    </button>
                </div>
            </footer>

            {/* Global scrollbar styles */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(127,13,242,0.3); border-radius: 10px; }
            `}</style>
        </div>
    );
}
