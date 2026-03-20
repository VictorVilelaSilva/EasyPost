import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { TextBlock, Platform } from '@/types';

export const maxDuration = 60;

// ─── Helpers: traduzir coordenadas para linguagem natural ───

function describePosition(xPercent: number, yPercent: number): string {
    const vertical = yPercent < 33 ? 'regiao superior' : yPercent < 66 ? 'regiao central' : 'regiao inferior';
    const horizontal = xPercent < 33 ? 'a esquerda' : xPercent < 66 ? 'centralizado' : 'a direita';
    return `${vertical}, ${horizontal}`;
}

function describeSize(fontSize: number): string {
    if (fontSize > 36) return 'grande e impactante (titulo/destaque)';
    if (fontSize >= 18) return 'tamanho medio (subtitulo/corpo)';
    return 'pequeno e discreto (detalhe/legenda)';
}

function describeRole(blockId: string): string {
    const roles: Record<string, string> = {
        title: 'titulo principal',
        subtitle: 'subtitulo',
        body: 'corpo do conteudo',
        actions: 'chamada para acao',
    };
    return roles[blockId] || 'elemento de texto';
}

// ─── Prompt: Modo Auto ("IA Criativa") ───

function buildAutoPrompt(textBlocks: TextBlock[], platform: Platform): string {
    const dimensions = platform === 'instagram' ? '1080x1350px' : '1080x1080px';

    const blocksDesc = textBlocks.map((b, i) => {
        return `${i + 1}. Texto: "${b.text}"
   Papel: ${describeRole(b.id)}
   Posicao aproximada: ${describePosition(b.xPercent, b.yPercent)}
   Importancia visual: ${describeSize(b.fontSize)}`;
    }).join('\n\n');

    return `Voce e um designer grafico de elite, especialista em tipografia artistica e composicao visual para redes sociais.

TAREFA: Analise a imagem de fundo e integre os textos abaixo como se fossem parte ORIGINAL do design. O resultado deve parecer uma peca grafica profissional criada por um diretor de arte.

ANTES DE COMPOR, ANALISE O FUNDO:
- Identifique as cores dominantes, texturas, elementos decorativos e espacos vazios
- Determine o "mood" visual (escuro/claro, minimalista/complexo, quente/frio)
- Encontre as melhores areas para posicionar texto com contraste e harmonia

ELEMENTOS DE TEXTO:
${blocksDesc}

LIBERDADE ARTISTICA — voce PODE e DEVE usar:
- Sombras organicas e drop shadows que combinem com a iluminacao do fundo
- Gradientes no texto que harmonizem com a paleta do fundo
- Efeitos de glow ou luz atras do texto quando apropriado
- Texto interagindo com elementos do fundo (saindo de objetos, parcialmente atras de elementos)
- Perspectiva e angulacao sutil para dar profundidade
- Blending e composicao que facam o texto "pertencer" a imagem
- Contornos, outlines ou efeitos de stroke quando beneficiar a legibilidade
- Hierarquia tipografica clara (titulo muito mais destacado que corpo)

REGRAS:
- As posicoes indicadas sao APENAS referencia — priorize composicao visual harmoniosa
- O texto DEVE ser 100% legivel
- Mantenha a hierarquia: titulo > subtitulo > corpo > detalhes
- Preserve o fundo original intacto (cores, texturas, elementos decorativos)
- Dimensoes finais: ${dimensions}
- O resultado deve parecer uma peca de design profissional, NAO texto colado por cima`;
}

// ─── Prompt: Modo Manual ("Meu Estilo") ───

