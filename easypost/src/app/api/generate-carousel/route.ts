import { GoogleGenAI, Type } from "@google/genai";

export async function POST(req: Request) {
    try {
        const { topic, niche } = await req.json();

        if (!topic || !niche) {
            return new Response(JSON.stringify({ error: "Tópico e nicho são obrigatórios" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: "Chave da API não encontrada" }), { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });

        const prompt = `Você é um estrategista de conteúdo e copywriter expert em Instagram.
Tópico: "${topic}"
Nicho: "${niche}"

Objetivo: Criar o roteiro de um carrossel de 5 slides altamente envolvente para Instagram.

IMPORTANTE: Todo o conteúdo DEVE ser escrito em Português do Brasil.

Regras:
1. Slide 1 é o GANCHO que para o scroll. Precisa de um título grande e impactante.
2. Slides 2-4 entregam o valor principal ou os passos. O texto deve ser extremamente conciso (máximo 100 caracteres por conteúdo do slide). Formato de lista é ótimo.
3. Slide 5 é a Chamada para Ação (CTA) - ex: "Salve para depois", "Comente abaixo", "Link na bio".
4. Mantenha o 'title' curto (máximo 40 caracteres) e o 'content' curto (máximo 100 caracteres).
5. Para a 'caption', escreva uma legenda envolvente para Instagram incluindo emojis e exatamente 7 hashtags relevantes em português.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        slides: {
                            type: Type.ARRAY,
                            description: "Exatamente 5 slides",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING, description: "Título curto e impactante (máx 40 chars)" },
                                    content: { type: Type.STRING, description: "Texto principal do slide (máx 100 chars)" }
                                },
                                required: ["title", "content"]
                            }
                        },
                        caption: {
                            type: Type.STRING,
                            description: "Legenda do Instagram com hashtags"
                        }
                    },
                    required: ["slides", "caption"]
                }
            }
        });

        const jsonString = response.text;
        if (!jsonString) {
            throw new Error("Resposta vazia do Gemini");
        }

        const object = JSON.parse(jsonString);

        return new Response(JSON.stringify(object), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Erro ao gerar carrossel:", error);
        return new Response(JSON.stringify({ error: "Falha ao gerar carrossel" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
