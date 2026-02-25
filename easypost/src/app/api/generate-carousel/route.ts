import { GoogleGenAI, Type } from "@google/genai";

export async function POST(req: Request) {
    try {
        const { topic, niche, platform, objective, slideCount } = await req.json();

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

        const platformLabel = platform === 'linkedin' ? 'LinkedIn' : 'Instagram';
        const totalSlides = slideCount || 5;
        const contentSlides = Math.max(1, totalSlides - 2); // minus cover + CTA

        const objectiveMap: Record<string, string> = {
            comercial: 'Tom persuasivo, focado em benefícios e conversão. CTA orientado à venda.',
            informativo: 'Tom educativo, linguagem didática e acessível. CTA orientado a salvar/compartilhar.',
            autoridade: 'Tom confiante e especializado. Dados e insights exclusivos. CTA orientado a seguir.',
            engajamento: 'Tom conversacional e provocativo. Perguntas e debates. CTA orientado a comentar.',
        };
        const objectiveInstructions = objectiveMap[objective] || '';

        const captionLabel = platform === 'linkedin'
            ? 'uma legenda profissional para LinkedIn incluindo 5 hashtags relevantes em português'
            : 'uma legenda envolvente para Instagram incluindo emojis e exatamente 7 hashtags relevantes em português';

        const prompt = `Você é um estrategista de conteúdo e copywriter expert em ${platformLabel} para o mercado brasileiro.
            Tópico: "${topic}"
            Nicho: "${niche}"

            Objetivo: Criar o roteiro de um carrossel de ${totalSlides} slides para ${platformLabel}.
            ${objectiveInstructions ? `OBJETIVO DO POST: ${objectiveInstructions}` : ''}

            IMPORTANTE: Todo o conteúdo DEVE ser escrito em Português do Brasil.

            ESTRUTURA OBRIGATÓRIA DOS SLIDES:

            Slide 1 — CAPA (Gancho que para o scroll):
            - slideType: "cover"
            - title: Uma pergunta provocativa ou afirmação impactante que gere curiosidade (máx 50 chars). Exemplo: "ISSO VALE A PENA?", "PARE DE FAZER ISSO"
            - content: Um subtítulo curto complementando o gancho (máx 60 chars)

            Slides 2 a ${totalSlides - 1} — CONTEÚDO (Valor educativo, total de ${contentSlides} slides):
            - slideType: "content"
            - title: Um subtítulo curto do bloco de conteúdo (máx 40 chars)
            - content: Texto educativo mais longo explicando o ponto, como se fosse um parágrafo de um post informativo. Pode ter de 150 a 300 caracteres. Use linguagem direta, conversacional.

            Slide ${totalSlides} — CTA (Chamada para Ação):
            - slideType: "cta"
            - title: "GOSTOU DO CONTEÚDO?" ou variação
            - content: "❤️ CURTA | 💬 COMENTE | ✈️ COMPARTILHE | 📌 SALVE"

            Para a 'caption', escreva ${captionLabel}.`;

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
                            description: `Exatamente ${totalSlides} slides`,
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
                            description: `Legenda do ${platformLabel} com hashtags`
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
