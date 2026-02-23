import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const { topic, niche } = await req.json();

        if (!topic || !niche) {
            return new Response(JSON.stringify({ error: "Topic and niche are required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const { object } = await generateObject({
            model: google("gemini-2.5-flash"),
            system: `You are an expert Instagram content strategist and copywriter. The user will provide a specific topic and a niche. 
Your goal is to script a highly engaging 5-slide Instagram carousel.

Rules for slides:
1. Slide 1 is the STOP-THE-SCROLL Hook. It needs a big, punchy title. 
2. Slide 2-4 provide the core value or steps. The text must be extremely concise (max 100 characters per slide content). Point form is great.
3. Slide 5 is the Call to Action (CTA) - e.g., "Save this for later", "Comment below", "Link in bio", etc.
4. Keep the 'title' short (max 40 chars) and the 'content' short (max 100 chars).
5. For the 'caption', write an engaging Instagram caption including emojis and exactly 7 relevant hashtags.`,
            prompt: `Generate the 5 slides and the caption for a carousel about "${topic}" in the "${niche}" niche.`,
            schema: z.object({
                slides: z.array(
                    z.object({
                        title: z.string().describe("Short, punchy headline for the slide (max 40 chars)"),
                        content: z.string().describe("Main text for the slide (max 100 chars)"),
                    })
                ).length(5, "Must provide exactly 5 slides"),
                caption: z.string().describe("The Instagram caption including hashtags"),
            }),
        });

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
