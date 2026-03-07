import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
    try {
        const { niche } = await req.json() as { niche: string };

        if (!niche?.trim()) {
            return NextResponse.json({ error: 'Nicho é obrigatório' }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Chave da API não encontrada' }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });

        const prompt = `Você é um estrategista de conteúdo para redes sociais especializado no nicho de "${niche}".

            Use a busca na web para identificar os 6 tópicos mais quentes, tendências e assuntos em alta AGORA dentro deste nicho.

            Para cada tópico, retorne um objeto JSON com:
            - "title": título curto e impactante para um post de carrossel (máximo 5 palavras)
            - "description": descrição de 1 frase explicando o ângulo do conteúdo (máximo 15 palavras)

            Retorne APENAS um array JSON válido com exatamente 6 objetos, sem texto adicional, sem markdown, sem código fence.

            Exemplo do formato esperado:
            [{"title":"Título Aqui","description":"Descrição curta e direta do conteúdo."},...]`;

        const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite-preview',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            } as unknown as Record<string, unknown>,
        });

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

        // Extract JSON array from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('Resposta inválida do modelo');
        }

        const suggestions = JSON.parse(jsonMatch[0]) as { title: string; description: string }[];

        const result = suggestions.slice(0, 6).map((s, i) => ({
            id: i + 1,
            title: s.title,
            description: s.description,
        }));

        return NextResponse.json({ suggestions: result }, { status: 200 });

    } catch (error: unknown) {
        console.error('Erro ao gerar sugestões:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message || 'Falha ao gerar sugestões' }, { status: 500 });
        }
        return NextResponse.json({ error: 'Falha ao gerar sugestões' }, { status: 500 });
    }
}
