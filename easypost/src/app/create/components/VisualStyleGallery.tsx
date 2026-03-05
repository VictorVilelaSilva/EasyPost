'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, Terminal, Upload, Plus } from 'lucide-react';

// The visual styles mapped from Stitch
const VISUAL_STYLES = [
    {
        id: 'minimalist',
        title: 'Master Minimalist Design',
        subtitle: 'VisualAI Framework',
        tag: 'Clean Minimalist',
        preview: 'bg-[#111]',
        previewContent: (
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent flex flex-col justify-center p-6">
                <div className="w-12 h-1 bg-white mb-4"></div>
                <p className="text-2xl font-bold text-white leading-tight">Master Minimalist Design</p>
                <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest">VisualAI Framework</p>
            </div>
        )
    },
    {
        id: 'neon',
        title: 'NEON FLOW',
        subtitle: '2024 TRENDS',
        tag: 'Vibrant Neon',
        preview: 'bg-gradient-to-tr from-purple-900 to-blue-900',
        previewContent: (
            <div className="absolute inset-0 p-6 flex flex-col items-end text-right justify-end">
                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-[#8b5cf6] italic">NEON FLOW</p>
                <p className="text-white mt-2 text-xs font-bold bg-[#8b5cf6] px-2 py-1">2024 TRENDS</p>
            </div>
        )
    },
    {
        id: 'corporate',
        title: 'Q3 Report Summary',
        subtitle: 'Building the future of enterprise automation with AI.',
        tag: 'Corporate Executive',
        preview: 'bg-[#1e293b]',
        previewContent: (
            <div className="absolute inset-0 p-8 flex flex-col border border-slate-600 m-4 bg-[#0f172a]">
                <span className="text-xs font-bold text-blue-400 mb-2 uppercase">Q3 Report Summary</span>
                <p className="text-lg font-medium text-slate-100 leading-normal">Building the future of enterprise automation with AI.</p>
                <div className="mt-auto flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-600"></div>
                    <span className="text-[10px] text-slate-400">CEO Insights</span>
                </div>
            </div>
        )
    },
    {
        id: 'cyber-tech',
        title: 'DARK_TECH',
        subtitle: '> INIT_GEN',
        tag: 'Cyber Tech',
        preview: 'bg-black',
        previewContainerClass: 'border border-green-500/20 m-2 w-[calc(100%-16px)] h-[calc(100%-16px)] rounded-lg',
        previewContent: (
            <div className="absolute inset-0 p-6 flex flex-col justify-between">
                <Terminal className="text-green-500 w-8 h-8" />
                <div className="space-y-3">
                    <p className="text-sm font-mono text-green-500">&gt; INIT_GEN</p>
                    <p className="text-2xl font-bold text-white font-mono">DARK_TECH</p>
                </div>
            </div>
        )
    }
];

interface Props {
    onGenerate: (selectedStyle: string) => void;
    isLoading: boolean;
}

export default function VisualStyleGallery({ onGenerate, isLoading }: Props) {
    const [selectedStyle, setSelectedStyle] = useState('minimalist');

    return (
        <div className="w-full animate-reveal relative">
            <div className="flex flex-col gap-6">
                <nav className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    <button className="flex h-10 shrink-0 items-center justify-center rounded-full bg-[#8b5cf6] px-6 text-white text-sm font-semibold border border-[#8b5cf6]/50">
                        Todos
                    </button>
                    {VISUAL_STYLES.map(style => (
                        <button
                            key={`filter-${style.id}`}
                            onClick={() => setSelectedStyle(style.id)}
                            className="flex h-10 shrink-0 items-center justify-center rounded-full bg-[#1a1a20] border border-white/5 px-6 text-slate-300 hover:text-white hover:border-white/20 transition-all text-sm font-medium"
                        >
                            {style.tag}
                        </button>
                    ))}
                </nav>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {VISUAL_STYLES.map((style) => {
                        const isSelected = selectedStyle === style.id;
                        return (
                            <div
                                key={style.id}
                                onClick={() => setSelectedStyle(style.id)}
                                className={`cursor-pointer group relative flex flex-col rounded-xl overflow-hidden bg-[#1a1a20] border transition-all duration-300 ${isSelected ? 'border-[#8b5cf6] shadow-[0_0_0_2px_rgba(139,92,246,1),0_0_20px_rgba(139,92,246,0.4)]' : 'border-white/5 hover:border-[#8b5cf6]/50'}`}
                            >
                                <div className={`aspect-[4/5] w-full relative overflow-hidden ${style.preview}`}>
                                    <div className={style.previewContainerClass || 'w-full h-full relative'}>
                                        {style.previewContent}
                                    </div>
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedStyle(style.id);
                                            }}
                                            className="bg-[#8b5cf6] text-white px-6 py-3 rounded-lg font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform"
                                        >
                                            Selecionar
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 flex justify-between items-center bg-[#24242c] border-t border-white/5">
                                    <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{style.tag}</span>
                                    {isSelected && <CheckCircle2 className="text-[#8b5cf6] w-5 h-5" />}
                                </div>
                            </div>
                        );
                    })}

                    <div className="cursor-pointer group relative flex flex-col rounded-xl overflow-hidden bg-[#1a1a20] border border-dashed border-white/20 hover:border-[#8b5cf6] transition-all duration-300">
                        <div className="aspect-[4/5] w-full bg-[#24242c]/50 relative flex flex-col items-center justify-center text-center p-6">
                            <div className="w-16 h-16 rounded-full bg-[#1a1a20] border border-white/10 flex items-center justify-center mb-4 group-hover:bg-[#8b5cf6]/20 group-hover:border-[#8b5cf6]/50 transition-colors">
                                <Plus className="text-slate-400 w-8 h-8 group-hover:text-[#8b5cf6] transition-colors" />
                            </div>
                            <p className="text-white font-semibold text-lg">Personalizado</p>
                            <p className="text-slate-400 text-sm mt-2">Faça upload do seu próprio estilo</p>
                        </div>
                        <div className="p-4 flex justify-between items-center bg-[#24242c] border-t border-white/5">
                            <span className="text-sm font-semibold text-slate-300">Upload</span>
                            <Upload className="text-slate-400 w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 flex justify-end">
                <button
                    onClick={() => onGenerate(selectedStyle)}
                    disabled={isLoading}
                    className="px-8 py-4 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-base font-bold transition-all flex items-center gap-2 shadow-lg shadow-[#8b5cf6]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    {isLoading ? 'Gerando post...' : 'Continuar'}
                    {!isLoading && <ArrowRight className="w-5 h-5" />}
                </button>
            </div>
        </div>
    );
}

