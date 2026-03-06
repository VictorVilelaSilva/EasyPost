'use client';

import { useState } from 'react';
import { Sparkles, Layers, Terminal, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ImageConfig as ImageConfigType } from '@/types';

const NICHE_OPTIONS = [
    { value: 'saude', label: 'Saúde & Bem-estar' },
    { value: 'tecnologia', label: 'Tecnologia' },
    { value: 'financas', label: 'Finanças' },
    { value: 'marketing', label: 'Marketing Digital' },
    { value: 'educacao', label: 'Educação' },
    { value: 'empreendedorismo', label: 'Empreendedorismo' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'fitness', label: 'Fitness & Esporte' },
];

const ALL_SUGGESTIONS = [
    { id: 1, title: 'Mitos do Setor', description: 'Uma análise técnica sobre falácias comuns e como evitá-las no cotidiano.' },
    { id: 2, title: 'Guia Rápido', description: 'Protocolos eficientes para resultados de performance consistentes.' },
    { id: 3, title: '5 Erros Comuns', description: 'Pequenos deslizes que sabotam os resultados de longo prazo.' },
    { id: 4, title: 'Tendências 2024', description: 'O que a ciência moderna diz sobre otimização e alto desempenho.' },
    { id: 5, title: 'Leitura de Dados', description: 'Decodificando as métricas que realmente importam para o seu nicho.' },
    { id: 6, title: 'Fundamentos Sólidos', description: 'A base que poucos dominam e o impacto direto nos seus resultados.' },
    { id: 7, title: 'Case de Sucesso', description: 'Como os maiores nomes do setor chegaram onde estão hoje.' },
    { id: 8, title: 'Desmistificando', description: 'Quebrando os mitos mais populares com dados e evidências concretas.' },
    { id: 9, title: 'Estratégia Avançada', description: 'Técnicas utilizadas por profissionais de alto nível para escalar resultados.' },
    { id: 10, title: 'Futuro do Setor', description: 'O que esperar dos próximos anos e como se posicionar com antecedência.' },
    { id: 11, title: 'Primeiros Passos', description: 'O caminho mais direto para quem está começando do zero agora.' },
    { id: 12, title: 'Produtividade Real', description: 'Sistemas práticos que eliminam o ruído e geram tração de verdade.' },
];

interface Props {
    topic: string;
    fontFamily: string;
    onContinue: (config: Omit<ImageConfigType, 'visualStyle'>) => void;
    onBack: () => void;
}

