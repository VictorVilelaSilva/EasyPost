import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';
import { SlideData, Platform, DesignSystem } from '@/types';

export const maxDuration = 120;

const SLIDE_TYPES = ['cover', 'content', 'cta'] as const;
type SlideType = typeof SLIDE_TYPES[number];

function buildBackgroundPrompt(
    slideType: SlideType,
    variantIndex: number,
    designSystem: DesignSystem,
    platform: Platform,
): string {
    const dimensions = platform === 'instagram'
        ? '4:5 retrato, 1080x1350px'
        : '1:1 quadrado, 1080x1080px';

    const variantHint = variantIndex > 0
        ? `\nVARIACAO ${variantIndex + 1}: Crie uma composicao diferente das anteriores, mantendo o mesmo estilo mas com elementos decorativos em posicoes distintas.`
        : '';

    const commonRules = `
        REGRAS CRITICAS:
        - NAO renderize NENHUM texto, letra, numero ou caractere na imagem.
        - A imagem deve ser PURAMENTE visual/decorativa.
        - NAO coloque foto de pessoa.
        - Mantenha TODA a area central limpa e com bom contraste para texto sobreposto posteriormente.${variantHint}`;

    const designContext = `
DESIGN SYSTEM:
- Cor principal: ${designSystem.background.primaryColor}
- Cor secundaria: ${designSystem.background.secondaryColor}
- Cor de acento: ${designSystem.accent}
- Estilo decorativo: ${designSystem.decorativeStyle}
- Mood: ${designSystem.moodKeywords.join(', ')}`;

    if (slideType === 'cover') {
        return `Gere um grafico de FUNDO de capa de carrossel para ${platform === 'instagram' ? 'Instagram' : 'LinkedIn'} (${dimensions}).
            ${designContext}
            LAYOUT:
            ${designSystem.coverSlide.backgroundDescription}
            - Elemento decorativo: ${designSystem.coverSlide.decorativeElement}
            - ZONA CENTRAL: DEIXAR LIMPA para texto sobreposto
            ${commonRules}`;
    }

    if (slideType === 'cta') {
        return `Gere um grafico de FUNDO de slide CTA de carrossel para ${platform === 'instagram' ? 'Instagram' : 'LinkedIn'} (${dimensions}).
            ${designContext}
            LAYOUT:
            ${designSystem.ctaSlide.backgroundDescription}
            - ZONA CENTRAL: DEIXAR COMPLETAMENTE LIMPA
            ${commonRules}`;
    }

    return `Gere um grafico de FUNDO de slide de conteudo de carrossel para ${platform === 'instagram' ? 'Instagram' : 'LinkedIn'} (${dimensions}).
${designContext}
LAYOUT:
${designSystem.contentSlide.backgroundDescription}
- ZONA CENTRAL (70% da area): DEIXAR COMPLETAMENTE LIMPA para texto
${commonRules}`;
}

async function generateBackground(
    slideType: SlideType,
    variantIndex: number,
    designSystem: DesignSystem,
    platform: Platform,
    ai: GoogleGenAI,
): Promise<string> {
    const prompt = buildBackgroundPrompt(slideType, variantIndex, designSystem, platform);

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

    if (!base64Image) throw new Error(`Nenhuma imagem retornada para tipo ${slideType} variante ${variantIndex}`);
    return base64Image;
}

export async function POST(req: NextRequest) {
    try {
        const { slides, designSystem, platform = 'instagram' } = await req.json();

        if (!slides || !Array.isArray(slides) || slides.length === 0) {
            return NextResponse.json({ error: "Array de slides e obrigatorio" }, { status: 400 });
        }
        if (!designSystem) {
            return NextResponse.json({ error: "Design system e obrigatorio" }, { status: 400 });
        }

        // Template natureza: use static template images (no AI generation)
        if (designSystem.templateId === 'natureza') {
            const base = path.join(process.cwd(), 'public', 'templates', 'natureza');
            const coverBuf = fs.readFileSync(path.join(base, 'capa', 'capa.png'));
            const contentBuf = fs.readFileSync(path.join(base, 'conteudo', 'conteudo.png'));
            const ctaBuf = fs.readFileSync(path.join(base, 'final', 'final.png'));
            return NextResponse.json({
                backgrounds: {
                    cover: [coverBuf.toString('base64')],
                    content: [contentBuf.toString('base64')],
                    cta: [ctaBuf.toString('base64')],
                }
            }, { status: 200 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Chave da API nao encontrada" }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });
        const VARIANTS = 3;

        // Generate 3 variants per slide type in parallel
        const [coverVariants, contentVariants, ctaVariants] = await Promise.all(
            SLIDE_TYPES.map(slideType =>
                Promise.all(
                    Array.from({ length: VARIANTS }, (_, i) =>
                        generateBackground(slideType, i, designSystem, platform as Platform, ai)
                    )
                )
            )
        );

        return NextResponse.json({
            backgrounds: {
                cover: coverVariants,
                content: contentVariants,
                cta: ctaVariants,
            }
        }, { status: 200 });

    } catch (error: unknown) {
        console.error("Erro ao gerar fundos:", error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message || "Falha ao gerar fundos" }, { status: 500 });
        }
        return NextResponse.json({ error: "Falha ao gerar fundos" }, { status: 500 });
    }
}
