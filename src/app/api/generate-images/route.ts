import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { SlideData, Platform } from '@/types';

export const maxDuration = 120;

function buildSlidePrompt(
    slide: SlideData,
    slideNumber: number,
    totalSlides: number,
    platform: Platform,
    handle: string,
    color: string,
): string {
    const dimensions = platform === 'instagram'
        ? '4:5 portrait, 1080x1350px'
        : '1:1 square, 1080x1080px';

    const platformLabel = platform === 'instagram' ? 'Instagram' : 'LinkedIn';
    const handleLine = handle ? `\n\n[Handle/Username]\n"${handle}"` : '';

    const colorMeta = color ? `\nPaleta de Cores Principal: ${color}.` : '';
    const metaContext = `[CONTEXTO INTERNO - NAO RENDERIZAR COMO TEXTO NA IMAGEM]
Plataforma: ${platformLabel}. Formato: ${dimensions}. Slide ${slideNumber} de ${totalSlides}.${colorMeta}
As informacoes acima sao apenas contexto para guiar o design. Elas NAO devem aparecer escritas na imagem em nenhuma hipotese.`;

    if (slide.slideType === 'cover') {
        return `${metaContext}

            Crie o slide de CAPA de um carrossel. Este slide precisa fazer a pessoa parar o scroll e querer ver os proximos ${totalSlides - 1} slides.

            [Titulo Principal]
            "${slide.title}"
            ${slide.content ? `
            [Subtitulo]
            "${slide.content}"` : ''}${handleLine}

            Direcao visual:
            - Gere a imagem final completa com o texto incorporado na arte.
            ${color ? `- Utilize obrigatoriamente a cor hexadecimal ${color} como base ou elemento dominante da identidade visual.` : ''}
            - O titulo deve dominar a peca e ficar legivel em tela de celular.
            - Use ilustracoes ou elementos visuais coerentes com o tema.
            - O UNICO texto que deve aparecer na imagem e o Titulo, Subtitulo e Handle listados acima. NENHUM outro texto, rodape, legenda, dimensao, nome de plataforma ou metadado deve ser renderizado.`;
    }

    if (slide.slideType === 'cta') {
        return `${metaContext}

                Crie o slide final de CTA de um carrossel.

                [Titulo Principal]
                "${slide.title}"

                [Chamada para Acao]
                ${slide.content || ''}${handleLine}

                Direcao visual:
                - Gere a imagem final completa com o texto incorporado na arte.
                ${color ? `- Utilize obrigatoriamente a cor hexadecimal ${color} como base ou elemento dominante da identidade visual.` : ''}
                - Layout limpo, objetivo e orientado para acao.
                - Composicao energica focada em engajamento.
                - O UNICO texto que deve aparecer na imagem e o Titulo, Chamada para Acao e Handle listados acima. NENHUM outro texto, rodape, legenda, dimensao, nome de plataforma ou metadado deve ser renderizado.`;
    }

    return `${metaContext}

                Crie o slide ${slideNumber} de conteudo de um carrossel.

                [Titulo Principal]
                "${slide.title}"

                [Corpo do Texto]
                ${slide.content || ''}${handleLine}

                Direcao visual:
                - Gere a imagem final completa com o texto incorporado na arte.
                ${color ? `- Utilize obrigatoriamente a cor hexadecimal ${color} como base ou elemento dominante da identidade visual.` : ''}
                - O titulo deve ficar em grande destaque.
                - O corpo deve ser organizado em blocos curtos, escaneaveis e bem distribuidos.
                - Quando houver lista, use apoio visual com icones simples e relevantes.
                - Design editorial, moderno, premium e muito legivel no mobile.
                - O UNICO texto que deve aparecer na imagem e o Titulo, Corpo do Texto e Handle listados acima. NENHUM outro texto, rodape, legenda, dimensao, nome de plataforma ou metadado deve ser renderizado.`;
}

async function generateSlideImage(
    slide: SlideData,
    slideNumber: number,
    totalSlides: number,
    platform: Platform,
    handle: string,
    ai: GoogleGenAI,
    color: string,
    referenceImageBase64?: string,
): Promise<string> {
    const prompt = buildSlidePrompt(slide, slideNumber, totalSlides, platform, handle, color);

    const contents = referenceImageBase64
        ? [
            { inlineData: { mimeType: 'image/png', data: referenceImageBase64 } },
            { text: `Use a imagem acima como referencia visual. O slide que voce vai gerar agora DEVE seguir exatamente o mesmo estilo(Não necessariamente replicando os elementos, mas sim a identidade visual))${color ? `, paleta de cores (baseada em ${color})` : ''}, tipografia e identidade visual da capa.\n\n${prompt}` },
        ]
        : prompt;

    const response = await ai.models.generateContent({
        model: "gemini-3-pro-image-preview",
        contents,
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
        const { slides, platform = 'instagram', handle = '', color = '' } = await req.json();

        if (!slides || !Array.isArray(slides) || slides.length === 0) {
            return NextResponse.json({ error: "Array de slides e obrigatorio" }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Chave da API nao encontrada" }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });

        // 1) Generate cover slide first to establish visual identity
        const coverImage = await generateSlideImage(
            slides[0], 1, slides.length, platform as Platform, handle, ai, color
        );

        // 2) Generate remaining slides in parallel, using cover as visual reference
        const remainingImages = slides.length > 1
            ? await Promise.all(
                slides.slice(1).map((slide: SlideData, index: number) =>
                    generateSlideImage(slide, index + 2, slides.length, platform as Platform, handle, ai, color, coverImage)
                )
            )
            : [];

        const images = [coverImage, ...remainingImages];

        return NextResponse.json({ images }, { status: 200 });

    } catch (error: unknown) {
        console.error("Erro ao gerar imagens:", error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message || "Falha ao gerar imagens" }, { status: 500 });
        }
        return NextResponse.json({ error: "Falha ao gerar imagens" }, { status: 500 });
    }
}
