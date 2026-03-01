'use client';

import { useState, useRef } from 'react';
import {
    Sparkles, Wand2, Palette, Users, Pen,
    Minimize2, Gem, Building2, Zap, Brush, Sun,
    Upload, Plus, X, Pipette
} from 'lucide-react';
import { ImageConfig as ImageConfigType } from '@/types';
import { extractColorsFromImage } from '@/lib/extractColors';

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

    const [customPrompt, setCustomPrompt] = useState('');

    // Brand colors state
    const [brandColors, setBrandColors] = useState<string[]>([]);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isExtractingColors, setIsExtractingColors] = useState(false);
    const [manualColorInput, setManualColorInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview
        const reader = new FileReader();
        reader.onload = () => setLogoPreview(reader.result as string);
        reader.readAsDataURL(file);

        // Extract colors
        setIsExtractingColors(true);
        try {
            const colors = await extractColorsFromImage(file, 5);
            setBrandColors(colors);
        } catch (err) {
            console.error('Erro ao extrair cores:', err);
            alert('Não foi possível extrair as cores da imagem');
        }
        setIsExtractingColors(false);
    };

    const addManualColor = () => {
        let color = manualColorInput.trim();
        if (!color) return;
        if (!color.startsWith('#')) color = '#' + color;
        if (/^#[0-9A-Fa-f]{3,8}$/.test(color)) {
            if (brandColors.length < 6) {
                setBrandColors([...brandColors, color]);
                setManualColorInput('');
            }
        }
    };

    const removeColor = (index: number) => {
        setBrandColors(brandColors.filter((_, i) => i !== index));
    };

    const handleGenerate = () => {
        onGenerate({
            visualStyle,
            colorPalette,
            brandColors: {
                colors: brandColors,
                logoDataUrl: logoPreview || undefined,
            },
            audience: { age, interests: '' },
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

                    {/* ============ BRAND IDENTITY ============ */}
                    <div className="glass-card-static p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Pipette size={14} style={{ color: 'var(--color-accent)' }} />
                            <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>
                                Identidade da Marca
                            </h3>
                        </div>

                        {/* Logo Upload */}
                        <div className="mb-4">
                            <p className="text-xs mb-2" style={{ color: 'var(--color-text-subtle)' }}>
                                Envie sua logo para extrair as cores automaticamente:
                            </p>
                            <div className="flex items-center gap-3">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                    aria-label="Upload de logo"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                                    style={{
                                        background: 'var(--color-card)',
                                        border: '1px solid var(--color-border)',
                                        color: 'var(--color-text-muted)',
                                        minHeight: '44px',
                                    }}
                                    aria-label="Selecionar imagem da logo"
                                >
                                    <Upload size={16} />
                                    {isExtractingColors ? 'Extraindo cores...' : 'Enviar Logo'}
                                </button>

                                {logoPreview && (
                                    <div className="relative w-11 h-11 rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={logoPreview} alt="Logo preview" width={44} height={44} className="w-full h-full object-contain" style={{ background: '#fff' }} />
                                        <button
                                            onClick={() => { setLogoPreview(null); setBrandColors([]); }}
                                            className="cursor-pointer absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                                            style={{ background: 'var(--color-primary)', color: '#fff' }}
                                            aria-label="Remover logo"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Extracted / Manual Colors */}
                        <div>
                            <p className="text-xs mb-2" style={{ color: 'var(--color-text-subtle)' }}>
                                {brandColors.length > 0 ? 'Cores da marca (clique para remover):' : 'Ou adicione cores manualmente:'}
                            </p>

                            {/* Color Swatches */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                {brandColors.map((color, i) => (
                                    <button
                                        key={i}
                                        onClick={() => removeColor(i)}
                                        className="cursor-pointer group relative w-10 h-10 rounded-lg transition-transform hover:scale-110"
                                        style={{ backgroundColor: color, border: '2px solid var(--color-border)' }}
                                        aria-label={`Remover cor ${color}`}
                                        title={color}
                                    >
                                        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" style={{ background: 'rgba(0,0,0,0.5)' }}>
                                            <X size={12} className="text-white" />
                                        </span>
                                    </button>
                                ))}

                                {/* Add Color Button */}
                                {brandColors.length < 6 && (
                                    <div className="flex items-center gap-1.5">
                                        <input
                                            type="color"
                                            value={manualColorInput || '#3b82f6'}
                                            onChange={(e) => {
                                                setManualColorInput(e.target.value);
                                            }}
                                            className="cursor-pointer w-10 h-10 rounded-lg border-0 p-0"
                                            style={{ background: 'transparent' }}
                                            title="Escolher cor"
                                            aria-label="Seletor de cor"
                                        />
                                        <input
                                            type="text"
                                            value={manualColorInput}
                                            onChange={(e) => setManualColorInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addManualColor()}
                                            placeholder="#hex"
                                            className="input-glow w-24 px-3 py-2 rounded-lg text-xs font-mono"
                                            style={{
                                                background: 'var(--color-surface)',
                                                border: '1px solid var(--color-border)',
                                                color: 'var(--color-text)',
                                                minHeight: '40px',
                                            }}
                                            aria-label="Código hex da cor"
                                        />
                                        <button
                                            onClick={addManualColor}
                                            className="cursor-pointer w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                                            style={{
                                                background: 'var(--color-card)',
                                                border: '1px solid var(--color-border)',
                                                color: 'var(--color-text-muted)',
                                            }}
                                            aria-label="Adicionar cor"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

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
                                            background: isActive ? 'rgba(168, 85, 247, 0.15)' : 'var(--color-card)',
                                            color: isActive ? '#A855F7' : 'var(--color-text-muted)',
                                            border: `1px solid ${isActive ? '#A855F7' : 'var(--color-border)'}`,
                                            boxShadow: isActive ? '0 0 20px -6px rgba(168, 85, 247, 0.4)' : 'none',
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
                    <div className="glass-card-static p-5" style={{ position: 'relative', overflow: 'hidden' }}>
                        <div className="flex items-center gap-2 mb-3">
                            <Palette size={14} style={{ color: 'var(--color-text-muted)' }} />
                            <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>
                                Paleta de Cores
                            </h3>
                        </div>

                        {/* Disabled overlay when brand colors are active */}
                        {brandColors.length > 0 && (
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'rgba(0, 0, 0, 0.55)',
                                    backdropFilter: 'blur(2px)',
                                    zIndex: 10,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 'inherit',
                                    padding: '1rem',
                                }}
                            >
                                <p className="text-xs font-medium text-center" style={{ color: 'rgba(255,255,255,0.85)' }}>
                                    🎨 Usando as cores da sua logo
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-3">
                            {COLOR_PALETTES.map((palette) => {
                                const isActive = colorPalette === palette.id && brandColors.length === 0;
                                return (
                                    <button
                                        key={palette.id}
                                        onClick={() => brandColors.length === 0 && setColorPalette(palette.id)}
                                        disabled={brandColors.length > 0}
                                        aria-label={`Paleta ${palette.label}`}
                                        className="cursor-pointer flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200"
                                        style={{
                                            minHeight: '44px',
                                            background: isActive ? 'rgba(168, 85, 247, 0.1)' : 'var(--color-card)',
                                            border: `1px solid ${isActive ? '#A855F7' : 'var(--color-border)'}`,
                                            boxShadow: isActive ? '0 0 0 2px rgba(168, 85, 247, 0.3)' : 'none',
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
                        {brandColors.length === 0 && (
                            <p className="text-xs mt-2" style={{ color: 'var(--color-text-subtle)' }}>
                                💡 Envie sua logo acima para usar as cores da sua marca automaticamente
                            </p>
                        )}
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
                        <input
                            type="text"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            placeholder="Idade (ex: 25-35)"
                            aria-label="Faixa etária do público"
                            className="input-glow w-full px-4 py-2.5 rounded-xl text-sm"
                            style={{
                                background: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text)',
                                fontFamily: 'var(--font-body)',
                                minHeight: '44px',
                            }}
                        />
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
                        className="w-full py-4 bg-[#7f0df2] hover:bg-[#922cee] cursor-pointer rounded-xl flex items-center justify-center gap-3 transition-transform active:scale-[0.98] shadow-[0_0_30px_rgba(127,13,242,0.3)] group disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        style={{
                            fontFamily: 'var(--font-display)',
                        }}
                    >
                        <Sparkles size={20} className="text-white group-hover:rotate-12 transition-transform" />
                        <span className="text-white font-bold text-lg">
                            {isLoading ? 'Gerando Imagens...' : 'Gerar Imagens'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
