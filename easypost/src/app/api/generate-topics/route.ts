import { GoogleGenAI, Type } from "@google/genai";

function truncateResearch(text: string, maxChars = 2000): string {
  return text.length <= maxChars ? text : text.slice(0, maxChars) + '...';
}

const LANGUAGE_MAP: Record<string, string> = {
  portugueseBR: "Português do Brasil",
  english: "English",
  spanish: "Español",
};

const PLATFORM_MAP: Record<string, string> = {
  instagram: "Instagram (carrosséis visuais, Reels, Stories)",
  linkedin: "LinkedIn (posts profissionais, artigos, documents)",
};

export async function POST(req: Request) {
  try {
    const { niche, platform, language } = await req.json();

    if (!niche) {
      return new Response(JSON.stringify({ error: "Nicho é obrigatório" }), {
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
    const platformLabel = PLATFORM_MAP[platform] || PLATFORM_MAP.instagram;

    // Step 1: Google Search grounding to find real trending topics
    let searchContext = "";
    try {
      const searchResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Pesquise tendências recentes e tópicos virais sobre "${niche}" na plataforma ${platformLabel}.

Busque:
- Assuntos que estão em alta agora nesse nicho
- Formatos de conteúdo que estão viralizando
- Dúvidas frequentes do público sobre esse tema
- Dados recentes, estatísticas ou novidades do setor

Retorne um resumo organizado das tendências encontradas.`,
        config: {
          temperature: 0.4,
          tools: [{ googleSearch: {} }],
          systemInstruction: `Você é um analista de tendências digitais especializado em ${platformLabel}. Pesquise informações reais e recentes sobre o nicho solicitado. Foque em tendências dos últimos 30 dias.`,
        },
      });

      searchContext = truncateResearch(searchResponse.text || "");
    } catch (searchError) {
      console.warn("Google Search grounding failed, continuing without search context:", searchError);
    }

    // Step 2: Structured output — generate exactly 6 topics
    const contextSection = searchContext
      ? `\n\nPESQUISA DE TENDÊNCIAS REAIS (use como base):\n${searchContext}\n`
      : "";

    const prompt = `Você é um estrategista de conteúdo expert em ${platformLabel}. O usuário vai fornecer um nicho de conteúdo. Seu trabalho é gerar exatamente 6 temas de posts altamente envolventes, em alta e compartilháveis para esse nicho.
${contextSection}
Os temas DEVEM ser escritos em ${langLabel}.
Os temas devem ser chamativos, específicos e acionáveis.
${searchContext ? "Baseie os temas nas tendências reais encontradas na pesquisa acima." : ""}
Exemplos de formato: "5 Ganchos para Prender a Atenção", "O Segredo por Trás de [X]", "Pare de Fazer Isso no [X]".

Nicho: "${niche}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topics: {
              type: Type.ARRAY,
              description: "Exatamente 6 temas de conteúdo",
              items: { type: Type.STRING }
            }
          },
          required: ["topics"]
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
    console.error("Erro ao gerar tópicos:", error);
    return new Response(JSON.stringify({ error: "Falha ao gerar tópicos" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
