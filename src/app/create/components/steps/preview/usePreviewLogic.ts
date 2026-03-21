'use client';

import { useState, useCallback } from 'react';
import { Platform } from '@/types';
import { downloadCarouselZip } from '@/lib/downloadZip';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

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
    const [onEditLimitReached, setOnEditLimitReached] = useState<((info: { type: 'carousel' | 'edit'; tier: string }) => void) | null>(null);

    const getAuthHeaders = async (): Promise<Record<string, string>> => {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const currentUser = auth.currentUser;
        if (currentUser) {
            const token = await currentUser.getIdToken();
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    };

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
            toast.error('Falha ao baixar o pacote');
        }
        setIsDownloading(false);
    }, [images, slideTypes, caption]);

    const handleEditSlide = useCallback(async (index: number, prompt: string) => {
        setIsEditing(true);
        setEditingIndex(index);
        try {
            const headers = await getAuthHeaders();
            const res = await fetch('/api/edit-slide', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    imageBase64: images[index],
                    editPrompt: prompt,
                    platform,
                }),
            });

            if (res.status === 429) {
                const limitData = await res.json();
                onEditLimitReached?.({ type: 'edit', tier: limitData.tier });
                setIsEditing(false);
                setEditingIndex(null);
                return;
            }

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
            toast.error('Erro ao editar slide. Tente novamente.');
        }
        setIsEditing(false);
        setEditingIndex(null);
    }, [images, platform, onEditLimitReached]);

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
        onEditLimitReached,
        setOnEditLimitReached,
    };
}
