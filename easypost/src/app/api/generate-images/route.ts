import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import sharp from 'sharp';

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
    light: "Clean light/white background (#f8fafc). Dark navy text (#1e293b). Subtle soft shadows.",
    blue: "Rich blue palette. Deep navy background (#1e3a5f) with electric blue accents (#2563eb, #60a5fa). White text.",
    green: "Nature-inspired green palette. Dark emerald (#064e3b) background, mint and teal accents (#059669, #34d399). White text.",
    warm: "Warm sunset palette. Deep orange-brown (#7c2d12) background, vibrant orange accents (#ea580c, #fb923c). Cream text.",
    purple: "Royal purple palette. Deep violet (#3b0764) background, lavender accents (#7c3aed, #a78bfa). White text.",
};

function buildPrompt(
    slide: { slideType: string; title: string; content: string },
    index: number,
    totalSlides: number,
    styleDesc: string,
    paletteDesc: string,
    brandDesc: string,
    audienceDesc: string,
    customDesc: string,
    hasLogo: boolean
): string {
    const slideType = slide.slideType || 'content';
    console.log("Building prompt for slide:", slide, "index:", index, "totalSlides:", totalSlides);

    if (slideType === 'cover') {
        return `Gere um gráfico de CAPA de carrossel para Instagram (1:1 quadrado, 1080x1080px).

            ESTILO DE REFERÊNCIA: Post educativo brasileiro profissional.
            ${styleDesc ? `ESTILO ADICIONAL: ${styleDesc}` : ''}
            ${brandDesc || (paletteDesc ? `PALETA: ${paletteDesc}` : '')}
            ${audienceDesc}
            ${customDesc}

            LAYOUT DA CAPA:
            - Fundo claro/branco clean com textura sutil de papel.
            - Um elemento visual decorativo relacionado ao tema no canto inferior direito (ex: produto, ilustração 3D, objeto temático).
            - Uma faixa/badge retangular arredondada em azul marinho escuro (#1a2744) no centro-esquerda da imagem.
            - DENTRO do badge: O título principal em BRANCO, fonte serif bold, CAIXA ALTA.
            - Abaixo do badge: O subtítulo em azul marinho escuro, fonte serif, CAIXA ALTA.
            ${hasLogo ? '- Canto inferior esquerdo: DEIXE UMA ÁREA LIVRE (sem texto, sem ícone) para inserção posterior de logo.' : ''}

            TEXTO A RENDERIZAR (EXATAMENTE, sem inventar):
            - TÍTULO (dentro do badge): "${slide.title}"
            - SUBTÍTULO (abaixo do badge): "${slide.content}"

            REGRAS:
            - Tipografia serif elegante (estilo editorial).
            - NÃO adicione texto inventado, gibberish ou nomes de pessoas.
            - O texto DEVE estar em Português do Brasil.
            - Este é um gráfico de mídia social profissional.`;
    }

    if (slideType === 'cta') {
        return `Gere um gráfico de CTA (Call to Action) de carrossel para Instagram (1:1 quadrado, 1080x1080px).

            ESTILO DE REFERÊNCIA: Post educativo brasileiro profissional.
            ${styleDesc ? `ESTILO ADICIONAL: ${styleDesc}` : ''}
            ${brandDesc || (paletteDesc ? `PALETA: ${paletteDesc}` : '')}
            ${audienceDesc}
            ${customDesc}

            LAYOUT DO CTA:
            - Fundo claro/branco clean.
            - No centro-esquerda: Uma faixa/badge retangular arredondada em azul marinho escuro (#1a2744).
            - DENTRO do badge: "${slide.title}" em BRANCO, fonte serif bold, CAIXA ALTA.
            - Abaixo do badge, listar verticalmente com ícones:
            ❤️ CURTA
            💬 COMENTE
            ✈️ COMPARTILHE
            - Cada item com o ícone correspondente ao lado, texto em azul marinho, fonte serif, CAIXA ALTA.
            ${hasLogo ? '- Canto inferior esquerdo: DEIXE UMA ÁREA LIVRE (sem texto, sem ícone) para inserção posterior de logo.' : ''}

            REGRAS:
            - Tipografia serif elegante.
            - NÃO invente texto ou nomes de pessoas. NÃO coloque foto de pessoa.
            - O texto DEVE estar em Português do Brasil.`;
    }

    // Content slides (slideType === 'content')
    return `Gere um gráfico de slide de CONTEÚDO de carrossel para Instagram (1:1 quadrado, 1080x1080px).

            ESTILO DE REFERÊNCIA: Post educativo brasileiro profissional.
            ${styleDesc ? `ESTILO ADICIONAL: ${styleDesc}` : ''}
            ${brandDesc || (paletteDesc ? `PALETA: ${paletteDesc}` : '')}
            ${audienceDesc}
            ${customDesc}

            LAYOUT DO CONTEÚDO:
            - Fundo azul marinho escuro sólido (#1a2744) ou gradiente escuro elegante.
            - Um ícone de "deslizar" (mão apontando para direita) no canto superior direito em branco.
            - O texto principal em BRANCO, fonte serif, CAIXA ALTA, ocupando a maior parte da imagem.
            - O texto deve ser grande, legível, e preencher bem o espaço.
            ${hasLogo ? '- Canto inferior esquerdo: DEIXE UMA ÁREA LIVRE (sem texto, sem ícone) para inserção posterior de logo.' : ''}

            TEXTO A RENDERIZAR (EXATAMENTE, sem inventar):
            - CORPO DO TEXTO: "${slide.content}"

            REGRAS:
            - Tipografia serif elegante (tipo editorial/revista).
            - Texto grande, ocupando 60-70% da área da imagem.
            - NÃO adicione texto inventado ou gibberish.
            - NÃO coloque foto de pessoa.
            - O texto DEVE estar em Português do Brasil.`;
}

