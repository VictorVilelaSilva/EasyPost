import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const { niche } = await req.json();

    if (!niche) {
      return new Response(JSON.stringify({ error: "Niche is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      system: `You are an expert Instagram content strategist. The user will provide a content niche. Your job is to generate exactly 15 highly engaging, trending, and highly shareable Instagram post topics (carousel ideas) for that niche. Topics should be catchy, specific, and actionable. Example formatting: '5 Hooks to Grab Attention', 'The Secret Behind [X]'.`,
      prompt: `Generate 15 trending Instagram carousel topics for the niche: "${niche}".`,
      schema: z.object({
        topics: z.array(z.string()).length(15, "Must provide exactly 15 topics"),
      }),
    });

    return new Response(JSON.stringify(object), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating topics:", error);
    return new Response(JSON.stringify({ error: "Failed to generate topics" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
