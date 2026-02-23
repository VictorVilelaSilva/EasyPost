import { GoogleGenAI, Type } from "@google/genai";

export async function POST(req: Request) {
    try {
        const { topic, niche } = await req.json();

        if (!topic || !niche) {
            return new Response(JSON.stringify({ error: "Topic and niche are required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: "Missing API key" }), { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });

        const prompt = `You are an expert Instagram content strategist and copywriter. 
Topic: "${topic}"
Niche: "${niche}"

Goal: Script a highly engaging 5-slide Instagram carousel.
Rules:
1. Slide 1 is the STOP-THE-SCROLL Hook. It needs a big, punchy title. 
2. Slide 2-4 provide the core value or steps. The text must be extremely concise (max 100 characters per slide content). Point form is great.
3. Slide 5 is the Call to Action (CTA).
4. Keep the 'title' short (max 40 chars) and the 'content' short (max 100 chars).
5. For the 'caption', write an engaging Instagram caption including emojis and exactly 7 relevant hashtags.`;

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
                            description: "Exactly 5 slides",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING, description: "Short, punchy headline (max 40 chars)" },
                                    content: { type: Type.STRING, description: "Main text for the slide (max 100 chars)" }
                                },
                                required: ["title", "content"]
                            }
                        },
                        caption: {
                            type: Type.STRING,
                            description: "The Instagram caption including hashtags"
                        }
                    },
                    required: ["slides", "caption"]
                }
            }
        });

        const jsonString = response.text;
        if (!jsonString) {
            throw new Error("Empty response from Gemini");
        }

        const object = JSON.parse(jsonString);

        return new Response(JSON.stringify(object), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error generating carousel:", error);
        return new Response(JSON.stringify({ error: "Failed to generate carousel" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