async function overlayLogo(imageBase64: string, logoDataUrl: string): Promise<string> {
    // Decode base64 image
    const imageBuffer = Buffer.from(imageBase64, 'base64');

    // Decode logo data URL (strip "data:image/...;base64," prefix)
    const logoBase64 = logoDataUrl.split(',')[1];
    const logoBuffer = Buffer.from(logoBase64, 'base64');

    // Resize logo to fit nicely in bottom-left (~80px)
    const resizedLogo = await sharp(logoBuffer)
        .resize({ width: 80, height: 80, fit: 'inside' })
        .toBuffer();

    // Get logo metadata after resize for positioning
    const logoMeta = await sharp(resizedLogo).metadata();
    const logoWidth = logoMeta.width || 80;
    const logoHeight = logoMeta.height || 80;

    const margin = 50;
    const imageSize = 1080; // Generated images are 1080x1080

    // Composite logo on bottom-left
    const result = await sharp(imageBuffer)
        .composite([{
            input: resizedLogo,
            left: margin,
            top: imageSize - logoHeight - margin,
        }])
        .png()
        .toBuffer();

    return result.toString('base64');
}

export async function POST(req: NextRequest) {
    try {
        const { slides, visualStyle, colorPalette, brandColors, audience, customPrompt } = await req.json();
        const logoDataUrl: string | undefined = brandColors?.logoDataUrl;

        // Validate logo size (max ~2MB base64)
        if (logoDataUrl && logoDataUrl.length > 2_800_000) {
            return NextResponse.json({ error: "Logo muito grande. Use uma imagem menor (máx. 2MB)." }, { status: 400 });
        }

        if (!slides || !Array.isArray(slides) || slides.length === 0) {
            return NextResponse.json({ error: "Array de slides é obrigatório" }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Chave da API não encontrada" }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });

        const styleDesc = STYLE_MAP[visualStyle] || '';
        const paletteDesc = PALETTE_MAP[colorPalette] || '';

        // Build brand colors description
        const brandColorsArray: string[] = brandColors?.colors || [];
        const brandDesc = brandColorsArray.length > 0
            ? `CORES DA MARCA (USE OBRIGATORIAMENTE): As cores da identidade visual da marca são: ${brandColorsArray.join(', ')}. Use a primeira cor como cor principal (backgrounds e badges), a segunda como cor de texto/contraste, e as demais como acentos. Toda a identidade visual do slide deve seguir essa paleta.`
            : '';

        const audienceDesc = (audience?.age || audience?.interests)
            ? `Público-Alvo: ${audience.age ? `Idade ${audience.age}` : ''}${audience.age && audience.interests ? ', ' : ''}${audience.interests ? `interessado em ${audience.interests}` : ''}. O design deve ressoar com esse público.`
            : '';
        const customDesc = customPrompt ? `Instruções Adicionais: ${customPrompt}` : '';

        const imagePromises = slides.map(async (slide: { slideType: string; title: string; content: string }, index: number) => {
            const prompt = buildPrompt(slide, index, slides.length, styleDesc, paletteDesc, brandDesc, audienceDesc, customDesc, !!logoDataUrl);

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
                throw new Error("Nenhuma imagem retornada pela API do Google");
            }

            // Overlay logo if provided
            if (logoDataUrl) {
                base64Image = await overlayLogo(base64Image, logoDataUrl);
            }

            return `data:image/png;base64,${base64Image}`;
        });

        const generatedImages = await Promise.all(imagePromises);

        return NextResponse.json({ images: generatedImages }, { status: 200 });

    } catch (error: any) {
        console.error("Erro ao gerar imagens:", error);
        return NextResponse.json({ error: error.message || "Falha ao gerar imagens" }, { status: 500 });
    }
}
