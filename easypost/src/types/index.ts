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
    visualStyle: string;
    colorPalette: string;
    audience: {
        age: string;
        interests: string;
    };
    customPrompt: string;
}
