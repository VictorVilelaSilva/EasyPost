import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { Platform } from '@/types';
import { checkUsageLimit, incrementUsage } from '@/lib/usageLimits';
import { logCreation } from '@/lib/creationLog';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        // Check edit usage limit
        const usage = await checkUsageLimit(req, 'edit');
        if (!usage.allowed) {
            return NextResponse.json({
                error: 'Limite de edições atingido',
                tier: usage.tier,
                remaining: usage.remaining,
                limit: usage.limit,
            }, { status: 429 });
        }

        const { imageBase64, editPrompt, platform = 'instagram' } = await req.json() as {
            imageBase64: string;
            editPrompt: string;
            platform: Platform;
        };

        if (!imageBase64) {
            return NextResponse.json({ error: "Imagem é obrigatória" }, { status: 400 });
        }
        if (!editPrompt || editPrompt.trim().length === 0) {
            return NextResponse.json({ error: "Instrução de edição é obrigatória" }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Chave da API não encontrada" }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });

        // Strip data URI prefix if present
        const base64Data = imageBase64.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");

        const prompt = `Voce e um designer grafico de elite. Edite esta imagem de post para rede social conforme a instrucao abaixo.

INSTRUCAO DO USUARIO: ${editPrompt}

REGRAS:
- Aplique APENAS a alteracao solicitada
- Mantenha todos os outros elementos intactos (textos, cores, layout)
- O resultado deve continuar parecendo uma peca de design profissional
- Dimensoes finais: ${platform === 'instagram' ? '1080x1350px' : '1080x1080px'}`;

        const response = await ai.models.generateContent({
            model: "gemini-3-pro-image-preview",
            contents: [
                {
                    inlineData: {
                        mimeType: "image/png",
                        data: base64Data,
                    }
                },
                { text: prompt }
            ] as unknown as string,
            config: {
                aspectRatio: platform === 'instagram' ? '4:5' : '1:1',
                responseModalities: ['TEXT', 'IMAGE'],
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

        // Increment edit counter after success
        const identifier = usage.userId || usage.ipHash!;
        await incrementUsage(identifier, 'edit', !usage.userId);

        // Fire-and-forget creation log
        logCreation({
            userId: usage.userId ?? null,
            ipHash: usage.userId ? null : usage.ipHash ?? null,
            action: 'edit',
            platform,
            slideCount: 1,
        });

        return NextResponse.json({ image: `data:image/png;base64,${base64Result}` }, { status: 200 });

    } catch (error: unknown) {
        console.error("Erro ao editar slide:", error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message || "Falha ao editar slide" }, { status: 500 });
        }
        return NextResponse.json({ error: "Falha ao editar slide" }, { status: 500 });
    }
}
