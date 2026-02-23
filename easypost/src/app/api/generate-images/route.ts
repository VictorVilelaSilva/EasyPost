import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60;

const STYLE_MAP: Record<string, string> = {
    minimalist: "Ultra-clean minimalist design. White space, thin lines, simple geometric shapes. Flat colors, no textures.",
    luxury: "Luxurious, premium aesthetic. Rich deep colors, gold or silver accents, elegant sophisticated feel. Subtle leather or marble textures.",
    corporate: "Professional corporate design. Clean structured layout, trustworthy blue tones, sharp edges. Business-oriented, polished.",
    'clean-tech': "Modern tech aesthetic. Sleek gradients, subtle glassmorphism, futuristic feel. Neon accents on dark background.",
    creative: "Bold creative design. Vibrant colors, artistic flair, dynamic compositions. Hand-drawn elements or paint strokes mixed with typography.",
    neon: "Neon glow aesthetic. Dark black background with vivid neon lights (pink, cyan, purple). Cyberpunk-inspired glow effects around text.",
};

const PALETTE_MAP: Record<string, string> = {
    dark: "Dark gradient background (deep navy #0f172a to black #000). White and light gray text for contrast.",
    light: "Clean light/white background (#f8fafc). Dark text (#1e293b). Subtle soft shadows.",
    blue: "Rich blue palette. Deep navy background (#1e3a5f) with electric blue accents (#2563eb, #60a5fa). White text.",
    green: "Nature-inspired green palette. Dark emerald (#064e3b) background, mint and teal accents (#059669, #34d399). White text.",
    warm: "Warm sunset palette. Deep orange-brown (#7c2d12) background, vibrant orange accents (#ea580c, #fb923c). Cream text.",
    purple: "Royal purple palette. Deep violet (#3b0764) background, lavender accents (#7c3aed, #a78bfa). White text.",
};

export async function POST(req: NextRequest) {
    try {
        const { slides, visualStyle, colorPalette, audience, customPrompt } = await req.json();

        if (!slides || !Array.isArray(slides) || slides.length === 0) {
            return NextResponse.json({ error: "Slides array is required" }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Missing API key" }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });

        // Build dynamic prompt sections from config
        const styleDesc = STYLE_MAP[visualStyle] || STYLE_MAP['minimalist'];
        const paletteDesc = PALETTE_MAP[colorPalette] || PALETTE_MAP['dark'];
        const audienceDesc = (audience?.age || audience?.interests)
            ? `Público-Alvo: ${audience.age ? `Idade ${audience.age}` : ''}${audience.age && audience.interests ? ', ' : ''}${audience.interests ? `interessado em ${audience.interests}` : ''}. O design deve ressoar com esse público.`
            : '';
        const customDesc = customPrompt ? `Instruções Adicionais: ${customPrompt}` : '';

        const imagePromises = slides.map(async (slide: { title: string, content: string }, index: number) => {
            const prompt = `Gere um gráfico de slide de carrossel Instagram bonito, de altíssima qualidade (proporção estritamente 1:1 quadrado, 1080x1080px).

ESTILO VISUAL: ${styleDesc}
PALETA DE CORES: ${paletteDesc}
${audienceDesc}
${customDesc}

LAYOUT:
- Composição perfeitamente centralizada e equilibrada para formato 1:1 quadrado.
- Tipografia: Fontes sans-serif modernas, ousadas, impactantes e grandes. Altamente legíveis.

TEXTO PARA RENDERIZAR (EXATAMENTE como mostrado, sem texto extra):
- TÍTULO: "${slide.title}"
- CORPO: "${slide.content}"
- RODAPÉ: "${index + 1} / ${slides.length}"

REGRAS CRÍTICAS:
- O texto DEVE ser o ponto focal.
- Contraste perfeito entre texto e fundo.
- NÃO adicione nenhum texto inventado, aleatório ou sem sentido. APENAS renderize o texto fornecido acima.
- Este é um gráfico profissional de mídia social, não uma foto.
- O texto dentro da imagem DEVE estar em Português do Brasil.`;

            const response = await ai.models.generateContent({
                model: "gemini-3-pro-image-preview",
                contents: prompt,
                config: {
                    aspectRatio: "1:1"
                } as any
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
