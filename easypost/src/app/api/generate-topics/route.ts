import { GoogleGenAI, Type } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { niche, platform, objective } = await req.json();

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

    const platformLabel = platform === 'linkedin' ? 'LinkedIn' : 'Instagram';
    const objectiveMap: Record<string, string> = {
      comercial: 'vendas e conversão',
      informativo: 'educar e informar o público',
      autoridade: 'posicionamento como especialista e autoridade',
      engajamento: 'gerar interação, comentários e compartilhamentos',
    };
    const objectiveDesc = objectiveMap[objective] || '';

    const prompt = `Você é um estrategista de conteúdo expert em ${platformLabel}. O usuário vai fornecer um nicho de conteúdo. Seu trabalho é gerar exatamente 15 temas de posts de carrossel para ${platformLabel} altamente envolventes, em alta e compartilháveis para esse nicho.

      Os temas DEVEM ser escritos em Português do Brasil.
      Os temas devem ser chamativos, específicos e acionáveis.
      ${objectiveDesc ? `O objetivo dos posts é: ${objectiveDesc}. Os temas devem refletir isso.` : ''}
      Exemplos de formato: "5 Ganchos para Prender a Atenção", "O Segredo por Trás de [X]", "Pare de Fazer Isso no [X]".

      Nicho: "${niche}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topics: {
              type: Type.ARRAY,
              description: "Exatamente 15 temas de carrossel",
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
