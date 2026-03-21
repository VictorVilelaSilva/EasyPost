export interface SlideData {
    slideType: 'cover' | 'content' | 'cta';
    title: string;
    content: string;
}

export interface CarouselData {
    slides: SlideData[];
    caption: string;
}

export interface ImageConfig {
    audience: {
        age: string;
        interests: string;
    };
    customPrompt: string;
    handle?: string;
    slideCount?: number;
    color?: string;
}

export type Platform = 'instagram' | 'linkedin';

export type PostObjective = 'comercial' | 'informativo' | 'autoridade' | 'engajamento';

export interface PostConfig {
    platform: Platform;
    objective: PostObjective;
    slideCount: number;
}

// Legacy - kept for reference only
export interface SlideBackgrounds {
    cover: string[];
    content: string[];
    cta: string[];
}

export interface ReferenceImages {
    cover?: string;    // base64 data URL
    content?: string;  // base64 data URL
    cta?: string;      // base64 data URL
}

export interface TextBlock {
    id: string;
    text: string;
    xPercent: number;   // 0–100, relative to canvas width
    yPercent: number;   // 0–100, relative to canvas height
    fontSize: number;   // in display-canvas px (screen size)
    color: string;      // hex
    fontFamily: string;
    bold: boolean;
    italic: boolean;
    textAlign?: 'left' | 'center' | 'right';
}
