import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60; // Allow more time for image generation

export async function POST(req: NextRequest) {
    try {
        const { slides } = await req.json();

        if (!slides || !Array.isArray(slides) || slides.length === 0) {
            return NextResponse.json({ error: "Slides array is required" }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Missing API key" }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });

        // Process all slides in parallel to save time
        const imagePromises = slides.map(async (slide: { title: string, content: string }, index: number) => {
            const prompt = `A highly engaging, minimalist, and aesthetic Instagram carousel slide graphic. 
The background should be a sleek dark gradient (like dark navy to black).
The text on the image MUST prominently feature the following headline: "${slide.title}".
Below the headline, include exactly this text: "${slide.content}".
At the very bottom, include small text that says: "${index + 1} / ${slides.length}".
The typography should be modern, clean, sans-serif, and highly legible with high contrast against the dark background. 
This is an educational social media graphic. Do not add any irrelevant objects.`;

            const response = await ai.models.generateContent({
                model: "gemini-3-pro-image-preview",
                contents: prompt,
            });

            let base64Image = null;
            if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        base64Image = part.inlineData.data;
                        break;
                    }
                }
            }

            if (!base64Image) {
                throw new Error("No image data returned from Google API");
            }

            return `data:image/png;base64,${base64Image}`;
        });

        const generatedImages = await Promise.all(imagePromises);

        return NextResponse.json({ images: generatedImages }, { status: 200 });

    } catch (error: any) {
        console.error("Error generating images:", error);
        return NextResponse.json({ error: error.message || "Failed to generate images" }, { status: 500 });
    }
}
