'use client';

import { useState } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import { ImageConfig as ImageConfigType } from '../types';

const VISUAL_STYLES = [
    { id: 'minimalist', label: 'Minimalista', emoji: '✨' },
    { id: 'luxury', label: 'Luxo', emoji: '💎' },
    { id: 'corporate', label: 'Corporativo', emoji: '🏢' },
    { id: 'clean-tech', label: 'Clean Tech', emoji: '⚡' },
    { id: 'creative', label: 'Criativo', emoji: '🎨' },
    { id: 'neon', label: 'Neon', emoji: '🌈' },
];

const COLOR_PALETTES = [
    { id: 'dark', label: 'Dark', colors: ['#0f172a', '#1e293b', '#334155'] },
    { id: 'light', label: 'Light', colors: ['#f8fafc', '#e2e8f0', '#cbd5e1'] },
    { id: 'blue', label: 'Blue', colors: ['#1e3a5f', '#2563eb', '#60a5fa'] },
    { id: 'green', label: 'Green', colors: ['#064e3b', '#059669', '#34d399'] },
    { id: 'warm', label: 'Warm', colors: ['#7c2d12', '#ea580c', '#fb923c'] },
    { id: 'purple', label: 'Purple', colors: ['#3b0764', '#7c3aed', '#a78bfa'] },
];

interface Props {
    topic: string;
    onGenerate: (config: ImageConfigType) => void;
    isLoading: boolean;
}

export default function ImageConfigPanel({ topic, onGenerate, isLoading }: Props) {
    const [visualStyle, setVisualStyle] = useState('minimalist');
    const [colorPalette, setColorPalette] = useState('dark');
    const [age, setAge] = useState('');
    const [interests, setInterests] = useState('');
    const [customPrompt, setCustomPrompt] = useState('');

    const handleGenerate = () => {
        onGenerate({
            visualStyle,
            colorPalette,
            audience: { age, interests },
            customPrompt,
        });
    };

    return (
        <div className="w-full mt-8 mb-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Wand2 className="text-blue-400" size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Configurações da Imagem</h2>
                    <p className="text-sm text-slate-400">Personalize o visual do seu carousel sobre <span className="text-blue-400 font-medium">&ldquo;{topic}&rdquo;</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left Column */}
                <div className="space-y-6">

                    {/* Visual Style */}
                    <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Estilo Visual</h3>
                        <div className="flex flex-wrap gap-2">
                            {VISUAL_STYLES.map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => setVisualStyle(style.id)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${visualStyle === style.id
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600/50'
                                        }`}
                                >
                                    <span>{style.emoji}</span>
                                    {style.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Palette */}
                    <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Paleta de Cores</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {COLOR_PALETTES.map((palette) => (
                                <button
                                    key={palette.id}
                                    onClick={() => setColorPalette(palette.id)}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 ${colorPalette === palette.id
                                            ? 'bg-slate-700/80 ring-2 ring-blue-500 scale-105'
                                            : 'bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30'
                                        }`}
                                >
                                    <div className="flex gap-1">
                                        {palette.colors.map((color, i) => (
                                            <div
                                                key={i}
                                                className="w-5 h-5 rounded-full border border-white/10"
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium">{palette.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">

                    {/* Target Audience */}
                    <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Público-Alvo</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                placeholder="Idade (ex: 25-35)"
                                className="px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-600/50 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                            <input
                                type="text"
                                value={interests}
                                onChange={(e) => setInterests(e.target.value)}
                                placeholder="Interesses (ex: tech, design)"
                                className="px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-600/50 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                    </div>

                    {/* Custom Prompt */}
                    <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Prompt Personalizado</h3>
                        <textarea
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder="Adicione instruções extras para o visual das imagens... (ex: usar ícones flat, incluir logo no canto)"
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-600/50 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                        />
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl flex items-center justify-center gap-3 text-lg transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Sparkles size={22} />
                        {isLoading ? 'Gerando Imagens...' : 'Gerar Imagens'}
                    </button>
                </div>
            </div>
        </div>
    );
}
