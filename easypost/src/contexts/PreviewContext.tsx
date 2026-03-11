'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Platform } from '@/types';

export interface PreviewData {
    images: string[];
    slideTypes: string[];
    caption: string;
    platform: Platform;
}

interface PreviewContextValue {
    previewData: PreviewData | null;
    setPreviewData: (data: PreviewData) => void;
    clearPreviewData: () => void;
}

const PreviewContext = createContext<PreviewContextValue>({
    previewData: null,
    setPreviewData: () => {},
    clearPreviewData: () => {},
});

export function PreviewProvider({ children }: { children: ReactNode }) {
    const [previewData, setPreviewDataState] = useState<PreviewData | null>(null);

    return (
        <PreviewContext.Provider value={{
            previewData,
            setPreviewData: setPreviewDataState,
            clearPreviewData: () => setPreviewDataState(null),
        }}>
            {children}
        </PreviewContext.Provider>
    );
}

export function usePreviewData() {
    return useContext(PreviewContext);
}
