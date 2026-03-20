'use client';

import { useState, useCallback } from 'react';
import { Platform } from '@/types';
import { downloadCarouselZip } from '@/lib/downloadZip';

const CTA_STORAGE_KEY = 'easypost_default_cta_image';

interface CompareData {
    original: string;
    edited: string;
    index: number;
}

export function usePreviewLogic(
    initialImages: string[],
    slideTypes: string[],
    caption: string,
    platform: Platform,
) {
    const [images, setImages] = useState<string[]>(initialImages);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [compareData, setCompareData] = useState<CompareData | null>(null);

    const handleDownload = useCallback(async () => {
        setIsDownloading(true);
        try {
            const fakeCarousel = {
                slides: slideTypes.map((type, i) => ({
                    slideType: type as 'cover' | 'content' | 'cta',
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
    }, [images, slideTypes, caption]);

    const handleEditSlide = useCallback(async (index: number, prompt: string) => {
        setIsEditing(true);
        setEditingIndex(index);
        try {
            const res = await fetch('/api/edit-slide', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageBase64: images[index],
                    editPrompt: prompt,
                    platform,
                }),
            });
            const data = await res.json();
            if (data.image) {
                setCompareData({
                    original: images[index],
                    edited: data.image,
                    index,
                });
            }
        } catch (e) {
            console.error('Erro ao editar slide:', e);
        }
        setIsEditing(false);
        setEditingIndex(null);
    }, [images, platform]);

    const handleAcceptEdit = useCallback((): string[] | null => {
        if (!compareData) return null;
        const updated = images.map((img, i) => i === compareData.index ? compareData.edited : img);
        setImages(updated);
        setCompareData(null);
        return updated;
    }, [compareData, images]);

    const handleRejectEdit = useCallback(() => {
        setCompareData(null);
    }, []);

    const handleSaveCtaDefault = useCallback((imageDataUri: string) => {
        try {
            localStorage.setItem(CTA_STORAGE_KEY, imageDataUri);
        } catch (e) {
            console.error('Erro ao salvar CTA padrao:', e);
        }
    }, []);

    const handleLoadCtaDefault = useCallback((): string | null => {
        try {
            return localStorage.getItem(CTA_STORAGE_KEY);
        } catch {
            return null;
        }
    }, []);

    return {
        images,
        activeIndex,
        setActiveIndex,
        isDownloading,
        isEditing,
        editingIndex,
        compareData,
        handleDownload,
        handleEditSlide,
        handleAcceptEdit,
        handleRejectEdit,
        handleSaveCtaDefault,
        handleLoadCtaDefault,
    };
}
