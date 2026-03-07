import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { TextBlock, Platform } from '@/types';

export const maxDuration = 60;

function buildFusePrompt(textBlocks: TextBlock[], platform: Platform): string {
    const dimensions = platform === 'instagram' ? '1080x1350px' : '1080x1080px';

    const blocksDesc = textBlocks.map((b, i) => {
        const sizeLabel = b.fontSize > 30 ? 'grande e impactante' : b.fontSize > 18 ? 'medio' : 'pequeno';
        const style = [b.bold ? 'negrito' : '', b.italic ? 'italico' : ''].filter(Boolean).join(', ') || 'normal';
        return `${i + 1}. Texto: "${b.text}"
   Posicao: ${b.xPercent.toFixed(0)}% da esquerda, ${b.yPercent.toFixed(0)}% do topo
   Tamanho: ${sizeLabel} (${b.fontSize}px)
   Cor: ${b.color}
   Estilo: ${style}
   Fonte: ${b.fontFamily}`;
    }).join('\n\n');

    return `Voce e um designer grafico especialista em composicao visual para redes sociais.

Edite esta imagem de fundo para adicionar os seguintes elementos de texto de forma organica e visualmente refinada.
Mantenha o estilo visual existente (cores, texturas, elementos decorativos) intactos.

ELEMENTOS DE TEXTO A ADICIONAR:
${blocksDesc}

REGRAS OBRIGATORIAS:
- Preserve COMPLETAMENTE o fundo original: cores, texturas, linhas decorativas, icones
- Os textos devem parecer que FAZEM PARTE do design original
- Use as posicoes indicadas como referencia central de cada bloco de texto
- Garanta que o texto seja legivel com contraste adequado
- Respeite as cores e estilos de fonte especificados
- Dimensoes finais: ${dimensions}`;
}

export async function POST(req: NextRequest) {
    try {
        const { backgroundBase64, textBlocks, platform = 'instagram' } = await req.json() as {
            backgroundBase64: string;
            textBlocks: TextBlock[];
            platform: Platform;
        };

        if (!backgroundBase64) {
            return NextResponse.json({ error: "Imagem de fundo e obrigatoria" }, { status: 400 });
        }
        if (!textBlocks || textBlocks.length === 0) {
            return NextResponse.json({ error: "Blocos de texto sao obrigatorios" }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Chave da API nao encontrada" }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });
        const prompt = buildFusePrompt(textBlocks, platform);

        const response = await ai.models.generateContent({
            model: "gemini-3-pro-image-preview",
            contents: [
                {
                    inlineData: {
                        mimeType: "image/png",
                        data: backgroundBase64,
                    }
                },
                { text: prompt }
            ] as unknown as string,
            config: {
                aspectRatio: platform === 'instagram' ? '4:5' : '1:1',
            } as unknown as Record<string, unknown>
        });

        let base64Result: string | null = null;
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    base64Result = part.inlineData.data ?? null;
                    break;
                }
            }
        }

        if (!base64Result) {
            throw new Error("Nenhuma imagem retornada pelo Gemini");
        }

        return NextResponse.json({ image: `data:image/png;base64,${base64Result}` }, { status: 200 });

    } catch (error: unknown) {
        console.error("Erro ao fundir slide:", error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message || "Falha ao fundir slide" }, { status: 500 });
        }
        return NextResponse.json({ error: "Falha ao fundir slide" }, { status: 500 });
    }
}
