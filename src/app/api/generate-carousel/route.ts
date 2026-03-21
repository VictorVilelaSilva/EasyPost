import { GoogleGenAI, Type } from "@google/genai";

export async function POST(req: Request) {
    try {
        const { topic, niche, platform, objective, slideCount, textFormat = '' } = await req.json();

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

            Objetivo: Criar o roteiro de um carrossel de ${totalSlides} slides para ${platformLabel} altamente engajador, com conteúdo direto e escaneável.
            ${objectiveInstructions ? `OBJETIVO DO POST: ${objectiveInstructions}` : ''}

            IMPORTANTE: Todo o conteúdo DEVE ser escrito em Português do Brasil.

            REGRA CRITICA: O texto dos slides NAO pode conter emojis, icones, simbolos especiais ou caracteres graficos de nenhum tipo. Apenas texto puro com letras, numeros e pontuacao padrao. Essa regra e inegociavel e se aplica a TODOS os campos (title e content) de TODOS os slides.

            ESTRUTURA OBRIGATÓRIA DOS SLIDES:

            Slide 1 — CAPA (Gancho para prender a atenção):
            - slideType: "cover"
            - title: Título em Grande Destaque (pergunta provocativa ou afirmação impactante sobre a dor/solução do nicho). Exemplo: "Na minha máquina funciona! Como acabar com esse pesadelo"
            - content: Subtítulo ou breve texto complementando o gancho inicial.

            Slides 2 a ${totalSlides - 1} — CONTEÚDO (Desenvolvimento, total de ${contentSlides} slides):
            - slideType: "content"
            - title: Título do Slide (Grande e Destaque, focando no ponto principal ou benefício).
            ${textFormat === 'continuous'
                ? '- content: Corpo do texto em formato de paragrafo corrido, fluido e narrativo. NAO use listas, bullet points ou quebras de linha (\\n). Escreva como um texto continuo e coeso que conta uma ideia de forma natural.'
                : '- content: Corpo do texto em pontos curtos, claros e diretos. Separe cada ponto com quebra de linha (\\n). Termine o texto com uma frase curta de destaque para fechar a ideia do slide.'}

            Slide ${totalSlides} — CTA (Chamada para Ação):
            - slideType: "cta"
            - title: Uma pergunta ou afirmação conectando o tema à ação desejada. Ex: "E voce, ainda sofre com [problema]?"
            - content: Chamadas diretas em formato de lista. Ex: "Salve para nao esquecer... | Compartilhe com... | Comente: qual o seu maior desafio com..."

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
        console.log("Resposta bruta do Gemini:", jsonString);

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
