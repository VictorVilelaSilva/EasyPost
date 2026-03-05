'use client';

import { Loader2, Wand2, Lightbulb, Bolt } from 'lucide-react';
import { Platform, PostObjective } from '@/types';
import TopicList from '../TopicList';
import PlatformSelector from '../PlatformSelector';
import ObjectiveSelector from '../ObjectiveSelector';
import SlideCountInput from '../SlideCountInput';

interface Props {
    platform: Platform;
    setPlatform: (v: Platform) => void;
    manualTopic: string;
    setManualTopic: (v: string) => void;
    niche: string;
    setNiche: (v: string) => void;
    isGeneratingTopics: boolean;
    handleGenerateTopics: () => void;
    topics: string[];
    isGeneratingText: boolean;
    objective: PostObjective;
    setObjective: (v: PostObjective) => void;
    slideCount: number;
    setSlideCount: (v: number) => void;
    onSubmitGeneration: () => void;
}

export default function Step1Configuration({
    platform, setPlatform,
    manualTopic, setManualTopic,
    niche, setNiche,
    isGeneratingTopics, handleGenerateTopics,
    topics, isGeneratingText,
    objective, setObjective,
    slideCount, setSlideCount,
    onSubmitGeneration,
}: Props) {
    return (
        <div className="glass-panel rounded-xl p-8 flex flex-col gap-10 border border-white/5 shadow-2xl animate-fade-in" style={{ background: 'rgba(25, 16, 34, 0.6)', backdropFilter: 'blur(12px)' }}>
            <PlatformSelector value={platform} onChange={setPlatform} />

            <section className="flex flex-col gap-4 mt-2">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#A855F7]"><Lightbulb size={20} /></span>
                    <h3 className="text-lg font-semibold text-white font-display">2. Definir Tópico & Nicho</h3>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">
                                Tema Manual (Opcional se usar sugestões)
                            </label>
                            <input
                                type="text"
                                value={manualTopic}
                                onChange={(e) => setManualTopic(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] transition-all"
                                placeholder="Ex: 5 ferramentas de IA para 2024"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">
                                Nicho
                            </label>
                            <input
                                type="text"
                                value={niche}
                                onChange={(e) => setNiche(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] transition-all"
                                placeholder="Ex: Tech & AI"
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGenerateTopics}
                        disabled={isGeneratingTopics || !niche.trim()}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-dashed border-[#A855F7]/40 text-[#A855F7] font-medium hover:bg-[#A855F7]/5 cursor-pointer transition-colors disabled:opacity-50"
                    >
                        {isGeneratingTopics ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                        Gerar Ideias Virais
                    </button>
                </div>

                {topics.length > 0 && (
                    <div className="mt-2 p-4 bg-black/20 rounded-xl border border-white/5">
                        <TopicList
                            topics={topics}
                            onSelect={(selected: string) => setManualTopic(selected)}
                            isLoadingCarousel={isGeneratingText}
                        />
                    </div>
                )}
            </section>

            <ObjectiveSelector value={objective} onChange={setObjective} />
            <SlideCountInput value={slideCount} onChange={setSlideCount} />

            <div className="mt-4 pt-6 border-t border-white/5">
                <button
                    type="button"
                    onClick={onSubmitGeneration}
                    disabled={!niche.trim() && !manualTopic.trim()}
                    className="w-full py-4 bg-[#7f0df2] hover:bg-[#922cee] cursor-pointer rounded-xl flex items-center justify-center gap-3 transition-transform active:scale-[0.98] shadow-[0_0_30px_rgba(127,13,242,0.3)] group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="text-white font-bold text-lg">Gerar Post com IA</span>
                    <Bolt size={20} className="text-white group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-center text-slate-500 text-[11px] mt-4">Tempo médio de geração: <span className="text-slate-300">~24 segundos</span></p>
            </div>
        </div>
    );
}
