import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import sharp from 'sharp';
import { overlayTextOnImage } from '@/lib/textOverlay';
import { SlideData, Platform, DesignSystem } from '@/types';

export const maxDuration = 60;

function buildPrompt(
    slide: SlideData,
    index: number,
    totalSlides: number,
    designSystem: DesignSystem,
    platform: Platform,
    hasLogo: boolean
): string {
    const dimensions = platform === 'instagram'
        ? '4:5 retrato, 1080x1350px'
        : '1:1 quadrado, 1080x1080px';

    const slideType = slide.slideType || 'content';

    const commonRules = `
REGRAS CRITICAS:
- NAO renderize NENHUM texto, letra, numero ou caractere na imagem.
- A imagem deve ser PURAMENTE visual/decorativa.
- NAO coloque foto de pessoa.
- Mantenha areas centrais limpas e com bom contraste para texto sobreposto posteriormente.
${hasLogo ? '- Canto inferior esquerdo: DEIXE UMA AREA COMPLETAMENTE VAZIA para logo.' : ''}`;

    const designContext = `
DESIGN SYSTEM (SEGUIR OBRIGATORIAMENTE para manter consistencia entre slides):
- Cor principal: ${designSystem.background.primaryColor}
- Cor secundaria: ${designSystem.background.secondaryColor}
- Cor de acento: ${designSystem.accent}
- Estilo decorativo: ${designSystem.decorativeStyle}
- Mood: ${designSystem.moodKeywords.join(', ')}`;

    if (slideType === 'cover') {
        return `Gere um grafico de FUNDO de capa de carrossel para ${platform === 'instagram' ? 'Instagram' : 'LinkedIn'} (${dimensions}).

${designContext}

LAYOUT DA CAPA:
${designSystem.coverSlide.backgroundDescription}
- Elemento decorativo: ${designSystem.coverSlide.decorativeElement}
- ZONA CENTRAL (badge + titulo): DEIXAR COM FUNDO SOLIDO OU SUTIL para texto sobreposto
- O fundo deve ter contraste suficiente para texto branco e texto escuro

${commonRules}`;
    }

    if (slideType === 'cta') {
        return `Gere um grafico de FUNDO de slide CTA (Call to Action) de carrossel para ${platform === 'instagram' ? 'Instagram' : 'LinkedIn'} (${dimensions}).

${designContext}

LAYOUT DO CTA:
${designSystem.ctaSlide.backgroundDescription}
- ZONA CENTRAL: DEIXAR LIMPA para badge e texto sobreposto
- ZONA ABAIXO DO CENTRO: DEIXAR LIMPA para icones de acao sobrepostos

${commonRules}`;
    }

    // Content slides
    return `Gere um grafico de FUNDO de slide de conteudo de carrossel para ${platform === 'instagram' ? 'Instagram' : 'LinkedIn'} (${dimensions}).
Este e o slide ${index + 1} de ${totalSlides}.

${designContext}

LAYOUT DO CONTEUDO:
${designSystem.contentSlide.backgroundDescription}
- Elementos decorativos sutis nos cantos/bordas seguindo o estilo: ${designSystem.decorativeStyle}
- ZONA CENTRAL (70% da area): DEIXAR COMPLETAMENTE LIMPA para texto branco sobreposto
- Icone sutil de "deslizar" (seta para direita) no canto superior direito, opacidade 20-30%

${commonRules}`;
}

async function overlayLogo(imageBase64: string, logoDataUrl: string): Promise<string> {
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    const logoBase64 = logoDataUrl.split(',')[1];
    const logoBuffer = Buffer.from(logoBase64, 'base64');

    const resizedLogo = await sharp(logoBuffer)
        .resize({ width: 80, height: 80, fit: 'inside' })
        .toBuffer();

    const logoMeta = await sharp(resizedLogo).metadata();
    const logoHeight = logoMeta.height || 80;

    const margin = 50;
    const imageMeta = await sharp(imageBuffer).metadata();
    const imageHeight = imageMeta.height || 1350;

    const result = await sharp(imageBuffer)
        .composite([{
            input: resizedLogo,
            left: margin,
            top: imageHeight - logoHeight - margin,
        }])
        .png()
        .toBuffer();

    return result.toString('base64');
}

export async function POST(req: NextRequest) {
    try {
        const {
            slides,
            designSystem,
            platform = 'instagram',
            brandColors,
            fontFamily = 'Inter',
        } = await req.json();

        const logoDataUrl: string | undefined = brandColors?.logoDataUrl;

        if (logoDataUrl && logoDataUrl.length > 2_800_000) {
            return NextResponse.json({ error: "Logo muito grande. Use uma imagem menor (max. 2MB)." }, { status: 400 });
        }

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

        const designSystemColors = {
            badgeColor: designSystem.coverSlide?.badgeColor || designSystem.background?.primaryColor,
            textColor: designSystem.textColor,
            accent: designSystem.accent,
        };

        const imagePromises = slides.map(async (slide: SlideData, index: number) => {
            const prompt = buildPrompt(slide, index, slides.length, designSystem, platform, !!logoDataUrl);

            const response = await ai.models.generateContent({
                model: "gemini-3-pro-image-preview",
                contents: prompt,
                config: {
                    aspectRatio: platform === 'instagram' ? '4:5' : '1:1',
                } as unknown as Record<string, unknown>
            });

            let base64Image = null;
            if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        base64Image = part.inlineData.data;
                        break;
                    }
                }
            }

            if (!base64Image) {
                throw new Error("Nenhuma imagem retornada pela API do Google");
            }

            // Overlay text programmatically
            base64Image = await overlayTextOnImage(
                base64Image,
                slide,
                platform,
                fontFamily,
                designSystemColors
            );

            // Overlay logo if provided
            if (logoDataUrl) {
                base64Image = await overlayLogo(base64Image, logoDataUrl);
            }

            return `data:image/png;base64,${base64Image}`;
        });

        const generatedImages = await Promise.all(imagePromises);

        return NextResponse.json({ images: generatedImages }, { status: 200 });

    } catch (error: unknown) {
        console.error("Erro ao gerar imagens:", error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message || "Falha ao gerar imagens" }, { status: 500 });
        }
        return NextResponse.json({ error: "Falha ao gerar imagens" }, { status: 500 });
    }
}
