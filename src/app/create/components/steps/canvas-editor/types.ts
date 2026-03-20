import { TextBlock, Platform, SlideBackgrounds } from '@/types';

export type SlideType = 'cover' | 'content' | 'cta';

export interface SlideState {
    slideIndex: number;
    slideType: SlideType;
    backgroundBase64: string;
    textBlocks: TextBlock[];
    fusedImage: string | null;
}

export interface BgSelectionProps {
    backgrounds: SlideBackgrounds;
    selected: { cover: number; content: number; cta: number };
    onSelect: (type: SlideType, index: number) => void;
    onContinue: () => void;
    onBack: () => void;
}

export interface TextBlockProps {
    block: TextBlock;
    isSelected: boolean;
    canvasH: number;
    onSelect: () => void;
    onDragStart: (blockId: string, mouseX: number, mouseY: number) => void;
}

export interface PropertiesPanelProps {
    block: TextBlock | null;
    onChange: (patch: Partial<TextBlock>) => void;
}

export interface CanvasEditorProps {
    slides: SlideState[];
    platform: Platform;
    caption: string;
    onUpdateSlide: (index: number, patch: Partial<SlideState>) => void;
    onBack: () => void;
    onGoToPreview?: (fusedImages: string[]) => void;
    onFusedImagesChange?: (images: (string | null)[]) => void;
}