function buildManualPrompt(textBlocks: TextBlock[], platform: Platform): string {
    const dimensions = platform === 'instagram' ? '1080x1350px' : '1080x1080px';

    const blocksDesc = textBlocks.map((b, i) => {
        const style = [b.bold ? 'negrito' : '', b.italic ? 'italico' : ''].filter(Boolean).join(', ') || 'normal';
        return `${i + 1}. Texto: "${b.text}"
   Papel: ${describeRole(b.id)}

   OBRIGATORIO (nao alterar):
   - Cor exata: ${b.color}
   - Fonte: ${b.fontFamily}

   SUGESTAO (ajustar livremente para melhor composicao):
   - Posicao aproximada: ${describePosition(b.xPercent, b.yPercent)}
   - Importancia visual: ${describeSize(b.fontSize)}
   - Peso sugerido: ${style}`;
    }).join('\n\n');

    return `Voce e um designer grafico de elite, especialista em tipografia artistica e composicao visual para redes sociais.

TAREFA: Analise a imagem de fundo e integre os textos abaixo como parte organica do design. Respeite as RESTRICOES marcadas como OBRIGATORIO, mas use liberdade criativa em tudo marcado como SUGESTAO.

ANTES DE COMPOR, ANALISE O FUNDO:
- Identifique as cores dominantes, texturas, elementos decorativos e espacos vazios
- Determine o "mood" visual (escuro/claro, minimalista/complexo, quente/frio)
- Encontre as melhores areas para posicionar texto com contraste e harmonia

ELEMENTOS DE TEXTO:
${blocksDesc}

LIBERDADE ARTISTICA (respeitando as cores e fontes obrigatorias):
- Sombras organicas e drop shadows que combinem com a iluminacao do fundo
- Efeitos de glow ou luz atras do texto quando apropriado
- Texto interagindo com elementos do fundo (saindo de objetos, parcialmente atras de elementos)
- Perspectiva e angulacao sutil para dar profundidade
- Blending e composicao que facam o texto "pertencer" a imagem
- Contornos ou efeitos de stroke NA COR OBRIGATORIA quando beneficiar a legibilidade
- Hierarquia tipografica clara entre os elementos

REGRAS:
- NUNCA altere as cores ou fontes marcadas como OBRIGATORIO
- As posicoes e tamanhos sao SUGESTOES — priorize composicao visual harmoniosa
- O texto DEVE ser 100% legivel
- Preserve o fundo original intacto
- Dimensoes finais: ${dimensions}
- O resultado deve parecer uma peca de design profissional, NAO texto colado por cima`;
}

// ─── Route Handler ───

export async function POST(req: NextRequest) {
    try {
        const { backgroundBase64, textBlocks, platform = 'instagram', mode = 'auto' } = await req.json() as {
            backgroundBase64: string;
            textBlocks: TextBlock[];
            platform: Platform;
            mode: 'auto' | 'manual';
        };

        if (!backgroundBase64) {
            return NextResponse.json({ error: "Imagem de fundo e obrigatoria" }, { status: 400 });
        }
        if (!textBlocks || textBlocks.length === 0) {
            return NextResponse.json({ error: "Blocos de texto sao obrigatorios" }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Chave da API nao encontrada" }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });
        const prompt = mode === 'auto'
            ? buildAutoPrompt(textBlocks, platform)
            : buildManualPrompt(textBlocks, platform);

        const response = await ai.models.generateContent({
            model: "gemini-3-pro-image-preview",
            contents: [
                {
                    inlineData: {
                        mimeType: "image/png",
                        data: backgroundBase64,
                    }
                },
                { text: prompt }
            ] as unknown as string,
            config: {
                aspectRatio: platform === 'instagram' ? '4:5' : '1:1',
                responseModalities: ['TEXT', 'IMAGE'],
            } as unknown as Record<string, unknown>
        });

        let base64Result: string | null = null;
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    base64Result = part.inlineData.data ?? null;
                    break;
                }
            }
        }

        if (!base64Result) {
            throw new Error("Nenhuma imagem retornada pelo Gemini");
        }

        return NextResponse.json({ image: `data:image/png;base64,${base64Result}` }, { status: 200 });

    } catch (error: unknown) {
        console.error("Erro ao fundir slide:", error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message || "Falha ao fundir slide" }, { status: 500 });
        }
        return NextResponse.json({ error: "Falha ao fundir slide" }, { status: 500 });
    }
}
