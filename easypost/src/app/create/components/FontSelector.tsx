'use client';

import { useEffect } from 'react';
import { Type, Check } from 'lucide-react';

export const FONT_OPTIONS = [
    { id: 'Inter', label: 'Inter', category: 'Sans-serif', description: 'Limpa e Funcional' },
    { id: 'Poppins', label: 'Poppins', category: 'Sans-serif', description: 'Arredondada e Amigável' },
    { id: 'Montserrat', label: 'Montserrat', category: 'Sans-serif', description: 'Urbana e Versátil' },
    { id: 'Raleway', label: 'Raleway', category: 'Sans-serif', description: 'Elegante e Fina' },
    { id: 'DM Sans', label: 'DM Sans', category: 'Sans-serif', description: 'Moderna e Minimalista' },
    { id: 'Space Grotesk', label: 'Space Grotesk', category: 'Sans-serif', description: 'Geométrica e Moderna' },
    { id: 'Outfit', label: 'Outfit', category: 'Sans-serif', description: 'Arredondada Minimalista' },
    { id: 'Work Sans', label: 'Work Sans', category: 'Sans-serif', description: 'Prática e Legível' },
    { id: 'Nunito', label: 'Nunito', category: 'Sans-serif', description: 'Suave e Arredondada' },
    { id: 'Roboto', label: 'Roboto', category: 'Sans-serif', description: 'Sólida e Neutra' },
    { id: 'Open Sans', label: 'Open Sans', category: 'Sans-serif', description: 'Leitura Agradável' },
    { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', category: 'Sans-serif', description: 'Tech e Inovação' },
    { id: 'IBM Plex Sans', label: 'IBM Plex Sans', category: 'Sans-serif', description: 'Técnica e Corporativa' },
    { id: 'Archivo Black', label: 'Archivo Black', category: 'Display', description: 'Impactante e Bold' },
    { id: 'Oswald', label: 'Oswald', category: 'Display', description: 'Condensada e Forte' },
    { id: 'Bebas Neue', label: 'Bebas Neue', category: 'Display', description: 'Maiúscula e Destacada' },
    { id: 'Playfair Display', label: 'Playfair Display', category: 'Serif', description: 'Elegante e Clássica' },
    { id: 'Merriweather', label: 'Merriweather', category: 'Serif', description: 'Tradicional e Confiável' },
    { id: 'Lora', label: 'Lora', category: 'Serif', description: 'Contemporânea e Artística' },
];

interface Props {
    value: string;
    onChange: (font: string) => void;
}

export default function FontSelector({ value, onChange }: Props) {
    useEffect(() => {
        // Build a single Google Fonts URL for all 17 fonts
        const url = `https://fonts.googleapis.com/css2?${FONT_OPTIONS.map(
            (f) => `family=${f.id.replace(/ /g, '+')}:wght@400;700`
        ).join('&')}&display=swap`;

        if (!document.getElementById('easypost-gfonts')) {
            const link = document.createElement('link');
            link.id = 'easypost-gfonts';
            link.rel = 'stylesheet';
            link.href = url;
            document.head.appendChild(link);
        }
    }, []);

    const selectedFont = FONT_OPTIONS.find((f) => f.id === value) || FONT_OPTIONS[0];

    return (
        <div className="glass-card-static p-5">
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-4">
                <Type size={14} style={{ color: 'var(--color-accent)' }} />
                <h3
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}
                >
                    Tipografia
                </h3>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--color-text-subtle)' }}>
                Escolha a fonte do seu post
            </p>

            {/* Font List */}
            <div
                className="flex flex-col gap-2 overflow-y-auto pr-1"
                style={{ maxHeight: '340px', scrollbarWidth: 'thin' }}
            >
                {FONT_OPTIONS.map((font) => {
                    const isActive = value === font.id;
                    return (
                        <button
                            key={font.id}
                            onClick={() => onChange(font.id)}
                            aria-label={`Fonte ${font.label}`}
                            aria-pressed={isActive}
                            className="cursor-pointer w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200"
                            style={{
                                background: isActive
                                    ? 'rgba(168, 85, 247, 0.12)'
                                    : 'var(--color-surface)',
                                border: `1px solid ${isActive ? '#A855F7' : 'var(--color-border)'}`,
                                boxShadow: isActive
                                    ? '0 0 18px -4px rgba(168, 85, 247, 0.45)'
                                    : 'none',
                                minHeight: '52px',
                            }}
                        >
                            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                <span
                                    className="text-[11px] font-semibold uppercase tracking-wide truncate"
                                    style={{
                                        color: isActive ? '#A855F7' : 'var(--color-text-muted)',
                                        fontFamily: 'var(--font-display)',
                                    }}
                                >
                                    {font.label}
                                    <span
                                        className="ml-2 font-normal normal-case tracking-normal"
                                        style={{ fontSize: '9px', opacity: 0.55 }}
                                    >
                                        {font.category}
                                    </span>
                                </span>
                                <span
                                    className="text-sm truncate"
                                    style={{
                                        fontFamily: `'${font.id}', sans-serif`,
                                        color: isActive ? '#e5d8ff' : 'var(--color-text-muted)',
                                    }}
                                >
                                    Seu Post no Instagram
                                </span>
                            </div>
                            {isActive && (
                                <div
                                    className="ml-3 shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                                    style={{ background: '#A855F7' }}
                                >
                                    <Check size={11} className="text-white" strokeWidth={3} />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Live Preview Card */}
            <div className="mt-5">
                <p className="text-xs mb-3" style={{ color: 'var(--color-text-subtle)' }}>
                    Preview do post com a fonte selecionada:
                </p>
                <div
                    className="relative rounded-2xl overflow-hidden flex flex-col items-center justify-center p-6 text-center"
                    style={{
                        background: 'linear-gradient(135deg, #1a0a2e 0%, #0f0a1a 60%, #1a1040 100%)',
                        border: '1px solid rgba(168, 85, 247, 0.2)',
                        minHeight: '140px',
                        boxShadow: '0 0 40px -10px rgba(168, 85, 247, 0.3)',
                    }}
                >
                    {/* Subtle glow dot */}
                    <div
                        className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
                        style={{
                            background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)',
                            transform: 'translate(30%, -30%)',
                        }}
                    />
                    <p
                        className="text-lg font-bold leading-tight"
                        style={{
                            fontFamily: `'${selectedFont.id}', sans-serif`,
                            color: '#ffffff',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        Título do Post
                    </p>
                    <p
                        className="text-sm mt-2"
                        style={{
                            fontFamily: `'${selectedFont.id}', sans-serif`,
                            color: 'rgba(255,255,255,0.55)',
                        }}
                    >
                        Subtítulo exemplo de texto
                    </p>
                    {/* Font name badge */}
                    <div
                        className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-widest"
                        style={{
                            background: 'rgba(168,85,247,0.15)',
                            border: '1px solid rgba(168,85,247,0.3)',
                            color: '#A855F7',
                            fontFamily: 'var(--font-display)',
                        }}
                    >
                        {selectedFont.label}
                    </div>
                </div>
            </div>
        </div>
    );
}
