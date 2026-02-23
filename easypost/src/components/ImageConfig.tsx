'use client';

import { useState } from 'react';
import { Sparkles, Wand2, Palette, Users, Pen, Minimize2, Gem, Building2, Zap, Brush, Sun } from 'lucide-react';
import { ImageConfig as ImageConfigType } from '../types';

const VISUAL_STYLES = [
    { id: 'minimalist', label: 'Minimalista', icon: Minimize2 },
    { id: 'luxury', label: 'Luxo', icon: Gem },
    { id: 'corporate', label: 'Corporativo', icon: Building2 },
    { id: 'clean-tech', label: 'Clean Tech', icon: Zap },
    { id: 'creative', label: 'Criativo', icon: Brush },
    { id: 'neon', label: 'Neon', icon: Sun },
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
        <div className="w-full mt-8 mb-8 animate-reveal">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
                    <Wand2 size={20} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                    <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                        Configurações da Imagem
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        Personalize o visual do seu carousel sobre <span className="font-medium" style={{ color: 'var(--color-primary)' }}>&ldquo;{topic}&rdquo;</span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Left Column */}
                <div className="space-y-5">

                    {/* Visual Style */}
                    <div className="glass-card-static p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Palette size={14} style={{ color: 'var(--color-text-muted)' }} />
                            <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>
                                Estilo Visual
                            </h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {VISUAL_STYLES.map((style) => {
                                const Icon = style.icon;
                                const isActive = visualStyle === style.id;
                                return (
                                    <button
                                        key={style.id}
                                        onClick={() => setVisualStyle(style.id)}
                                        aria-label={`Estilo ${style.label}`}
                                        className="cursor-pointer px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2"
                                        style={{
                                            minHeight: '44px',
                                            background: isActive ? 'var(--color-primary)' : 'var(--color-card)',
                                            color: isActive ? '#fff' : 'var(--color-text-muted)',
                                            border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                            boxShadow: isActive ? 'var(--shadow-glow)' : 'none',
                                            transform: isActive ? 'scale(1.03)' : 'scale(1)',
                                        }}
                                    >
                                        <Icon size={15} />
                                        {style.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Color Palette */}
                    <div className="glass-card-static p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Palette size={14} style={{ color: 'var(--color-text-muted)' }} />
                            <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>
                                Paleta de Cores
                            </h3>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {COLOR_PALETTES.map((palette) => {
                                const isActive = colorPalette === palette.id;
                                return (
                                    <button
                                        key={palette.id}
                                        onClick={() => setColorPalette(palette.id)}
                                        aria-label={`Paleta ${palette.label}`}
                                        className="cursor-pointer flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200"
                                        style={{
                                            minHeight: '44px',
                                            background: isActive ? 'var(--color-card-hover)' : 'var(--color-card)',
                                            border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                            boxShadow: isActive ? '0 0 0 2px var(--color-primary-glow)' : 'none',
                                            transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                        }}
                                    >
                                        <div className="flex gap-1.5">
                                            {palette.colors.map((color, i) => (
                                                <div
                                                    key={i}
                                                    className="w-5 h-5 rounded-full"
                                                    style={{ backgroundColor: color, border: '1px solid rgba(255,255,255,0.1)' }}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs font-medium" style={{ color: 'var(--color-text-subtle)' }}>{palette.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-5">

                    {/* Target Audience */}
                    <div className="glass-card-static p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Users size={14} style={{ color: 'var(--color-text-muted)' }} />
                            <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>
                                Público-Alvo
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                placeholder="Idade (ex: 25-35)"
                                aria-label="Faixa etária do público"
                                className="input-glow px-4 py-2.5 rounded-xl text-sm"
                                style={{
                                    background: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    color: 'var(--color-text)',
                                    fontFamily: 'var(--font-body)',
                                    minHeight: '44px',
                                }}
                            />
                            <input
                                type="text"
                                value={interests}
                                onChange={(e) => setInterests(e.target.value)}
                                placeholder="Interesses (ex: tech, design)"
                                aria-label="Interesses do público"
                                className="input-glow px-4 py-2.5 rounded-xl text-sm"
                                style={{
                                    background: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    color: 'var(--color-text)',
                                    fontFamily: 'var(--font-body)',
                                    minHeight: '44px',
                                }}
                            />
                        </div>
                    </div>

                    {/* Custom Prompt */}
                    <div className="glass-card-static p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Pen size={14} style={{ color: 'var(--color-text-muted)' }} />
                            <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>
                                Prompt Personalizado
                            </h3>
                        </div>
                        <textarea
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder="Adicione instruções extras para o visual das imagens..."
                            rows={3}
                            aria-label="Prompt personalizado"
                            className="input-glow w-full px-4 py-3 rounded-xl text-sm resize-none"
                            style={{
                                background: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text)',
                                fontFamily: 'var(--font-body)',
                            }}
                        />
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        aria-label="Gerar imagens do carousel"
                        className="btn-glow w-full py-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl flex items-center justify-center gap-3 text-lg"
                        style={{
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                            fontFamily: 'var(--font-display)',
                            minHeight: '56px',
                        }}
                    >
                        <Sparkles size={22} />
                        {isLoading ? 'Gerando Imagens...' : 'Gerar Imagens'}
                    </button>
                </div>
            </div>
        </div>
    );
}
