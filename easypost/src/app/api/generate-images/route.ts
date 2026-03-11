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
): string {
    const dimensions = platform === 'instagram'
        ? '4:5 portrait, 1080x1350px'
        : '1:1 square, 1080x1080px';

    const platformLabel = platform === 'instagram' ? 'Instagram' : 'LinkedIn';
    const handleLine = handle ? `\n\n[Handle/Username]\n"${handle}"` : '';

    if (slide.slideType === 'cover') {
        return `Vamos criar o slide ${slideNumber} de um carrossel para ${platformLabel} (${dimensions}).

            Esse slide e a CAPA. Ele precisa fazer a pessoa parar o scroll e querer continuar vendo os proximos ${totalSlides - 1} slides.

            [Titulo do Slide - Grande e Destaque]
            "${slide.title}"
            ${slide.content ? `
            [Subtitulo ou Texto de Apoio]
            "${slide.content}"` : ''}${handleLine}

            Direcao visual:
            - Gere a imagem final completa, pronta para postagem, com o texto incorporado na arte.
            - O titulo deve dominar a peca e ficar legivel em tela de celular.
            - Use ilustracoes, simbolos ou elementos visuais coerentes com a dor ou beneficio principal do slide.
            - Nao adicione marcas d'agua, molduras de interface ou elementos extras sem funcao.`;
    }

    if (slide.slideType === 'cta') {
        return `Agora vamos para o slide ${slideNumber} com os seguintes elementos:

                [Titulo do Slide - Grande e Destaque]
                "${slide.title}"

                [Corpo do Texto - Chamadas diretas]
                ${slide.content || ''}${handleLine}

                Esse e o slide final de CTA do carrossel para ${platformLabel} (${dimensions}).

                Direcao visual:
                - Gere a imagem final completa, pronta para postagem, com o texto incorporado na arte.
                - O layout deve ser limpo, objetivo e orientado para acao.
                - Crie uma composicao energica com foco em salvar, comentar e compartilhar.
                - Nao adicione marcas d'agua, elementos de UI falsos ou ruido visual desnecessario.`;
    }

    return `Agora vamos para o slide ${slideNumber} de conteudo com os seguintes elementos:
                [Dimensão do Slide]
                Esse e um slide de conteudo do carrossel para ${platformLabel} (${dimensions}).
                [Titulo do Slide - Grande e Destaque]
                "${slide.title}"

                [Corpo do Texto - Pontos curtos]
                ${slide.content || ''}${handleLine}


                Direcao visual:
                - Gere a imagem final completa, pronta para postagem, com o texto incorporado na arte.
                - O titulo deve ficar em grande destaque.
                - O corpo deve ser organizado em blocos curtos, escaneaveis e bem distribuidos no layout.
                - Quando houver lista, use apoio visual com icones simples e relevantes.
                - Se houver uma frase de fechamento no fim do conteudo, trate-a como destaque visual de rodape.
                - Use recursos graficos que reforcem a explicacao, como comparacoes simples, diagramas leves ou elementos tematicos.
                - O design precisa parecer editorial, moderno, premium e muito legivel no mobile.
                - Nao adicione marcas d'agua, elementos de interface falsos ou enfeites desnecessarios.`;
}

async function generateSlideImage(
    slide: SlideData,
    slideNumber: number,
    totalSlides: number,
    platform: Platform,
    handle: string,
    ai: GoogleGenAI,
    referenceImageBase64?: string,
): Promise<string> {
    const prompt = buildSlidePrompt(slide, slideNumber, totalSlides, platform, handle);

    const contents = referenceImageBase64
        ? [
            { inlineData: { mimeType: 'image/png', data: referenceImageBase64 } },
            { text: `Use a imagem acima como referencia visual. O slide que voce vai gerar agora DEVE seguir exatamente o mesmo estilo, paleta de cores, tipografia e identidade visual da capa.\n\n${prompt}` },
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
        const { slides, platform = 'instagram', handle = '' } = await req.json();

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
            slides[0], 1, slides.length, platform as Platform, handle, ai
        );

        // 2) Generate remaining slides in parallel, using cover as visual reference
        const remainingImages = slides.length > 1
            ? await Promise.all(
                slides.slice(1).map((slide: SlideData, index: number) =>
                    generateSlideImage(slide, index + 2, slides.length, platform as Platform, handle, ai, coverImage)
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
