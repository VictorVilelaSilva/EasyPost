'use client';

import { useState } from 'react';
import { Sparkles, Layers, Terminal, RefreshCw, CheckCircle2, Loader2, Palette, Brush, Plus, X } from 'lucide-react';
import { ImageConfig as ImageConfigType } from '@/types';
import ColorPickerPopover from '@/components/ColorPickerPopover';

interface Suggestion {
    id: number;
    title: string;
    description: string;
}

const IMAGE_STYLES = [
    { id: 'esportivo', label: 'Esportivo', icon: '⚡', desc: 'Energia e dinamismo' },
    { id: 'minimalista', label: 'Minimalista', icon: '◻', desc: 'Limpo e elegante' },
    { id: 'tech', label: 'Tech', icon: '⬡', desc: 'Futurista e digital' },
    { id: 'natural', label: 'Natural', icon: '🌿', desc: 'Organico e suave' },
    { id: 'cyberpunk', label: 'Cyberpunk', icon: '◈', desc: 'Neon e distopico' },
    { id: 'profissional', label: 'Profissional', icon: '◆', desc: 'Corporativo e serio' },
];

interface Props {
    topic: string;
    fontFamily: string;
    onContinue: (config: Omit<ImageConfigType, 'visualStyle'>) => void;
    onBack: () => void;
}

