import { GoogleGenAI, Type } from "@google/genai";

function truncateResearch(text: string, maxChars = 2000): string {
    return text.length <= maxChars ? text : text.slice(0, maxChars) + '...';
}

const LANGUAGE_MAP: Record<string, string> = {
    portugueseBR: "Português do Brasil",
    english: "English",
    spanish: "Español",
};

const PLATFORM_MAP: Record<string, { label: string; format: string }> = {
    instagram: {
        label: "Instagram",
        format: "carrossel de slides visuais para Instagram (1080x1080px, formato quadrado)",
    },
    linkedin: {
        label: "LinkedIn",
        format: "documento/carrossel para LinkedIn (formato profissional, slides educativos)",
    },
};

const OBJECTIVE_MAP: Record<string, string> = {
    commercial: "Tom PERSUASIVO e comercial. Foque em benefícios, transformação, urgência e chamadas para ação que convertam. Use gatilhos mentais como escassez, prova social e autoridade.",
    informative: "Tom EDUCATIVO e informativo. Foque em ensinar algo valioso, explicar conceitos de forma clara, usar analogias e exemplos práticos. O leitor deve sair sabendo mais do que antes.",
    authority: "Tom de AUTORIDADE e expertise. Use dados concretos, estatísticas, estudos de caso e provas. Posicione o autor como referência no assunto. Cite fontes quando possível.",
};

export async function POST(req: Request) {
    try {
        const { topic, niche, platform, objective, language, slidesCount } = await req.json();

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

        const langLabel = LANGUAGE_MAP[language] || "Português do Brasil";
        const platformInfo = PLATFORM_MAP[platform] || PLATFORM_MAP.instagram;
        const objectiveDesc = OBJECTIVE_MAP[objective] || OBJECTIVE_MAP.commercial;
        const totalSlides = slidesCount && slidesCount > 0 ? slidesCount : 5;
        const contentSlides = totalSlides - 2; // minus cover and CTA

        // Step 1: Research about the topic with Google Search
        let researchContext = "";
        try {
            const searchResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Pesquise sobre "${topic}" no contexto de "${niche}".

                    Busque:
                    - Dados e estatísticas recentes sobre o tema
                    - Fatos interessantes e pouco conhecidos
                    - Exemplos práticos e casos reais
                    - Tendências atuais relacionadas
                    - Dicas de especialistas sobre o assunto

                    Retorne um resumo organizado com as informações mais relevantes e impactantes encontradas.`,
                config: {
                    temperature: 0.3,
                    tools: [{ googleSearch: {} }],
                    systemInstruction: "Você é um pesquisador especializado em criar conteúdo baseado em dados reais. Busque informações factuais, recentes e verificáveis sobre o tema solicitado.",
                },
            });

            researchContext = truncateResearch(searchResponse.text || "");
        } catch (searchError) {
            console.warn("Google Search research failed, continuing without context:", searchError);
        }

        // Step 2: Generate carousel slides with research context + dynamic configs
        const researchSection = researchContext
            ? `\n\nPESQUISA DE BASE (use estes dados reais no conteúdo):\n${researchContext}\n`
            : "";

        const prompt = `Você é um estrategista de conteúdo e copywriter expert em ${platformInfo.label} para o mercado.
            Tópico: "${topic}"
            Nicho: "${niche}"
${researchSection}
            Objetivo: Criar o roteiro de um ${platformInfo.format} com exatamente ${totalSlides} slides.

            IMPORTANTE: Todo o conteúdo DEVE ser escrito em ${langLabel}.

            DIREÇÃO DO CONTEÚDO:
            ${objectiveDesc}
            ${researchContext ? "\nINCORPORE dados, estatísticas e fatos da pesquisa acima para dar credibilidade ao conteúdo." : ""}

            ESTRUTURA OBRIGATÓRIA DOS SLIDES:

            Slide 1 — CAPA (Gancho que para o scroll):
            - slideType: "cover"
            - title: Uma pergunta provocativa ou afirmação impactante que gere curiosidade (máx 50 chars). Exemplo: "ISSO VALE A PENA?", "PARE DE FAZER ISSO"
            - content: Um subtítulo curto complementando o gancho (máx 60 chars)

            Slides 2 a ${contentSlides + 1} — CONTEÚDO (Valor educativo):
            - slideType: "content"
            - title: Um subtítulo curto do bloco de conteúdo (máx 40 chars)
            - content: Texto educativo mais longo explicando o ponto, como se fosse um parágrafo de um post informativo. Pode ter de 150 a 300 caracteres. Use linguagem direta e conversacional.

            Slide ${totalSlides} — CTA (Chamada para Ação):
            - slideType: "cta"
            - title: "GOSTOU DO CONTEÚDO?" ou variação
            - content: "❤️ CURTA | 💬 COMENTE | ✈️ COMPARTILHE | 📌 SALVE"

            Para a 'caption', escreva uma legenda envolvente para ${platformInfo.label} incluindo emojis e exatamente 7 hashtags relevantes em ${langLabel}.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.7,
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
                            description: `Legenda para ${platformInfo.label} com hashtags`
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
