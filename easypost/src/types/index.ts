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

export interface DesignSystem {
    background: {
        type: 'solid' | 'gradient' | 'pattern';
        primaryColor: string;
        secondaryColor: string;
        gradientDirection: string;
    };
    coverSlide: {
        backgroundDescription: string;
        badgeColor: string;
        decorativeElement: string;
    };
    contentSlide: {
        backgroundDescription: string;
    };
    ctaSlide: {
        backgroundDescription: string;
    };
    accent: string;
    textColor: string;
    decorativeStyle: string;
    moodKeywords: string[];
    templateId?: string;
}
