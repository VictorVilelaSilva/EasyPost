export interface SlideData {
    slideType: 'cover' | 'content' | 'cta';
    title: string;
    content: string;
}

export interface CarouselData {
    slides: SlideData[];
    caption: string;
}

export interface BrandColors {
    colors: string[];        // Array of hex colors
    logoDataUrl?: string;    // Base64 data URL of uploaded logo
}

export interface ImageConfig {
    visualStyle: string;
    colorPalette: string;
    brandColors: BrandColors;
    audience: {
        age: string;
        interests: string;
    };
    customPrompt: string;
    fontFamily?: string;
}

export type Platform = 'instagram' | 'linkedin';

export type PostObjective = 'comercial' | 'informativo' | 'autoridade' | 'engajamento';

export interface PostConfig {
    platform: Platform;
    objective: PostObjective;
    slideCount: number;
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
}
