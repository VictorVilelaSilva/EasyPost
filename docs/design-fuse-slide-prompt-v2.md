# Design: Melhoria do Prompt de Fusao Texto + Imagem

## Resumo

Melhorar a integracao visual do texto nas imagens de carrossel geradas por IA.
Atualmente o texto parece "colado por cima" do fundo. O objetivo e que a IA
integre o texto organicamente na composicao visual.

## Contexto

- Rota atual: `/api/fuse-slide`
- Modelo: Gemini (google/genai)
- O prompt atual (`buildFusePrompt`) passa coordenadas literais e pede reproducao exata
- Resultado: texto posicionado corretamente mas sem integracao visual

## Comportamento Esperado

### Modo Auto ("IA Criativa")
- Toggle ativo por padrao
- A IA recebe apenas: textos, posicoes como referencia vaga (linguagem natural), dimensoes
- Liberdade artistica total: efeitos cinematograficos, texto integrado com texturas, blending, perspectiva, glow, sombras organicas
- Hierarquia textual respeitada (titulo > subtitulo > corpo)

### Modo Manual ("Meu Estilo")
- Usuario ativa quando quer controlar o visual
- Restricoes inviolaveis: cor (hex) e fonte (family)
- Sugestoes ajustaveis pela IA: posicao, tamanho, bold/italic
- Mesma liberdade artistica para efeitos de integracao, respeitando restricoes

## Arquivos a Modificar

### 1. `src/types/index.ts`
- Nenhuma mudanca estrutural necessaria (mode e param do request, nao do tipo TextBlock)

### 2. `src/app/api/fuse-slide/route.ts`
- Extrair `mode: 'auto' | 'manual'` do body (default: `'auto'`)
- Nova funcao `buildAutoPrompt(textBlocks, platform)`
  - Descritivo, artistico, posicoes em linguagem natural
  - Pede analise do fundo antes de decidir estilo
  - Permite efeitos tipograficos criativos
- Nova funcao `buildManualPrompt(textBlocks, platform)`
  - Secao "OBRIGATORIO" (cor, fonte) vs "SUGESTAO" (posicao, tamanho, peso)
  - Mesma liberdade artistica para efeitos de integracao
- Funcoes helper:
  - `describePosition(xPercent, yPercent)` — mapeia para tercos ("regiao superior centralizado")
  - `describeSize(fontSize)` — "grande e impactante" / "medio" / "pequeno e discreto"
  - `describeRole(blockId)` — "titulo principal" / "subtitulo" / "corpo" / "chamada para acao"

### 3. `src/app/create/components/steps/canvas-editor/useCanvasLogic.ts`
- Novo estado `aiMode: 'auto' | 'manual'` (default: `'auto'`)
- Passar `mode: aiMode` no body do fetch em `handleFuseAll()`
- Expor `aiMode` e `setAiMode` no retorno

### 4. `src/app/create/components/steps/canvas-editor/CanvasEditorPhase.tsx`
- Toggle no footer, a esquerda do botao "Fundir com IA"
  - Auto: icone Sparkles, label "IA Criativa", cor roxa (#7f0df2)
  - Manual: icone SlidersHorizontal, label "Meu Estilo", cor neutra
- Banner sutil no PropertiesPanel quando modo auto: "A IA vai decidir o melhor estilo visual"

## Mapeamento de Posicoes

| yPercent | Regiao Vertical |
|----------|-----------------|
| 0-33%    | regiao superior |
| 33-66%   | regiao central  |
| 66-100%  | regiao inferior |

| xPercent | Regiao Horizontal |
|----------|-------------------|
| 0-33%    | a esquerda        |
| 33-66%   | centralizado      |
| 66-100%  | a direita         |

## Mapeamento de Tamanhos

| fontSize | Descricao                                  |
|----------|--------------------------------------------|
| > 36px   | texto grande e impactante (titulo/destaque)|
| 18-36px  | texto de tamanho medio (subtitulo/corpo)   |
| < 18px   | texto pequeno e discreto (detalhe/legenda) |

## Decision Log

| # | Decisao | Alternativas | Motivo |
|---|---------|-------------|--------|
| 1 | Prompt dual-mode na mesma rota | Endpoints separados; slider de liberdade | Simples, sem duplicacao, facil de iterar |
| 2 | Modo auto: posicoes como referencia aproximada | Ignorar posicoes; manter exatas | Equilibrio entre intencao e qualidade |
| 3 | Modo manual: cor e fonte inviolaveis | Tudo inviolavel; tudo sugestao | Preserva identidade sem engessar a IA |
| 4 | Toggle explicito no editor | Deteccao automatica; por propriedade | Sem ambiguidade, UX clara |
| 5 | Posicoes em linguagem natural (tercos) | Coordenadas exatas; sem posicao | Contexto sem engessar composicao |
| 6 | Qualidade visual como prioridade | Balancear custo | Fase do produto prioriza resultado |

## Nao-objetivos

- Nao muda o fluxo do canvas editor (drag, propriedades, etc.)
- Nao troca o modelo (continua Gemini)
- Nao altera arquivos: utils.ts, DraggableTextBlock.tsx, PropertiesPanel.tsx, types.ts
