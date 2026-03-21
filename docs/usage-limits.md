# Sistema de Limites de Uso

## Visao Geral

O EasyPost aplica limites diarios de geracao para proteger a infraestrutura e incentivar o upgrade de conta. Existem dois tipos de operacao com limite:

| Operacao | Descricao |
|---|---|
| **carousel** | Geracao completa de carrossel (texto + imagens) |
| **edit** | Edicao de um slide individual com IA |

---

## Limites por Tier

| Tier | Carrosseis/dia | Edicoes/dia | Como identificar |
|---|---|---|---|
| **anonymous** | 1 | 0 (bloqueado) | Sem token — hash SHA-256 de IP + User-Agent |
| **free** | 6 | 3 | Logado com Firebase Auth, `isPaid = false` |
| **paid** | Ilimitado | Ilimitado | Logado com Firebase Auth, `isPaid = true` |

### Detalhes

- **Usuarios anonimos** nao podem editar slides. O limite de edicao e `0`, entao qualquer tentativa retorna `429` imediatamente.
- **Usuarios free** recebem 6 geracoes de carrossel e 3 edicoes de imagem por dia.
- **Usuarios paid** nao tem limite (`Infinity`). A API retorna `limit: -1` para indicar ilimitado.

---

## Reset Diario

Os contadores sao resetados automaticamente no primeiro request do novo dia (UTC).

Nao ha cron job. A logica e:

1. Ao verificar o limite, o sistema le o campo `lastUsageDate` do documento Firestore.
2. Se `lastUsageDate !== hoje (UTC)`, os contadores `dailyCarouselCount` e `dailyEditCount` sao zerados e `lastUsageDate` e atualizado.
3. Caso contrario, os contadores sao mantidos.

---

## Identificacao de Usuarios

### Usuarios autenticados

O client envia o **Firebase ID Token** no header `Authorization: Bearer <token>`. O servidor verifica o token usando o **Firebase Admin SDK** (`adminAuth.verifyIdToken`).

O documento Firestore fica em:

```
users/{uid}
  ├── dailyCarouselCount: number
  ├── dailyEditCount: number
  ├── lastUsageDate: "YYYY-MM-DD"
  └── isPaid: boolean
```

### Usuarios anonimos

Sem token, o servidor gera um hash SHA-256 a partir de `IP + User-Agent` (truncado em 32 caracteres). O documento fica em:

```
anonymousUsage/{ipHash}
  ├── dailyCarouselCount: number
  ├── lastUsageDate: "YYYY-MM-DD"
  └── ipHash: string
```

> Usuarios anonimos nao tem campo `dailyEditCount` porque o limite de edicao e `0` — o request e rejeitado antes de consultar o Firestore.

---

## Arquitetura

### Servidor (enforcement)

```
src/lib/firebaseAdmin.ts      — Inicializacao do Firebase Admin SDK
src/lib/usageLimits.ts         — checkUsageLimit() + incrementUsage()
src/app/api/usage/route.ts     — GET /api/usage (retorna estado atual)
```

#### Fluxo de uma API protegida

```
Request → checkUsageLimit(req, tipo)
  ├── allowed = false → responde 429 { error, tier, remaining, limit }
  └── allowed = true  → processa normalmente
                       → se sucesso: incrementUsage(identifier, tipo, isAnonymous)
```

#### Rotas protegidas

| Rota | Tipo de limite | Quando incrementa |
|---|---|---|
| `POST /api/generate-carousel` | `carousel` | Nao incrementa (apenas verifica) |
| `POST /api/generate-images` | `carousel` | Apos gerar todas as imagens com sucesso |
| `POST /api/edit-slide` | `edit` | Apos editar a imagem com sucesso |

> O `generate-carousel` verifica o limite mas nao incrementa porque a geracao de texto sozinha nao conta como uso — o incremento acontece apenas no `generate-images`, que e chamado em sequencia.

### Cliente (UX)

```
src/hooks/useUsageLimits.ts        — Hook que consulta GET /api/usage
src/hooks/useCarouselWorkflow.ts   — Envia token + trata 429 em carousel
src/app/create/components/steps/
  preview/usePreviewLogic.ts       — Envia token + trata 429 em edit
src/components/UsageLimitModal.tsx  — Modal de upsell
```

#### Badge de uso

Na pagina `/create`, um badge mostra o consumo atual:

- `"3/6 carrosseis restantes hoje"` — quando ha creditos
- `"Limite diario atingido"` — quando zerou

O badge nao aparece para usuarios `paid` (limit = -1).

#### Modal de limite

Quando qualquer API retorna `429`, um modal (`UsageLimitModal`) aparece com conteudo dinamico:

| Tier | Titulo | CTA primario |
|---|---|---|
| `anonymous` | "Limite de demonstracao atingido" | "Criar Conta Gratis" → `/login` |
| `free` (carousel) | "Voce usou todos os carrosseis de hoje" | "Fazer Upgrade" |
| `free` (edit) | "Edicoes diarias esgotadas" | "Fazer Upgrade" |

---

## Variaveis de Ambiente

O Firebase Admin SDK requer as seguintes variaveis no `.env.local`:

```env
FIREBASE_ADMIN_PROJECT_ID=        # Opcional — fallback para NEXT_PUBLIC_FIREBASE_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL=      # Service account email
FIREBASE_ADMIN_PRIVATE_KEY=       # Service account private key (com \n literais)
```

Se `FIREBASE_ADMIN_CLIENT_EMAIL` e `FIREBASE_ADMIN_PRIVATE_KEY` nao estiverem definidas, o SDK inicializa apenas com `projectId` (funciona em ambientes Firebase-hosted como Cloud Run).

---

## Resposta da API `/api/usage`

```json
{
  "tier": "free",
  "carousel": {
    "used": 2,
    "limit": 6,
    "remaining": 4
  },
  "edit": {
    "used": 1,
    "limit": 3,
    "remaining": 2
  }
}
```

Para usuarios `paid`, `limit` retorna `-1` e `remaining` retorna `Infinity` (serializado como `null` em JSON).