export default function ImageConfigPanel({ topic, fontFamily, onContinue, onBack }: Props) {
    const [topicContext, setTopicContext] = useState(topic || '');
    const [handle, setHandle] = useState('');
    const [niche, setNiche] = useState('');
    const [selectedSuggestionId, setSelectedSuggestionId] = useState<number | null>(null);
    const [slideCount, setSlideCount] = useState(5);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

    // Palette colors (max 3)
    const [brandColors, setBrandColors] = useState<string[]>([]);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerColor, setPickerColor] = useState('#7F0DF2');

    // Image styles (max 2)
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

    const addColor = () => {
        if (brandColors.length >= 3) return;
        setBrandColors(prev => [...prev, pickerColor]);
        setPickerOpen(false);
    };

    const removeColor = (index: number) => {
        setBrandColors(prev => prev.filter((_, i) => i !== index));
    };

    const toggleStyle = (id: string) => {
        setSelectedStyles(prev => {
            if (prev.includes(id)) return prev.filter(s => s !== id);
            if (prev.length >= 2) return prev;
            return [...prev, id];
        });
    };

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
                alert(data.error || 'Falha ao gerar sugestoes');
            }
        } catch {
            alert('Erro de conexao ao gerar sugestoes');
        }
        setIsLoadingSuggestions(false);
    };

    const handleContinue = () => {
        onContinue({
            colorPalette: brandColors.length > 0 ? 'custom' : 'dark',
            brandColors: { colors: brandColors },
            audience: { age: '', interests: niche },
            customPrompt: topicContext,
            fontFamily,
            handle: handle.trim() ? (handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`) : undefined,
            slideCount,
            imageStyles: selectedStyles.length > 0 ? selectedStyles : undefined,
        });
    };

    const col1 = suggestions.slice(0, 2);
    const col2 = suggestions.slice(2, 4);
    const col3 = suggestions.slice(4, 6);

    const sectionStyle = {
        background: 'rgba(8, 5, 16, 0.5)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.05)',
    };

    const inputStyle = {
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.1)',
        fontFamily: 'var(--font-body)',
    };

    const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.currentTarget.style.borderColor = '#a855f7';
        e.currentTarget.style.boxShadow = '0 0 0 1px #a855f7';
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
        e.currentTarget.style.boxShadow = 'none';
    };

    return (
        <div className="w-full flex flex-col gap-8 mt-8 mb-8 animate-reveal" style={{ fontFamily: 'var(--font-display)' }}>

            {/* Section 1: Topic Context */}
            <section className="relative overflow-hidden rounded-xl p-8 group" style={sectionStyle}>
                <div className="absolute top-0 left-0 w-1 h-full bg-[#a855f7]/40 group-hover:bg-[#a855f7] transition-colors rounded-l-xl" />
                <div className="flex flex-col gap-7 pl-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#a855f7]/10">
                            <Terminal size={18} className="text-[#a855f7]" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Qual o tema de hoje?</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Contexto do Post</label>
                            <input
                                type="text"
                                value={topicContext}
                                onChange={(e) => setTopicContext(e.target.value)}
                                placeholder="Ex: Estrategias de Growth para SaaS 2024"
                                className="w-full h-14 px-5 rounded-lg text-slate-100 transition-all outline-none"
                                style={inputStyle}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Nicho Operacional</label>
                            <input
                                type="text"
                                value={niche}
                                onChange={(e) => setNiche(e.target.value)}
                                placeholder="Ex: Marketing Digital, Fitness, Financas..."
                                className="w-full h-14 px-5 rounded-lg text-slate-100 transition-all outline-none"
                                style={inputStyle}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Seu @usuario (opcional)</label>
                        <input
                            type="text"
                            value={handle}
                            onChange={(e) => setHandle(e.target.value)}
                            placeholder="@meuperfil"
                            className="w-full md:w-1/2 h-14 px-5 rounded-lg text-slate-100 transition-all outline-none"
                            style={inputStyle}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        />
                    </div>
                </div>
            </section>

            {/* Section 2: Paleta de Cores */}
            <section className="relative overflow-hidden rounded-xl p-8 group" style={sectionStyle}>
                <div className="absolute top-0 left-0 w-1 h-full bg-[#a855f7]/40 group-hover:bg-[#a855f7] transition-colors rounded-l-xl" />
                <div className="flex flex-col gap-6 pl-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#a855f7]/10">
                                <Palette size={18} className="text-[#a855f7]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Paleta de Cores</h2>
                                <p className="text-[11px] text-slate-500 mt-0.5">Adicione ate 3 cores para guiar a identidade visual</p>
                            </div>
                        </div>
                        {brandColors.length > 0 && (
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tight">
                                {brandColors.length}/3 cores
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        {brandColors.map((color, i) => (
                            <div key={i} className="relative group/swatch">
                                <div
                                    className="size-14 rounded-xl border-2 border-white/10 shadow-lg transition-transform hover:scale-105"
                                    style={{ background: color, boxShadow: `0 4px 20px ${color}40` }}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeColor(i)}
                                    className="absolute -top-2 -right-2 size-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/swatch:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <X size={10} />
                                </button>
                                <span className="block text-center text-[9px] font-mono text-slate-500 mt-1.5">{color}</span>
                            </div>
                        ))}

                        {brandColors.length < 3 && (
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setPickerOpen(v => !v)}
                                    className="size-14 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center text-slate-500 hover:text-white hover:border-[#a855f7]/50 transition-all cursor-pointer"
                                >
                                    <Plus size={20} />
                                </button>
                                {pickerOpen && (
                                    <ColorPickerPopover
                                        color={pickerColor}
                                        onChange={(c) => {
                                            setPickerColor(c);
                                            setBrandColors(prev => {
                                                if (prev.length >= 3) return prev;
                                                return [...prev, c];
                                            });
                                            setPickerOpen(false);
                                        }}
                                        onClose={() => setPickerOpen(false)}
                                        position="above-right"
                                    />
                                )}
                            </div>
                        )}

                        {brandColors.length === 0 && (
                            <p className="text-sm text-slate-600 italic ml-2">Nenhuma cor adicionada — a IA escolhera automaticamente</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Section 3: Estilo Visual */}
            <section className="relative overflow-hidden rounded-xl p-8 group" style={sectionStyle}>
                <div className="absolute top-0 left-0 w-1 h-full bg-[#a855f7]/40 group-hover:bg-[#a855f7] transition-colors rounded-l-xl" />
                <div className="flex flex-col gap-6 pl-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#a855f7]/10">
                                <Brush size={18} className="text-[#a855f7]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Estilo Visual</h2>
                                <p className="text-[11px] text-slate-500 mt-0.5">Selecione ate 2 estilos para combinar</p>
                            </div>
                        </div>
                        {selectedStyles.length > 0 && (
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tight">
                                {selectedStyles.length}/2 selecionados
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {IMAGE_STYLES.map(style => {
                            const isSelected = selectedStyles.includes(style.id);
                            const isDisabled = !isSelected && selectedStyles.length >= 2;
                            return (
                                <button
                                    key={style.id}
                                    type="button"
                                    onClick={() => !isDisabled && toggleStyle(style.id)}
                                    className={`relative rounded-xl p-5 text-left transition-all duration-200 cursor-pointer ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                                    style={{
                                        background: isSelected ? 'rgba(168,85,247,0.12)' : 'rgba(0,0,0,0.3)',
                                        border: isSelected ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.08)',
                                        boxShadow: isSelected ? '0 0 20px rgba(168,85,247,0.2)' : 'none',
                                    }}
                                >
                                    {isSelected && (
                                        <div className="absolute top-3 right-3 size-5 rounded-full bg-[#a855f7] flex items-center justify-center">
                                            <CheckCircle2 size={12} className="text-white" />
                                        </div>
                                    )}
                                    <span className="text-2xl mb-2 block">{style.icon}</span>
                                    <span className="text-sm font-bold text-white block">{style.label}</span>
                                    <span className="text-[11px] text-slate-500 block mt-0.5">{style.desc}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Section 4: AI Suggestions */}
            <section className="flex flex-col gap-5">
                <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-3">
                        <Sparkles size={18} className="text-[#a855f7]" />
                        <h2 className="text-xl font-bold text-white">Sugestoes da IA</h2>
                    </div>
                    <button
                        type="button"
                        onClick={handleGenerateSuggestions}
                        disabled={!niche.trim() || isLoadingSuggestions}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#a855f7]/10"
                        style={{ color: '#a855f7', border: '1px solid rgba(168,85,247,0.3)' }}
                    >
                        {isLoadingSuggestions
                            ? <Loader2 size={14} className="animate-spin" />
                            : <RefreshCw size={14} />
                        }
                        {isLoadingSuggestions ? 'Buscando...' : suggestions.length > 0 ? 'Recalcular' : 'Gerar Sugestoes'}
                    </button>
                </div>

                {isLoadingSuggestions && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="rounded-xl p-6 animate-pulse"
                                style={{ background: 'rgba(8,5,16,0.5)', border: '1px solid rgba(255,255,255,0.05)', minHeight: '110px' }}
                            >
                                <div className="h-4 w-2/3 rounded mb-3" style={{ background: 'rgba(168,85,247,0.15)' }} />
                                <div className="h-3 w-full rounded mb-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
                                <div className="h-3 w-4/5 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
                            </div>
                        ))}
                    </div>
                )}

                {!isLoadingSuggestions && suggestions.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                        {[col1, col2, col3].map((col, colIdx) => (
                            <div key={colIdx} className="flex flex-col gap-5">
                                {col.map((suggestion) => {
                                    const isSelected = selectedSuggestionId === suggestion.id;
                                    return (
                                        <div
                                            key={suggestion.id}
                                            onClick={() => {
                                                setSelectedSuggestionId(suggestion.id);
                                                setTopicContext(suggestion.title);
                                            }}
                                            className="relative rounded-xl p-6 cursor-pointer transition-all duration-300"
                                            style={{
                                                background: isSelected ? 'rgba(168,85,247,0.1)' : 'rgba(8, 5, 16, 0.5)',
                                                backdropFilter: 'blur(12px)',
                                                border: isSelected ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.05)',
                                                minHeight: '110px',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isSelected) e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                            }}
                                        >
                                            {isSelected && (
                                                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#a855f7] flex items-center justify-center">
                                                    <CheckCircle2 size={14} className="text-white" />
                                                </div>
                                            )}
                                            <h3 className="text-base font-bold text-white mb-2">{suggestion.title}</h3>
                                            <p className="text-sm leading-relaxed" style={{ color: isSelected ? 'rgba(255,255,255,0.7)' : 'rgba(148,163,184,1)' }}>
                                                {suggestion.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Section 5: Slide Count */}
            <section className="relative overflow-hidden rounded-xl p-8 group" style={sectionStyle}>
                <div className="absolute top-0 left-0 w-1 h-full bg-[#a855f7]/40 group-hover:bg-[#a855f7] transition-colors rounded-l-xl" />
                <div className="flex flex-col gap-8 pl-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#a855f7]/10">
                                <Layers size={18} className="text-[#a855f7]" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Estrutura de Blocos</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tight">Config Atual:</span>
                            <span
                                className="text-sm font-black text-white px-4 py-1 rounded-md"
                                style={{ background: '#a855f7', boxShadow: '0 0 15px rgba(168,85,247,0.4)' }}
                            >
                                {String(slideCount).padStart(2, '0')} SLIDES
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 px-1">
                        <div className="flex justify-between w-full">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                <span
                                    key={n}
                                    className="text-xs font-mono transition-all duration-300"
                                    style={{
                                        color: n === slideCount ? '#a855f7' : 'rgba(100,116,139,0.6)',
                                        fontWeight: n === slideCount ? 700 : 400,
                                        transform: n === slideCount ? 'scale(1.2)' : 'scale(1)',
                                        textShadow: n === slideCount ? '0 0 10px rgba(168,85,247,0.5)' : 'none',
                                        display: 'inline-block',
                                    }}
                                >
                                    {String(n).padStart(2, '0')}
                                </span>
                            ))}
                        </div>
                        <input
                            type="range"
                            min={1}
                            max={10}
                            value={slideCount}
                            onChange={(e) => setSlideCount(Number(e.target.value))}
                            className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none"
                            style={{
                                background: `linear-gradient(to right, #a855f7 ${(slideCount - 1) / 9 * 100}%, rgba(255,255,255,0.1) ${(slideCount - 1) / 9 * 100}%)`,
                            }}
                        />
                        <div className="flex items-center justify-center gap-2 text-slate-500">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                            <p className="text-[13px] font-medium italic">
                                O algoritmo segmentara o conteudo em {slideCount} frames otimizados para engajamento.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <div className="w-full flex justify-between items-center border-t border-white/10 pt-8 mt-2">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center justify-center rounded-xl h-12 px-6 bg-transparent text-slate-400 hover:text-white text-base font-bold transition-colors cursor-pointer"
                >
                    Voltar
                </button>
                <button
                    type="button"
                    onClick={handleContinue}
                    className="flex items-center justify-center gap-2 rounded-xl h-12 px-8 bg-[#7f0df2] hover:bg-[#922cee] text-white text-base font-bold shadow-[0_0_20px_rgba(127,13,242,0.4)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
                    style={{ fontFamily: 'var(--font-display)' }}
                >
                    Proximo Passo
                    <Sparkles size={18} />
                </button>
            </div>

            <style>{`
                input[type='range']::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    background: #a855f7;
                    cursor: pointer;
                    border-radius: 50%;
                    border: 3px solid #ffffff;
                    box-shadow: 0 0 15px rgba(168, 85, 247, 0.6);
                }
                input[type='range']::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    background: #a855f7;
                    cursor: pointer;
                    border-radius: 50%;
                    border: 3px solid #ffffff;
                    box-shadow: 0 0 15px rgba(168, 85, 247, 0.6);
                }
            `}</style>
        </div>
    );
}
