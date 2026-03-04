# API: Generate Images (`/api/generate-images`)

## Visao Geral

Esta rota gera imagens para cada slide de um carrossel usando a API do Google Gemini. O processo acontece em **2 etapas**: uma pesquisa visual previa e a geracao das imagens em si.

---

## Fluxo Completo

```
Frontend (HomeClient)
    |
    v
POST /api/generate-images
    |
    |-- 1. Validacao (slides, logo, API key)
    |
    |-- 2. ETAPA 1: Pesquisa Visual (Google Search Grounding)
    |       |-- Gemini 2.5 Flash + googleSearch tool
    |       |-- Busca referencias visuais do tema (cores, icones, simbolos)
    |       |-- Busca dados-chave e estatisticas para os slides
    |       |-- Resultado truncado em 2000 chars -> topicContext
    |       |-- Se falhar: continua sem contexto (fallback)
    |
    |-- 3. Montagem das descricoes de estilo
    |       |-- STYLE_MAP: estilo visual (minimalist, luxury, corporate, etc.)
    |       |-- PALETTE_MAP: paleta de cores (dark, light, blue, etc.)
    |       |-- brandDesc: cores da marca do usuario (se fornecidas)
    |       |-- audienceDesc: publico-alvo (idade, interesses)
    |       |-- customDesc: instrucoes adicionais do usuario
    |
    |-- 4. ETAPA 2: Geracao das imagens (em paralelo)
    |       |-- Para cada slide:
    |       |       |-- buildPrompt() monta o prompt especifico
    |       |       |-- Gemini 3.1 Flash Image Preview (stream)
    |       |       |-- Config: ThinkingLevel.MINIMAL, aspect 4:5, 1K
    |       |       |-- Retorna imagem base64
    |       |
    |       |-- Promise.all() -> todas as imagens em paralelo
    |
    |-- 5. Overlay de logo (se fornecido)
    |       |-- sharp: redimensiona logo para 80x80px
    |       |-- Posiciona no canto inferior esquerdo (margin 50px)
    |
    |-- 6. Resposta: { images: ["data:image/png;base64,...", ...] }
```

---

## Etapa 1: Pesquisa Visual (Google Search Grounding)

**Por que existe?** Antes, as imagens eram geradas sem nenhum contexto do tema. Agora, uma pesquisa previa busca informacoes reais para enriquecer os prompts visuais.

**Como funciona:**
- Usa `gemini-2.5-flash` com `tools: [{ googleSearch: {} }]`
- System instruction: "diretor de arte digital especializado em design para redes sociais"
- Temperature: `0.3` (factual, pouca criatividade)
- Busca: elementos visuais, dados-chave, referencias esteticas, paleta de cores
- Resultado truncado a 2000 caracteres (`truncateResearch`)
- **Fallback**: se a pesquisa falhar, a geracao continua normalmente sem contexto

**Importante:** Essa pesquisa acontece **uma unica vez** para todos os slides, nao por slide.

---

## Etapa 2: Geracao de Imagens

### buildPrompt()

Monta um prompt diferente dependendo do `slideType`:

| slideType | Layout |
|-----------|--------|
| `cover`   | Fundo claro, badge azul marinho com titulo, subtitulo abaixo, elemento decorativo |
| `content` | Fundo azul marinho escuro, texto branco grande, icone de deslizar |
| `cta`     | Fundo claro, badge com titulo, lista de acoes (curta, comente, compartilhe) |

Cada prompt recebe:
- **topicContext**: resultado da pesquisa visual (Etapa 1)
- **styleDesc**: descricao do estilo visual escolhido pelo usuario
- **paletteDesc** ou **brandDesc**: paleta de cores (generica ou da marca)
- **audienceDesc**: descricao do publico-alvo
- **customDesc**: instrucoes personalizadas
- **hasLogo**: se true, reserva espaco no canto inferior esquerdo

### Modelo de geracao

- **Modelo**: `gemini-3.1-flash-image-preview`
- **ThinkingLevel**: `MINIMAL` (rapido, sem raciocinio profundo)
- **Aspect ratio**: `4:5` (formato ideal para Instagram)
- **Image size**: `1K` (1080x1080)
- **Stream**: usa `generateContentStream` para receber a imagem em chunks
- **Sem Google Search**: a pesquisa ja foi feita na Etapa 1, nao precisa repetir aqui

### Paralelismo

Todos os slides sao gerados em paralelo via `Promise.all()`. Cada slide e uma chamada independente ao Gemini.

---

## Overlay de Logo

Se o usuario enviou um logo (`brandColors.logoDataUrl`):

1. Decodifica a imagem base64 e o logo (data URL)
2. Redimensiona o logo para caber em 80x80px (`sharp.resize`)
3. Posiciona no canto inferior esquerdo com margem de 50px
4. Usa `sharp.composite()` para sobrepor
5. Retorna a imagem final em base64

**Limite**: logo maximo de ~2MB (validado no inicio da rota).

---

## Input (Request Body)

```typescript
{
  slides: Array<{ slideType: string; title: string; content: string }>,
  topic: string,           // tema do carrossel (para pesquisa visual)
  niche: string,           // nicho do conteudo (para pesquisa visual)
  visualStyle: string,     // chave do STYLE_MAP
  colorPalette: string,    // chave do PALETTE_MAP
  brandColors: {
    colors: string[],      // hex colors da marca
    logoDataUrl?: string   // logo em data URL base64
  },
  audience: {
    age?: string,
    interests?: string
  },
  customPrompt?: string    // instrucoes extras do usuario
}
```

## Output

```typescript
{
  images: string[]  // array de data URLs "data:image/png;base64,..."
}
```

---

## Mapas de Configuracao

### STYLE_MAP
| Chave | Descricao |
|-------|-----------|
| `minimalist` | Design limpo, espacos brancos, formas geometricas simples |
| `luxury` | Estetica premium, cores ricas, acentos dourados/prata |
| `corporate` | Profissional, tons de azul, layout estruturado |
| `clean-tech` | Tech moderno, gradientes, glassmorphism, neon sobre escuro |
| `creative` | Cores vibrantes, elementos artisticos, composicoes dinamicas |
| `neon` | Fundo preto, luzes neon (pink, cyan, purple), cyberpunk |

### PALETTE_MAP
| Chave | Descricao |
|-------|-----------|
| `dark` | Fundo navy-to-black, texto branco |
| `light` | Fundo branco, texto navy escuro |
| `blue` | Fundo navy, acentos azul eletrico |
| `green` | Fundo emerald, acentos mint/teal |
| `warm` | Fundo orange-brown, acentos laranja vibrante |
| `purple` | Fundo violet, acentos lavanda |

---

## Tratamento de Erros

- **Pesquisa visual falha**: log de warning, continua sem contexto
- **Imagem nao retornada**: throw Error, retorna 500
- **Logo muito grande**: retorna 400
- **Slides invalidos**: retorna 400
- **API key ausente**: retorna 500
