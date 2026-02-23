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

        const prompt = `Você é um estrategista de conteúdo e copywriter expert em Instagram para o mercado brasileiro.
Tópico: "${topic}"
Nicho: "${niche}"

Objetivo: Criar o roteiro de um carrossel de 5 slides para Instagram no estilo educativo/informativo brasileiro.

IMPORTANTE: Todo o conteúdo DEVE ser escrito em Português do Brasil.

ESTRUTURA OBRIGATÓRIA DOS SLIDES:

Slide 1 — CAPA (Gancho que para o scroll):
- slideType: "cover"
- title: Uma pergunta provocativa ou afirmação impactante que gere curiosidade (máx 50 chars). Exemplo: "ISSO VALE A PENA?", "PARE DE FAZER ISSO"
- content: Um subtítulo curto complementando o gancho (máx 60 chars)

Slides 2 e 3 — CONTEÚDO (Valor educativo):
- slideType: "content"
- title: Um subtítulo curto do bloco de conteúdo (máx 40 chars)
- content: Texto educativo mais longo explicando o ponto, como se fosse um parágrafo de um post informativo. Pode ter de 150 a 300 caracteres. Use linguagem direta, conversacional, em caixa alta seria ideal.

Slide 4 — CONTEÚDO FINAL (Conclusão/Insight):
- slideType: "content"
- title: Conclusão ou insight final (máx 40 chars)
- content: Texto de 150-300 chars com o argumento final, conselho prático ou dado que fecha o raciocínio.

Slide 5 — CTA (Chamada para Ação):
- slideType: "cta"
- title: "GOSTOU DO CONTEÚDO?" ou variação
- content: "❤️ CURTA | 💬 COMENTE | ✈️ COMPARTILHE | 📌 SALVE"

Para a 'caption', escreva uma legenda envolvente para Instagram incluindo emojis e exatamente 7 hashtags relevantes em português.`;

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
                                    slideType: { type: Type.STRING, description: "Tipo do slide: cover, content, ou cta" },
                                    title: { type: Type.STRING, description: "Título do slide" },
                                    content: { type: Type.STRING, description: "Texto principal do slide" }
                                },
                                required: ["slideType", "title", "content"]
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
