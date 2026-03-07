'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { SlideState } from './types';
import { Platform, TextBlock } from '@/types';
import { downloadCarouselZip } from '@/lib/downloadZip';

export function useCanvasLogic(
    slides: SlideState[],
    platform: Platform,
    caption: string,
    onUpdateSlide: (index: number, patch: Partial<SlideState>) => void
) {
    const [activeSlide, setActiveSlide] = useState(0);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [isFusing, setIsFusing] = useState(false);
    const [fusedImages, setFusedImages] = useState<(string | null)[]>(slides.map(() => null));
    const [isDownloading, setIsDownloading] = useState(false);
    const [allFused, setAllFused] = useState(false);

    const canvasRef = useRef<HTMLDivElement>(null);
    const dragState = useRef<{
        blockId: string | null;
        startMouseX: number;
        startMouseY: number;
        startXPct: number;
        startYPct: number;
    }>({
        blockId: null,
        startMouseX: 0,
        startMouseY: 0,
        startXPct: 0,
        startYPct: 0,
    });

    const currentSlide = slides[activeSlide];
    const selectedBlock = currentSlide?.textBlocks.find(b => b.id === selectedBlockId) ?? null;

    const updateBlock = useCallback((patch: Partial<TextBlock>) => {
        if (!selectedBlockId) return;
        onUpdateSlide(activeSlide, {
            textBlocks: currentSlide.textBlocks.map(b => b.id === selectedBlockId ? { ...b, ...patch } : b),
        });
    }, [selectedBlockId, activeSlide, currentSlide, onUpdateSlide]);

    const handleDragStart = useCallback((blockId: string, mouseX: number, mouseY: number) => {
        const block = currentSlide.textBlocks.find(b => b.id === blockId);
        if (!block) return;
        dragState.current = {
            blockId,
            startMouseX: mouseX,
            startMouseY: mouseY,
            startXPct: block.xPercent,
            startYPct: block.yPercent
        };
    }, [currentSlide]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!dragState.current.blockId || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const dx = ((e.clientX - dragState.current.startMouseX) / rect.width) * 100;
        const dy = ((e.clientY - dragState.current.startMouseY) / rect.height) * 100;
        const newX = Math.max(0, Math.min(95, dragState.current.startXPct + dx));
        const newY = Math.max(0, Math.min(95, dragState.current.startYPct + dy));

        onUpdateSlide(activeSlide, {
            textBlocks: slides[activeSlide].textBlocks.map(b =>
                b.id === dragState.current.blockId ? { ...b, xPercent: newX, yPercent: newY } : b
            ),
        });
    }, [activeSlide, onUpdateSlide, slides]);

    const handleMouseUp = useCallback(() => {
        dragState.current.blockId = null;
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    const handleFuseAll = async () => {
        setIsFusing(true);
        const results: (string | null)[] = [...fusedImages];
        for (let i = 0; i < slides.length; i++) {
            try {
                const res = await fetch('/api/fuse-slide', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        backgroundBase64: slides[i].backgroundBase64,
                        textBlocks: slides[i].textBlocks,
                        platform,
                    }),
                });
                const data = await res.json();
                results[i] = data.image ?? null;
            } catch {
                results[i] = null;
            }
        }
        setFusedImages(results);
        setAllFused(results.every(r => r !== null));
        setIsFusing(false);
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const images = fusedImages.filter(Boolean) as string[];
            const fakeCarousel = {
                slides: slides.map((s, i) => ({
                    slideType: s.slideType,
                    title: `Slide ${i + 1}`,
                    content: ''
                })),
                caption
            };
            await downloadCarouselZip('carrossel', fakeCarousel, images);
        } catch (e) {
            console.error(e);
        }
        setIsDownloading(false);
    };

    return {
        activeSlide,
        setActiveSlide,
        selectedBlockId,
        setSelectedBlockId,
        selectedBlock,
        isFusing,
        fusedImages,
        isDownloading,
        allFused,
        canvasRef,
        updateBlock,
        handleDragStart,
        handleFuseAll,
        handleDownload,
        currentSlide,
    };
}
