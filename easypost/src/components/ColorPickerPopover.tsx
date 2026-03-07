'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

const PALETTE_COLORS = [
    '#FF0000', '#FF4500', '#FF8C00', '#FFD700', '#FFFF00',
    '#7FFF00', '#00FF00', '#00FA9A', '#00FFFF', '#00BFFF',
    '#0000FF', '#4B0082', '#8B00FF', '#FF00FF', '#FF1493',
    '#FF6B6B', '#FFA07A', '#FFD39B', '#FFFACD', '#F0FFF0',
    '#98FB98', '#AFEEEE', '#87CEEB', '#B0C4DE', '#DDA0DD',
    '#333333', '#555555', '#777777', '#999999', '#BBBBBB',
];

interface Props {
    color: string;
    onChange: (color: string) => void;
    onClose: () => void;
    position?: 'above-right' | 'above-left';
}

export default function ColorPickerPopover({ color, onChange, onClose, position = 'above-right' }: Props) {
    const popoverRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const hueRef = useRef<HTMLCanvasElement>(null);
    const [hue, setHue] = useState(0);
    const [isDraggingSL, setIsDraggingSL] = useState(false);
    const [isDraggingHue, setIsDraggingHue] = useState(false);

    useEffect(() => {
        if (!color || color.length < 7) return;
        const r = parseInt(color.slice(1, 3), 16) / 255;
        const g = parseInt(color.slice(3, 5), 16) / 255;
        const b = parseInt(color.slice(5, 7), 16) / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0;
        if (max !== min) {
            const d = max - min;
            if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
            else if (max === g) h = ((b - r) / d + 2) / 6;
            else h = ((r - g) / d + 4) / 6;
        }
        setHue(h * 360);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const w = canvas.width, h = canvas.height;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(0, 0, w, h);
        const whiteGrad = ctx.createLinearGradient(0, 0, w, 0);
        whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
        whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = whiteGrad;
        ctx.fillRect(0, 0, w, h);
        const blackGrad = ctx.createLinearGradient(0, 0, 0, h);
        blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
        blackGrad.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.fillStyle = blackGrad;
        ctx.fillRect(0, 0, w, h);
    }, [hue]);

    useEffect(() => {
        const canvas = hueRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
        for (let i = 0; i <= 6; i++) {
            grad.addColorStop(i / 6, `hsl(${i * 60}, 100%, 50%)`);
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    const pickFromSL = useCallback((e: React.MouseEvent<HTMLCanvasElement> | MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width - 1, (e as MouseEvent).clientX - rect.left));
        const y = Math.max(0, Math.min(rect.height - 1, (e as MouseEvent).clientY - rect.top));
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const pixel = ctx.getImageData(x * (canvas.width / rect.width), y * (canvas.height / rect.height), 1, 1).data;
        const hex = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`.toUpperCase();
        onChange(hex);
    }, [onChange]);

    const pickHue = useCallback((e: React.MouseEvent<HTMLCanvasElement> | MouseEvent) => {
        const canvas = hueRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width - 1, (e as MouseEvent).clientX - rect.left));
        setHue((x / rect.width) * 360);
    }, []);

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            if (isDraggingSL) pickFromSL(e);
            if (isDraggingHue) pickHue(e);
        };
        const handleUp = () => { setIsDraggingSL(false); setIsDraggingHue(false); };
        if (isDraggingSL || isDraggingHue) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        };
    }, [isDraggingSL, isDraggingHue, pickFromSL, pickHue]);

    const posClass = position === 'above-left'
        ? 'bottom-full right-0 mb-2'
        : 'bottom-full left-0 mb-2';

    return (
        <div
            ref={popoverRef}
            className={`absolute ${posClass} rounded-xl border border-white/10 p-3 z-50 shadow-2xl`}
            style={{ background: 'rgba(16,10,24,0.95)', backdropFilter: 'blur(16px)', width: 220 }}
        >
            <canvas
                ref={canvasRef}
                width={194}
                height={140}
                className="w-full rounded-lg cursor-crosshair mb-2"
                style={{ height: 140 }}
                onMouseDown={(e) => { setIsDraggingSL(true); pickFromSL(e); }}
            />
            <canvas
                ref={hueRef}
                width={194}
                height={14}
                className="w-full rounded-full cursor-pointer mb-3"
                style={{ height: 14 }}
                onMouseDown={(e) => { setIsDraggingHue(true); pickHue(e); }}
            />
            <div className="grid grid-cols-10 gap-1">
                {PALETTE_COLORS.map(c => (
                    <button
                        key={c}
                        type="button"
                        onClick={() => onChange(c)}
                        className="size-4 rounded-sm cursor-pointer transition-transform hover:scale-125"
                        style={{
                            background: c,
                            outline: color.toUpperCase() === c.toUpperCase() ? '2px solid #7f0df2' : 'none',
                            outlineOffset: 1,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
