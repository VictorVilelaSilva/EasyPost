import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const STYLE_MAP: Record<string, string> = {
    // IDs emitidos por VisualStyleGallery
    'ai-generated': 'Crie um estilo visual único, criativo e autoral baseado inteiramente no conteúdo e público-alvo fornecidos. Surpreenda com uma identidade visual original.',
    'upload': '',
    'tech-start': 'Minimalista tech. Interface limpa e moderna, tipografia bold em fundo escuro (slate-900), gradientes sutis índigo/violeta, elementos geométricos precisos e amplo espaço negativo.',
    'developer-pro': 'Dark code editor. Fundo carbono escuro (#0d1117), tipografia monospace, acentos em verde terminal (#22c55e) e cyan (#22d3ee), dots coloridos no topo simulando janela de terminal.',
}

const PALETTE_MAP: Record<string, string> = {
    dark: 'Dark gradient (deep navy #0f172a to black). White/light gray text.',
    light: 'Clean light/white background (#f8fafc). Dark navy text (#1e293b).',
    blue: 'Deep navy (#1e3a5f) with electric blue accents (#2563eb, #60a5fa). White text.',
    green: 'Dark emerald (#064e3b), mint/teal accents (#059669, #34d399). White text.',
    warm: 'Deep orange-brown (#7c2d12), vibrant orange accents (#ea580c, #fb923c). Cream text.',
    purple: 'Deep violet (#3b0764), lavender accents (#7c3aed, #a78bfa). White text.',
};

export async function POST(req: NextRequest) {
    try {
        const { slides, visualStyle, colorPalette, brandColors, audience, platform, topicContext } = await req.json();

        if (visualStyle === 'natureza') {
            const base = path.join(process.cwd(), 'public', 'templates', 'natureza');
            const capaPrompt = fs.readFileSync(path.join(base, 'capa', 'prompt.txt'), 'utf-8');
            const conteudoPrompt = fs.readFileSync(path.join(base, 'conteudo', 'prompt.txt'), 'utf-8');
            const finalPrompt = fs.readFileSync(path.join(base, 'final', 'prompt.txt'), 'utf-8');

            return NextResponse.json({
                background: {
                    type: 'solid',
                    primaryColor: '#f0ece0',
                    secondaryColor: '#f0ece0',
                    gradientDirection: 'none',
                },
                coverSlide: {
                    backgroundDescription: capaPrompt,
                    badgeColor: '#2d4a1e',
                    decorativeElement: 'Linhas horizontais finas com ponta de seta à direita no topo e na base, ícone de faísca de 4 pontas no canto inferior direito em creme claro',
                },
                contentSlide: {
                    backgroundDescription: conteudoPrompt,
                },
                ctaSlide: {
                    backgroundDescription: finalPrompt,
                },
                accent: '#2d4a1e',
                textColor: '#2d4a1e',
                decorativeStyle: 'Linhas horizontais finas terminando em ponta de seta à direita, ícone de faísca sutil no canto inferior direito',
                moodKeywords: ['editorial', 'natural', 'orgânico', 'minimalista', 'refinado'],
                templateId: 'natureza',
            }, { status: 200 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Chave da API nao encontrada' }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });

        const styleDesc = STYLE_MAP[visualStyle] || '';
        const paletteDesc = PALETTE_MAP[colorPalette] || '';
        const brandColorsArray: string[] = brandColors?.colors || [];

        const brandDesc = brandColorsArray.length > 0
            ? `CORES DA MARCA (OBRIGATORIO): ${brandColorsArray.join(', ')}. Use a primeira como cor principal, a segunda como contraste, demais como acentos.`
            : '';

        const audienceDesc = audience?.interests
            ? `Publico-Alvo: interessado em ${audience.interests}.`
            : '';

        const topicDesc = topicContext
            ? `Contexto do conteudo: ${topicContext}.`
            : '';

        const slidesSummary = slides.map((s: { slideType: string }, i: number) =>
            `Slide ${i + 1}: tipo ${s.slideType}`
        ).join(', ');

        const prompt = `Voce e um designer grafico expert em posts de carrossel para ${platform === 'instagram' ? 'Instagram' : 'LinkedIn'}.

Preciso que voce crie um DESIGN SYSTEM unificado para um carrossel com ${slides.length} slides (${slidesSummary}).

CONTEXTO:
${styleDesc ? `Estilo visual: ${styleDesc}` : ''}
${brandDesc || (paletteDesc ? `Paleta: ${paletteDesc}` : '')}
${audienceDesc}
${topicDesc}

Retorne APENAS um JSON valido (sem markdown, sem code blocks) com esta estrutura exata:
{
  "background": {
    "type": "solid" ou "gradient" ou "pattern",
    "primaryColor": "#hex",
    "secondaryColor": "#hex",
    "gradientDirection": "to-bottom" ou "to-right" etc
  },
  "coverSlide": {
    "backgroundDescription": "descricao detalhada do fundo visual da capa, sem mencionar texto",
    "badgeColor": "#hex",
    "decorativeElement": "descricao do elemento decorativo"
  },
  "contentSlide": {
    "backgroundDescription": "descricao detalhada do fundo visual dos slides de conteudo, sem mencionar texto"
  },
  "ctaSlide": {
    "backgroundDescription": "descricao detalhada do fundo visual do slide CTA, sem mencionar texto"
  },
  "accent": "#hex",
  "textColor": "#hex para texto principal",
  "decorativeStyle": "descricao do estilo dos elementos decorativos que se repetem em todos os slides",
  "moodKeywords": ["keyword1", "keyword2", "keyword3"]
}

REGRAS:
- As cores devem ser coerentes entre si e formar uma identidade visual unica.
- Os fundos devem ser descritos como composicoes visuais SEM nenhum texto.
- O estilo decorativo deve ser consistente em todos os slides.
- Se cores da marca foram fornecidas, use-as como base obrigatoria.
- Retorne SOMENTE o JSON, nada mais.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = (response.text || '').trim();

        // Parse JSON - strip markdown code blocks if present
        const jsonStr = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
        const designSystem = JSON.parse(jsonStr);

        return NextResponse.json(designSystem, { status: 200 });
    } catch (error: unknown) {
        console.error('Erro ao gerar design system:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message || 'Falha ao gerar design system' }, { status: 500 });
        }
        return NextResponse.json({ error: 'Falha ao gerar design system' }, { status: 500 });
    }
}
