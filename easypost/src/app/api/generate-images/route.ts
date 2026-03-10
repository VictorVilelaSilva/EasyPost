import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { SlideData, Platform, DesignSystem } from '@/types';

export const maxDuration = 120;

function buildSlidePrompt(
    slide: SlideData,
    designSystem: DesignSystem,
    platform: Platform,
    handle: string,
): string {
    const dimensions = platform === 'instagram'
        ? '4:5 portrait, 1080x1350px'
        : '1:1 square, 1080x1080px';

    const designContext = `VISUAL STYLE:
- Primary color: ${designSystem.background.primaryColor}
- Secondary color: ${designSystem.background.secondaryColor}
- Accent color: ${designSystem.accent}
- Text color: ${designSystem.textColor}
- Decorative style: ${designSystem.decorativeStyle}
- Mood: ${designSystem.moodKeywords.join(', ')}`;

    const handleLine = handle ? `\nHandle/Username: "${handle}"` : '';

    if (slide.slideType === 'cover') {
        return `Generate a complete, ready-to-post cover slide for a ${platform === 'instagram' ? 'Instagram' : 'LinkedIn'} carousel (${dimensions}).

${designContext}
Background visual: ${designSystem.coverSlide.backgroundDescription}
Decorative element: ${designSystem.coverSlide.decorativeElement}

TEXT TO RENDER (render exactly these words with beautiful, legible typography):
Title: "${slide.title}"
${slide.content ? `Subtitle: "${slide.content}"` : ''}${handleLine}

LAYOUT: Large, impactful title centered or upper area. Subtitle as elegant smaller text below. Strong visual background that frames the text beautifully.

REQUIREMENTS:
- Text must be clearly readable with excellent contrast against the background
- Professional social media quality, polished and modern
- No extra UI elements, no watermarks, no placeholder boxes`;
    }

    if (slide.slideType === 'cta') {
        return `Generate a complete, ready-to-post CTA (call-to-action) slide for a ${platform === 'instagram' ? 'Instagram' : 'LinkedIn'} carousel (${dimensions}).

${designContext}
Background visual: ${designSystem.ctaSlide.backgroundDescription}

TEXT TO RENDER (render exactly these words with beautiful, legible typography):
Title (main CTA): "${slide.title}"
${slide.content ? `Supporting text: "${slide.content}"` : ''}${handleLine}

LAYOUT: Action-focused design. Title as the bold, compelling main call-to-action. Supporting text below. Handle/username prominently displayed if provided.

REQUIREMENTS:
- Text must be clearly readable with excellent contrast
- High-energy, action-driving visual composition
- No extra UI elements, no watermarks`;
    }

    // content slide
    return `Generate a complete, ready-to-post content slide for a ${platform === 'instagram' ? 'Instagram' : 'LinkedIn'} carousel (${dimensions}).

${designContext}
Background visual: ${designSystem.contentSlide.backgroundDescription}

TEXT TO RENDER (render exactly these words with beautiful, legible typography):
Title/Header: "${slide.title}"
${slide.content ? `Body text: "${slide.content}"` : ''}${handleLine}

LAYOUT: Clear header with the title at top. Readable body text content below, well-structured with good whitespace. Clean, information-focused layout.

REQUIREMENTS:
- Text must be clearly readable with excellent contrast
- Clean and professional social media quality
- No extra UI elements, no watermarks`;
}

async function generateSlideImage(
    slide: SlideData,
    designSystem: DesignSystem,
    platform: Platform,
    handle: string,
    ai: GoogleGenAI,
): Promise<string> {
    const prompt = buildSlidePrompt(slide, designSystem, platform, handle);

    const response = await ai.models.generateContent({
        model: "gemini-3-pro-image-preview",
        contents: prompt,
        config: {
            aspectRatio: platform === 'instagram' ? '4:5' : '1:1',
        } as unknown as Record<string, unknown>
    });

    let base64Image: string | null = null;
    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                base64Image = part.inlineData.data ?? null;
                break;
            }
        }
    }

    if (!base64Image) throw new Error(`Nenhuma imagem retornada para slide tipo ${slide.slideType}`);
    return base64Image;
}

export async function POST(req: NextRequest) {
    try {
        const { slides, designSystem, platform = 'instagram', handle = '' } = await req.json();

        if (!slides || !Array.isArray(slides) || slides.length === 0) {
            return NextResponse.json({ error: "Array de slides e obrigatorio" }, { status: 400 });
        }
        if (!designSystem) {
            return NextResponse.json({ error: "Design system e obrigatorio" }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Chave da API nao encontrada" }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });

        // Generate 1 complete image per slide in parallel (text + background combined)
        const images = await Promise.all(
            slides.map((slide: SlideData) =>
                generateSlideImage(slide, designSystem, platform as Platform, handle, ai)
            )
        );

        return NextResponse.json({ images }, { status: 200 });

    } catch (error: unknown) {
        console.error("Erro ao gerar imagens:", error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message || "Falha ao gerar imagens" }, { status: 500 });
        }
        return NextResponse.json({ error: "Falha ao gerar imagens" }, { status: 500 });
    }
}