export default function ImageConfigPanel({ topic, fontFamily, onContinue, onBack }: Props) {
    const [topicContext, setTopicContext] = useState(topic || '');
    const [niche, setNiche] = useState('saude');
    const [selectedSuggestionId, setSelectedSuggestionId] = useState(1);
    const [slideCount, setSlideCount] = useState(5);
    const [suggestionSet, setSuggestionSet] = useState(0);

    const visibleSuggestions = ALL_SUGGESTIONS.slice(suggestionSet * 6, suggestionSet * 6 + 6);

    const handleRecalculate = () => {
        const nextSet = (suggestionSet + 1) % 2;
        setSuggestionSet(nextSet);
        setSelectedSuggestionId(ALL_SUGGESTIONS[nextSet * 6].id);
    };

    const handleContinue = () => {
        const selected = ALL_SUGGESTIONS.find(s => s.id === selectedSuggestionId);
        onContinue({
            colorPalette: 'dark',
            brandColors: { colors: [] },
            audience: { age: String(slideCount), interests: niche },
            customPrompt: topicContext || (selected?.title ?? ''),
            fontFamily,
        });
    };

    const col1 = visibleSuggestions.slice(0, 2);
    const col2 = visibleSuggestions.slice(2, 4);
    const col3 = visibleSuggestions.slice(4, 6);

    return (
        <div className="w-full flex flex-col gap-8 mt-8 mb-8 animate-reveal" style={{ fontFamily: 'var(--font-display)' }}>

            {/* Section 1: Topic Context */}
            <section
                className="relative overflow-hidden rounded-xl p-8 group"
                style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
                <div className="absolute top-0 left-0 w-1 h-full bg-[#a855f7]/40 group-hover:bg-[#a855f7] transition-colors rounded-l-xl" />
                <div className="flex flex-col gap-7 pl-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#a855f7]/10">
                            <Terminal size={18} className="text-[#a855f7]" />
                        </div>
                        <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                            Qual o tema de hoje?
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">
                                Contexto do Post
                            </label>
                            <input
                                type="text"
                                value={topicContext}
                                onChange={(e) => setTopicContext(e.target.value)}
                                placeholder="Ex: Estratégias de Growth para SaaS 2024"
                                className="w-full h-14 px-5 rounded-lg text-slate-100 transition-all outline-none"
                                style={{
                                    background: 'rgba(0,0,0,0.4)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    fontFamily: 'var(--font-body)',
                                }}
                                onFocus={(e) => { e.currentTarget.style.borderColor = '#a855f7'; e.currentTarget.style.boxShadow = '0 0 0 1px #a855f7'; }}
                                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">
                                Nicho Operacional
                            </label>
                            <div className="relative">
                                <select
                                    value={niche}
                                    onChange={(e) => setNiche(e.target.value)}
                                    className="w-full h-14 px-5 rounded-lg text-slate-100 appearance-none transition-all outline-none cursor-pointer"
                                    style={{
                                        background: 'rgba(0,0,0,0.4)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        fontFamily: 'var(--font-body)',
                                    }}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = '#a855f7'; e.currentTarget.style.boxShadow = '0 0 0 1px #a855f7'; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    {NICHE_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value} style={{ background: '#0f0a1a' }}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2: AI Suggestions */}
            <section className="flex flex-col gap-5">
                <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-3">
                        <Sparkles size={18} className="text-[#a855f7]" />
                        <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                            Sugestões da IA
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={handleRecalculate}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#a855f7] text-xs font-bold uppercase tracking-widest transition-all hover:bg-[#a855f7]/10 cursor-pointer"
                        style={{ border: '1px solid rgba(168,85,247,0.3)' }}
                    >
                        <RefreshCw size={14} />
                        Recalcular Ideias
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                    {[col1, col2, col3].map((col, colIdx) => (
                        <div key={colIdx} className="flex flex-col gap-5">
                            {col.map((suggestion) => {
                                const isSelected = selectedSuggestionId === suggestion.id;
                                return (
                                    <div
                                        key={suggestion.id}
                                        onClick={() => setSelectedSuggestionId(suggestion.id)}
                                        className="relative rounded-xl p-6 cursor-pointer transition-all duration-300 group"
                                        style={{
                                            background: isSelected ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.04)',
                                            backdropFilter: 'blur(12px)',
                                            border: isSelected ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.08)',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                        }}
                                    >
                                        {isSelected && (
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-8 h-8 rounded-lg bg-[#a855f7] flex items-center justify-center">
                                                    <CheckCircle2 size={16} className="text-white" />
                                                </div>
                                                <span className="text-[10px] font-mono font-bold text-[#a855f7] uppercase tracking-widest">
                                                    Selecionado
                                                </span>
                                            </div>
                                        )}
                                        <h3
                                            className="text-base font-bold text-white mb-2 transition-colors"
                                            style={{ color: !isSelected ? undefined : '#ffffff' }}
                                        >
                                            {suggestion.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed" style={{ color: isSelected ? 'rgba(255,255,255,0.7)' : 'rgba(148,163,184,1)' }}>
                                            {suggestion.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </section>

            {/* Section 3: Slide Count */}
            <section
                className="relative overflow-hidden rounded-xl p-8 group"
                style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
                <div className="absolute top-0 left-0 w-1 h-full bg-[#a855f7]/40 group-hover:bg-[#a855f7] transition-colors rounded-l-xl" />
                <div className="flex flex-col gap-8 pl-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#a855f7]/10">
                                <Layers size={18} className="text-[#a855f7]" />
                            </div>
                            <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                                Estrutura de Blocos
                            </h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tight">
                                Config Atual:
                            </span>
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

                        <div className="relative">
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
                        </div>

                        <div className="flex items-center justify-center gap-2 text-slate-500">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                            <p className="text-[13px] font-medium italic">
                                O algoritmo segmentará o conteúdo em {slideCount} frames otimizados para engajamento.
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
                    Próximo Passo
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
