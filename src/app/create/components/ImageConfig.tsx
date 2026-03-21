'use client';

import { useState } from 'react';
import { Sparkles, Layers, Terminal, CheckCircle2, Loader2, Wand2, Palette, Hash, AlignLeft, List } from 'lucide-react';
import { ImageConfig as ImageConfigType } from '@/types';
import { toast } from 'sonner';

interface Suggestion {
    id: number;
    title: string;
    description: string;
}

interface Props {
    topic: string;
    onContinue: (config: ImageConfigType) => void;
    onBack: () => void;
}

export default function ImageConfigPanel({ topic, onContinue, onBack }: Props) {
    const [topicContext, setTopicContext] = useState(topic || '');
    const [handle, setHandle] = useState('');
    const [niche, setNiche] = useState('');
    const [selectedSuggestionId, setSelectedSuggestionId] = useState<number | null>(null);
    const [slideCount, setSlideCount] = useState(5);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [color, setColor] = useState('#7f0df2');
    const [useCustomColor, setUseCustomColor] = useState(false);
    const [textFormat, setTextFormat] = useState<'continuous' | 'topics' | null>(null);

    const colorPresets = [
        { name: 'Roxo Easy', hex: '#7f0df2' },
        { name: 'Ciano Cyber', hex: '#00f2ff' },
        { name: 'Rosa Neon', hex: '#ff007a' },
        { name: 'Verde Mint', hex: '#00ffa3' },
        { name: 'Ouro Real', hex: '#ffd700' },
        { name: 'Branco Puro', hex: '#FFFFFF' },
    ];

    const handleGenerateSuggestions = async () => {
        if (!niche.trim()) return;
        setIsLoadingSuggestions(true);
        setSelectedSuggestionId(null);
        try {
            const res = await fetch('/api/generate-suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ niche }),
            });
            const data = await res.json();
            if (data.suggestions) {
                setSuggestions(data.suggestions);
            } else {
                toast.error(data.error || 'Falha ao gerar sugestões');
            }
        } catch {
            toast.error('Erro de conexão ao gerar sugestões');
        }
        setIsLoadingSuggestions(false);
    };

    const handleContinue = () => {
        onContinue({
            audience: { age: '', interests: niche },
            customPrompt: topicContext,
            handle: handle.trim() ? (handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`) : undefined,
            slideCount,
            color: useCustomColor ? color : undefined,
            textFormat: textFormat || undefined,
        });
    };

    const isValid = topicContext.trim().length > 0 && niche.trim().length > 0;

    // UI Styles
    const containerStyle = {
        background: 'rgba(22, 10, 38, 0.7)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(168, 85, 247, 0.12)',
        boxShadow: '0 8px 40px rgba(127, 13, 242, 0.08), 0 2px 16px rgba(0,0,0,0.3)'
    };

    const inputStyle = {
        background: 'rgba(15, 8, 28, 0.6)',
        border: '1px solid rgba(168, 85, 247, 0.08)',
        fontFamily: 'var(--font-body)',
    };

    const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.currentTarget.style.background = 'rgba(25, 12, 42, 0.8)';
        e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)';
        e.currentTarget.style.boxShadow = '0 0 15px rgba(168, 85, 247, 0.1)';
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.currentTarget.style.background = 'rgba(15, 8, 28, 0.6)';
        e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.08)';
        e.currentTarget.style.boxShadow = 'none';
    };

    return (
        <div className="w-full flex justify-center mt-2 animate-fade-in font-display">
            <div className="w-full max-w-[840px] flex flex-col gap-6">

                <section className="relative overflow-hidden rounded-[24px] p-6 sm:p-8 flex flex-col gap-8" style={containerStyle}>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#a855f7] opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />
                    
                    {/* Intelligence Feed (Grouped Inputs) */}
                    <div className="flex flex-col gap-6 relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#a855f7]/20 to-transparent flex items-center justify-center border border-[#a855f7]/10">
                                <Terminal size={18} className="text-[#c08cf7]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Intelligence Feed</h2>
                                <p className="text-xs text-slate-400 font-body">Defina as diretrizes para a IA</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-5">
                            {/* Nicho e Contexto lado a lado em desktop, empilhados em mobile */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest font-mono text-slate-400 ml-1">
                                        Nicho Operacional <span className="text-[#a855f7]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={niche}
                                        onChange={(e) => setNiche(e.target.value)}
                                        placeholder="Ex: Marketing Digital, Fitness..."
                                        className="w-full h-12 px-4 rounded-xl text-slate-100 placeholder:text-slate-600 transition-all outline-none text-sm"
                                        style={inputStyle}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-end">
                                        <label className="text-[11px] font-bold uppercase tracking-widest font-mono text-slate-400 ml-1">
                                            Seu @usuario
                                        </label>
                                        <span className="text-[9px] uppercase tracking-wider text-slate-600 mr-1">Opcional</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={handle}
                                        onChange={(e) => setHandle(e.target.value)}
                                        placeholder="@meuperfil"
                                        className="w-full h-12 px-4 rounded-xl text-slate-100 placeholder:text-slate-600 transition-all outline-none text-sm"
                                        style={inputStyle}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 relative">
                                <div className="flex justify-between items-end">
                                    <label className="text-[11px] font-bold uppercase tracking-widest font-mono text-slate-400 ml-1">
                                        O que você quer compartilhar? <span className="text-[#a855f7]">*</span>
                                    </label>
                                </div>
                                <div className="relative group/textarea">
                                    <textarea
                                        value={topicContext}
                                        onChange={(e) => setTopicContext(e.target.value)}
                                        placeholder="Descreva o assunto principal do seu carrossel aqui..."
                                        className="w-full min-h-[120px] p-4 pb-16 rounded-xl text-slate-100 placeholder:text-slate-600 transition-all outline-none text-sm resize-none"
                                        style={inputStyle}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                    
                                    {/* Magical Ghost Button inside Textarea Container */}
                                    <div className="absolute bottom-3 right-3 z-10">
                                        <button
                                            type="button"
                                            onClick={handleGenerateSuggestions}
                                            disabled={!niche.trim() || isLoadingSuggestions}
                                            className="group/btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none bg-[#7f0df2]/20 hover:bg-[#7f0df2]/40 border border-[#a855f7]/40 hover:border-[#a855f7] shadow-[0_0_15px_rgba(127,13,242,0.3)] hover:shadow-[0_0_25px_rgba(127,13,242,0.5)] backdrop-blur-md"
                                        >
                                            {isLoadingSuggestions ? (
                                                <Loader2 size={16} className="animate-spin text-[#dab4ff]" />
                                            ) : (
                                                <Wand2 size={16} className="text-[#dab4ff] group-hover/btn:text-white transition-colors" />
                                            )}
                                            <span className="text-[#dab4ff] group-hover/btn:text-white transition-colors drop-shadow-md">
                                                {isLoadingSuggestions ? 'Pensando...' : suggestions.length > 0 ? 'Gerar Novas Ideias' : 'Gerar Ideias por IA'}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* AI Suggestions List */}
                                {(isLoadingSuggestions || suggestions.length > 0) && (
                                    <div className="mt-3 flex flex-col gap-2 animate-fade-in-up">
                                        <div className="flex items-center gap-2 mb-1 ml-1 opacity-80">
                                            <Sparkles size={12} className="text-[#a855f7]" />
                                            <span className="text-[10px] font-mono text-[#c08cf7] uppercase tracking-widest">Sugestões de Tópicos</span>
                                        </div>
                                        
                                        {isLoadingSuggestions && (
                                            <div className="flex flex-col gap-2">
                                                {[1, 2, 3].map((n) => (
                                                    <div key={n} className="h-16 w-full rounded-xl animate-pulse bg-linear-to-r from-white/5 to-white/10" />
                                                ))}
                                            </div>
                                        )}

                                        {!isLoadingSuggestions && suggestions.length > 0 && (
                                            <div className="flex flex-col gap-2">
                                                {suggestions.map((suggestion) => {
                                                    const isSelected = selectedSuggestionId === suggestion.id;
                                                    return (
                                                        <div
                                                            key={suggestion.id}
                                                            onClick={() => {
                                                                setSelectedSuggestionId(suggestion.id);
                                                                setTopicContext(suggestion.title);
                                                            }}
                                                            className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-300 flex items-center justify-between border ${
                                                                isSelected 
                                                                    ? 'bg-[#a855f7]/10 border-[#a855f7] shadow-[inset_0_0_20px_rgba(168,85,247,0.1)]' 
                                                                    : 'bg-white/5 border-white/5 hover:border-white/15 hover:bg-white/10'
                                                            }`}
                                                        >
                                                            <div className="flex flex-col pr-8">
                                                                <h4 className={`text-sm font-bold mb-0.5 ${isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                                                                    {suggestion.title}
                                                                </h4>
                                                                <p className="text-xs text-slate-500 line-clamp-1">
                                                                    {suggestion.description}
                                                                </p>
                                                            </div>
                                                            {isSelected && (
                                                                <div className="absolute right-4 w-5 h-5 rounded-full bg-[#a855f7] flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-scale-in">
                                                                    <CheckCircle2 size={12} className="text-white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-white/5 relative z-10" />

                    {/* Structure / Slider Section */}
                    <div className="flex flex-col gap-6 relative z-10">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#a855f7]/20 to-transparent flex items-center justify-center border border-[#a855f7]/10">
                                    <Layers size={18} className="text-[#c08cf7]" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white tracking-tight">Tamanho do Carrossel</h2>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:inline-block">Volume:</span>
                                <div className="px-3 py-1.5 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/30 flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                                    <span className="text-sm font-black text-[#dab4ff]">{String(slideCount).padStart(2, '0')}</span>
                                    <span className="text-[10px] font-bold text-[#c08cf7] uppercase">Slides</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6 pt-2">
                            <div className="relative flex flex-col gap-4">
                                {/* Labels 1–10 */}
                                <div className="flex justify-between px-[2px]">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                        <span
                                            key={n}
                                            onClick={() => setSlideCount(n)}
                                            className={`text-[10px] font-mono cursor-pointer transition-all duration-200 select-none ${n === slideCount ? 'text-[#dab4ff] font-bold' : 'text-slate-600 hover:text-slate-400'}`}
                                        >
                                            {n}
                                        </span>
                                    ))}
                                </div>

                                {/* Slider track + thumb */}
                                <div className="relative flex items-center">
                                    {/* Track fill */}
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[4px] rounded-full bg-white/8 w-full pointer-events-none" />
                                    <div
                                        className="absolute left-0 top-1/2 -translate-y-1/2 h-[4px] rounded-full pointer-events-none transition-all duration-150"
                                        style={{
                                            width: `${((slideCount - 1) / 9) * 100}%`,
                                            background: 'linear-gradient(to right, #7f0df2, #c08cf7)',
                                        }}
                                    />
                                    <input
                                        type="range"
                                        min={1}
                                        max={10}
                                        value={slideCount}
                                        onChange={(e) => setSlideCount(Number(e.target.value))}
                                        className="ep-slider relative z-10"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 text-slate-500 mt-2 px-1">
                                <Sparkles size={14} className="mt-0.5 text-slate-400" />
                                <p className="text-[12px] font-medium italic">
                                    O algoritmo segmentará seu conteúdo em {slideCount} frames visuais para reter a atenção e impulsionar compartilhamentos.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-white/5 relative z-10" />

                    {/* Visual Identity Section */}
                    <div className="flex flex-col gap-6 relative z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#a855f7]/20 to-transparent flex items-center justify-center border border-[#a855f7]/10">
                                    <Palette size={18} className="text-[#c08cf7]" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white tracking-tight">Identidade Visual</h2>
                                    <p className="text-xs text-slate-400 font-body">Defina a cor base para a sua marca</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setUseCustomColor(!useCustomColor)}
                                className={`relative w-12 h-6 rounded-full transition-all duration-300 cursor-pointer ${
                                    useCustomColor
                                        ? 'bg-[#7f0df2] shadow-[0_0_12px_rgba(127,13,242,0.4)]'
                                        : 'bg-white/10'
                                }`}
                            >
                                <div
                                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${
                                        useCustomColor ? 'left-[26px]' : 'left-0.5'
                                    }`}
                                />
                            </button>
                        </div>

                        {useCustomColor && (
                            <>
                                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                                    {/* Color Picker & Hex Input */}
                                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5 w-full sm:w-auto">
                                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 shadow-inner group/color">
                                            <input
                                                type="color"
                                                value={color}
                                                onChange={(e) => setColor(e.target.value)}
                                                className="absolute -inset-2 w-[150%] h-[150%] cursor-pointer bg-transparent border-none p-0"
                                            />
                                            <div
                                                className="absolute inset-0 pointer-events-none transition-transform group-hover/color:scale-110"
                                                style={{ backgroundColor: color }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">Cor Principal</span>
                                            <div className="relative">
                                                <Hash size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                                <input
                                                    type="text"
                                                    value={color.replace('#', '')}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val.length <= 6) {
                                                            setColor(`#${val.toUpperCase()}`);
                                                        }
                                                    }}
                                                    className="bg-transparent border-none text-sm font-mono text-slate-200 focus:outline-none w-24 pl-7"
                                                    maxLength={6}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Presets */}
                                    <div className="flex flex-wrap gap-2">
                                        {colorPresets.map((preset) => (
                                            <button
                                                key={preset.hex}
                                                onClick={() => setColor(preset.hex)}
                                                title={preset.name}
                                                className={`w-8 h-8 rounded-lg border transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                                                    color.toUpperCase() === preset.hex.toUpperCase()
                                                        ? 'border-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.3)]'
                                                        : 'border-white/10 hover:border-white/30'
                                                }`}
                                                style={{ backgroundColor: preset.hex }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2 text-slate-500 mt-1 px-1">
                                    <Sparkles size={14} className="mt-0.5 text-slate-400" />
                                    <p className="text-[12px] font-medium italic">
                                        Esta cor será a base para fundos, tipografia e elementos de destaque em todos os slides.
                                    </p>
                                </div>
                            </>
                        )}

                        {!useCustomColor && (
                            <p className="text-xs text-slate-500 italic font-body">
                                A IA escolherá as cores automaticamente com base no tema do conteúdo.
                            </p>
                        )}
                    </div>

                    <div className="w-full h-px bg-white/5 relative z-10" />

                    {/* Text Format Section */}
                    <div className="flex flex-col gap-6 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#a855f7]/20 to-transparent flex items-center justify-center border border-[#a855f7]/10">
                                <AlignLeft size={18} className="text-[#c08cf7]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Formato do Texto</h2>
                                <p className="text-xs text-slate-400 font-body">Como o conteúdo dos slides deve ser apresentado</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setTextFormat(textFormat === 'continuous' ? null : 'continuous')}
                                className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer text-left ${
                                    textFormat === 'continuous'
                                        ? 'bg-[#a855f7]/10 border-[#a855f7] shadow-[inset_0_0_20px_rgba(168,85,247,0.1)]'
                                        : 'bg-white/5 border-white/5 hover:border-white/15 hover:bg-white/10'
                                }`}
                            >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                    textFormat === 'continuous' ? 'bg-[#a855f7]/20' : 'bg-white/5'
                                }`}>
                                    <AlignLeft size={16} className={textFormat === 'continuous' ? 'text-[#dab4ff]' : 'text-slate-400'} />
                                </div>
                                <div>
                                    <h4 className={`text-sm font-bold ${textFormat === 'continuous' ? 'text-white' : 'text-slate-200'}`}>
                                        Texto Corrido
                                    </h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Parágrafos fluidos e narrativos</p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setTextFormat(textFormat === 'topics' ? null : 'topics')}
                                className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer text-left ${
                                    textFormat === 'topics'
                                        ? 'bg-[#a855f7]/10 border-[#a855f7] shadow-[inset_0_0_20px_rgba(168,85,247,0.1)]'
                                        : 'bg-white/5 border-white/5 hover:border-white/15 hover:bg-white/10'
                                }`}
                            >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                    textFormat === 'topics' ? 'bg-[#a855f7]/20' : 'bg-white/5'
                                }`}>
                                    <List size={16} className={textFormat === 'topics' ? 'text-[#dab4ff]' : 'text-slate-400'} />
                                </div>
                                <div>
                                    <h4 className={`text-sm font-bold ${textFormat === 'topics' ? 'text-white' : 'text-slate-200'}`}>
                                        Tópicos
                                    </h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Bullet points objetivos e escaneáveis</p>
                                </div>
                            </button>
                        </div>

                        {!textFormat && (
                            <p className="text-xs text-slate-500 italic font-body">
                                A IA escolherá o melhor formato automaticamente com base no conteúdo.
                            </p>
                        )}
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
                    <button
                        type="button"
                        onClick={handleContinue}
                        disabled={!isValid}
                        className="group flex items-center justify-center gap-2 rounded-xl h-12 px-8 bg-[#7f0df2] hover:bg-[#922cee] disabled:opacity-40 disabled:hover:bg-[#7f0df2] disabled:cursor-not-allowed text-white text-base font-bold shadow-[0_0_20px_rgba(127,13,242,0.4)] hover:shadow-[0_0_30px_rgba(127,13,242,0.6)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
                        style={{ fontFamily: 'var(--font-display)' }}
                    >
                        <span>Gerar Carrossel</span>
                        <Sparkles size={18} className="text-[#dab4ff] group-hover:text-white transition-colors" />
                    </button>
                </div>
                </section>

            </div>
        </div>
    );
}
