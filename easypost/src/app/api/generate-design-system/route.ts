import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
    try {
        const { slides, audience, platform, topicContext } = await req.json();

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Chave da API nao encontrada' }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });

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
${audienceDesc}
${topicDesc}

Crie um estilo visual unico, criativo e autoral baseado inteiramente no conteudo e publico-alvo fornecidos. Surpreenda com uma identidade visual original e coerente.

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
- Retorne SOMENTE o JSON, nada mais.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = (response.text || '').trim();
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
