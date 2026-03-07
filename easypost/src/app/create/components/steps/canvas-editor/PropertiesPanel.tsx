'use client';

import { useState, useEffect } from 'react';
import { PropertiesPanelProps } from './types';
import { FONT_OPTIONS } from '@/app/create/components/FontSelector';
import ColorPickerPopover from '@/components/ColorPickerPopover';

const LABEL = "text-[10px] font-bold text-slate-500 uppercase tracking-widest";
const INPUT = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:ring-1 focus:ring-[#7f0df2] focus:border-[#7f0df2] outline-none transition-all";

const COLOR_PRESETS = ['#FFFFFF', '#000000', '#7f0df2'];

export function PropertiesPanel({ block, onChange }: PropertiesPanelProps) {
    const [showPicker, setShowPicker] = useState(false);

    // Load all Google Fonts
    useEffect(() => {
        if (document.getElementById('easypost-gfonts')) return;
        const url = `https://fonts.googleapis.com/css2?${FONT_OPTIONS.map(
            (f) => `family=${f.id.replace(/ /g, '+')}:wght@400;500;600;700`
        ).join('&')}&display=swap`;
        const link = document.createElement('link');
        link.id = 'easypost-gfonts';
        link.rel = 'stylesheet';
        link.href = url;
        document.head.appendChild(link);
    }, []);

    if (!block) {
        return (
            <div className="flex flex-col h-full items-center justify-center gap-2 text-slate-600 text-sm px-6 text-center">
                <span className="text-lg opacity-40">+</span>
                <span>Clique em um bloco de texto no canvas para editar</span>
            </div>
        );
    }

    const hexColor = block.color.replace('#', '').toUpperCase();

    return (
        <div className="flex flex-col p-6 overflow-y-auto h-full custom-scrollbar">
            <h3 className="text-lg font-bold text-white mb-8" style={{ fontFamily: 'var(--font-display)' }}>Propriedades</h3>

            <div className="space-y-8">
                {/* Text content */}
                <div className="space-y-3">
                    <label className={LABEL}>Texto</label>
                    <textarea
                        value={block.text}
                        onChange={e => onChange({ text: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-slate-200 focus:ring-1 focus:ring-[#7f0df2] focus:border-[#7f0df2] transition-all resize-none h-28 outline-none"
                        style={{ fontFamily: 'var(--font-display)' }}
                    />
                </div>

                {/* Font */}
                <div className="space-y-2">
                    <label className={LABEL}>Fonte</label>
                    <div className="relative">
                        <select
                            value={block.fontFamily}
                            onChange={e => onChange({ fontFamily: e.target.value })}
                            className={`${INPUT} appearance-none pr-8`}
                            style={{ fontFamily: `'${block.fontFamily}', sans-serif` }}
                        >
                            {FONT_OPTIONS.map(f => (
                                <option key={f.id} value={f.id} style={{ fontFamily: `'${f.id}', sans-serif` }}>
                                    {f.label} — {f.description}
                                </option>
                            ))}
                        </select>
                        <svg className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M7 10l5-5 5 5M7 14l5 5 5-5" />
                        </svg>
                    </div>
                </div>

                {/* Size */}
                <div className="space-y-2">
                    <label className={LABEL}>Tamanho</label>
                    <input
                        type="number"
                        min={8}
                        max={80}
                        value={block.fontSize}
                        onChange={e => onChange({ fontSize: Number(e.target.value) })}
                        className={INPUT}
                    />
                </div>

                {/* Color */}
                <div className="space-y-3">
                    <label className={LABEL}>Cor</label>
                    <div className="flex items-center gap-3">
                        <div className="flex gap-2 items-center">
                            {COLOR_PRESETS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => onChange({ color: c })}
                                    className="size-7 rounded-full cursor-pointer transition-all"
                                    style={{
                                        background: c,
                                        border: block.color.toUpperCase() === c.toUpperCase()
                                            ? '2px solid #7f0df2'
                                            : '1px solid rgba(255,255,255,0.2)',
                                        boxShadow: block.color.toUpperCase() === c.toUpperCase()
                                            ? '0 0 0 2px rgba(127,13,242,0.2)'
                                            : 'none',
                                    }}
                                />
                            ))}
                        </div>
                        <div className="flex-1 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono">#</span>
                            <input
                                type="text"
                                value={hexColor}
                                onChange={e => {
                                    const val = e.target.value.replace('#', '');
                                    if (/^[0-9A-Fa-f]{0,6}$/.test(val)) {
                                        onChange({ color: `#${val}` });
                                    }
                                }}
                                className={`${INPUT} pl-6 font-mono uppercase`}
                            />
                        </div>
                        {/* Color picker trigger — last in the row */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowPicker(v => !v)}
                                className="size-7 rounded-full cursor-pointer border border-white/20 shrink-0 transition-transform hover:scale-110"
                                style={{ background: 'conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)' }}
                            />
                            {showPicker && (
                                <ColorPickerPopover
                                    color={block.color}
                                    onChange={c => onChange({ color: c })}
                                    onClose={() => setShowPicker(false)}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Position X/Y */}
                <div className="space-y-3">
                    <label className={LABEL}>Posicao</label>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 gap-2">
                            <span className="text-[10px] font-bold text-slate-600">X</span>
                            <input
                                type="number"
                                min={0}
                                max={100}
                                value={Math.round(block.xPercent)}
                                onChange={e => onChange({ xPercent: Number(e.target.value) })}
                                className="bg-transparent border-none p-0 text-xs text-slate-200 focus:ring-0 w-full outline-none"
                            />
                        </div>
                        <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 gap-2">
                            <span className="text-[10px] font-bold text-slate-600">Y</span>
                            <input
                                type="number"
                                min={0}
                                max={100}
                                value={Math.round(block.yPercent)}
                                onChange={e => onChange({ yPercent: Number(e.target.value) })}
                                className="bg-transparent border-none p-0 text-xs text-slate-200 focus:ring-0 w-full outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Bold / Italic / Align */}
                <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl">
                    <button
                        type="button"
                        onClick={() => onChange({ bold: !block.bold })}
                        className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all cursor-pointer ${block.bold ? 'bg-[#7f0df2] text-white' : 'hover:bg-white/5 text-slate-400'}`}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6V4zm0 8h9a4 4 0 014 4 4 4 0 01-4 4H6v-8z"/></svg>
                    </button>
                    <button
                        type="button"
                        onClick={() => onChange({ italic: !block.italic })}
                        className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all cursor-pointer ${block.italic ? 'bg-[#7f0df2] text-white' : 'hover:bg-white/5 text-slate-400'}`}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4v2h2.21l-3.42 12H6v2h8v-2h-2.21l3.42-12H18V4h-8z"/></svg>
                    </button>
                    <span className="w-px bg-white/5" />
                    {(['left', 'center', 'right'] as const).map(align => (
                        <button
                            key={align}
                            type="button"
                            onClick={() => onChange({ textAlign: align })}
                            className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all cursor-pointer ${(block.textAlign ?? 'center') === align ? 'bg-[#7f0df2] text-white' : 'hover:bg-white/5 text-slate-400'}`}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                {align === 'left' && <path d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z"/>}
                                {align === 'center' && <path d="M3 3h18v2H3V3zm3 4h12v2H6V7zm-3 4h18v2H3v-2zm3 4h12v2H6v-2zm-3 4h18v2H3v-2z"/>}
                                {align === 'right' && <path d="M3 3h18v2H3V3zm6 4h12v2H9V7zm-6 4h18v2H3v-2zm6 4h12v2H9v-2zm-6 4h18v2H3v-2z"/>}
                            </svg>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
