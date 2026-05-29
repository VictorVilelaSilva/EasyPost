# Firebase Auth Integration + Remoção do Banco SQL

**Data:** 2026-05-29
**Branch:** `ai_ganerete`
**Status:** Aprovado (design) — aguardando review do spec

## Objetivo

Adicionar autenticação via **Firebase (login com Google)** ao Image Forge e
**remover o stack de banco SQL legado** do backend FastAPI. O backend passa a
ser stateless: valida o ID token do Firebase e gera a imagem. O perfil do
usuário vive no Firestore. **Pagamento por geração está fora deste escopo** —
será um spec/PR separado.

## Decisões

| Tema | Decisão |
|---|---|
| Escopo | Só login + remoção do banco. Pagamento = depois. |
| Método de login | Apenas Google (`signInWithPopup`). |
| Backend | Valida ID token do Firebase via `firebase-admin` (Python). Protege `POST /image-generations/prompt`. Sem contador de uso. |
| Dados do usuário | Firestore `users/{uid}`: `email`, `name`, `createdAt`. Sem `requestCount`/cota. |
| Gating frontend | App inteiro atrás do login (tela de login no lugar do wizard até autenticar). |
| Limpeza backend | Apagar módulos legados (`auth`, `trade`, `worker`, `observability`, `common`), `database.py`, `alembic/`; remover deps SQL; limpar `config.py`. |
| Logout | Botão/avatar no `AppHeader`. |
| CORS | `allowed_origins` corrigido para incluir `http://localhost:8005` (porta real do front). |

## Arquitetura (Abordagem A — espelhar a `main`)

O SDK client do Firebase faz a autenticação e escreve o doc do usuário no
Firestore (client-side). O FastAPI usa `firebase-admin` **apenas** para
verificar o token — não escreve no Firestore. Separação limpa: FastAPI é só
o "porteiro".

```
Usuário → AuthGate (sem login) → LoginScreen → signInWithPopup(Google)
        → onAuthStateChanged → createUserIfNotExists (Firestore users/{uid})
        → AuthGate libera o wizard
        → Gerar: fetch com Authorization: Bearer <idToken>
        → FastAPI get_current_user verifica o token → gera imagem
```

## Backend (`back/`)

### Novos arquivos — `app/firebase/`

- `app/firebase/__init__.py`
- `app/firebase/admin.py` — inicializa `firebase-admin` a partir de envs,
  espelhando o `firebaseAdmin.ts` da branch `main`:
  - Lê `FIREBASE_ADMIN_PROJECT_ID` (fallback para o project id já existente),
    `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY` (com
    `replace("\\n", "\n")`).
  - Se houver `client_email` + `private_key`: inicializa com
    `credentials.Certificate(...)`. Senão, inicializa sem credenciais
    (ambiente Google-hosted).
  - Guard de inicialização única (`firebase_admin._apps`).
  - Expõe `admin_auth` (de `firebase_admin.auth`).
- `app/firebase/dependencies.py` — `get_current_user`:
  - Dependência FastAPI que lê o header `Authorization: Bearer <idToken>`.
  - Chama `admin_auth.verify_id_token(token)`.
  - Retorna um dict/objeto `{ "uid": ..., "email": ... }`.
  - Levanta `HTTPException(401)` se o header estiver ausente, malformado,
    ou se o token for inválido/expirado.

### Modificações

- `app/image_generation/router.py` — adicionar
  `current_user = Depends(get_current_user)` ao `POST /image-generations/prompt`.
  O proxy de Pokémon (`/pokemon`) permanece público.
- `app/config.py` — manter apenas os campos vivos e adicionar os do Firebase:
  - Manter: `allowed_origins`, `pokemon_api_base_url`, `pokemon_cache_ttl_seconds`,
    `openai_api_key`, `openai_base_url`, `openai_image_model`,
    `openai_image_timeout_seconds`, `frontend_url`, `environment`.
  - Adicionar: `firebase_admin_project_id`, `firebase_admin_client_email`,
    `firebase_admin_private_key` (todos com default `""`).
  - `allowed_origins` default: `["http://localhost:8005"]`; `frontend_url`
    default: `http://localhost:8005`.
  - Remover: `database_url`, `database_schema`, `jwt_secret`, `jwt_algorithm`,
    `access_token_expire_minutes`, `refresh_token_expire_days`, `steam_api_key`,
    `asaas_api_key`, `asaas_base_url`, `asaas_webhook_token`, `backend_public_url`,
    `cookie_domain`, `platform_fee_percent`, `trade_deadline_hours`,
    `payout_hold_hours`, `steam_poll_interval_seconds`,
    `deadline_check_interval_seconds`, `redis_url`,
    `inventory_cache_ttl_seconds`, `item_details_cache_ttl_seconds`.
- `pyproject.toml`:
  - Remover deps: `sqlalchemy[asyncio]`, `asyncpg`, `alembic`, `passlib`, `redis`.
  - Adicionar dep: `firebase-admin`.
  - Remover tasks `taskipy`: `migrate`, `rev`, `seed`.

### Remoções

- `app/auth/` (legado Steam/JWT)
- `app/trade/`
- `app/worker/`
- `app/observability/`
- `app/common/`
- `app/database.py`
- `alembic/` + `alembic.ini` (se existir)

> **Verificação obrigatória antes de apagar:** confirmar que `app/image_generation`
> e `app/pokemon` (e `app/main.py`) **não** importam de `app/common` nem de
> `app/database`. O grep inicial indicou que só usam `app.config`, mas confirmar
> arquivo a arquivo. Ajustar `tests/conftest.py` se houver fixture de DB/engine.

## Frontend (`front/`)

### Novos arquivos

- `src/lib/firebase.ts` — inicializa o app client a partir de
  `NEXT_PUBLIC_FIREBASE_*`; exporta `auth`, `googleProvider`
  (`GoogleAuthProvider`), `db` (`getFirestore`). Guard `getApps()`.
- `src/lib/user-service.ts` — `createUserIfNotExists(user)`: cria
  `users/{uid}` no Firestore com `{ email, name, createdAt: serverTimestamp() }`
  se ainda não existir. Erros logados, não propagados (fire-and-forget).
- `src/contexts/auth-context.tsx` — `'use client'`. `AuthProvider` registra
  `onAuthStateChanged`; quando há usuário, chama `createUserIfNotExists`;
  expõe `useAuth()` → `{ user, loading, logout }` (`logout = signOut(auth)`).
- `src/components/auth/login-screen.tsx` — `'use client'`. Tela centralizada no
  tema escuro do app (`bg-[#050505]`), com botão "Continuar com Google"
  (`signInWithPopup(auth, googleProvider)`), estado de loading e mensagem de
  erro. Sem formulário de email/senha.
- `src/components/auth/auth-gate.tsx` — `'use client'`. Usa `useAuth()`:
  `loading` → spinner; sem `user` → `<LoginScreen/>`; com `user` → `children`.

### Modificações

- `src/app/layout.tsx` — envolver `{children}` com
  `<AuthProvider><AuthGate>{children}</AuthGate></AuthProvider>`. (Layout é
  Server Component; os componentes de auth são `'use client'` — composição OK.)
- `src/features/image-forge/lib/image-generation-api.ts` — antes do `fetch`,
  obter o token: `const token = await auth.currentUser?.getIdToken()`; se não
  houver token, lançar erro claro ("Sessão expirada, faça login novamente").
  Anexar header `Authorization: Bearer ${token}`.
- `src/features/image-forge/components/app-header.tsx` — adicionar
  avatar/nome do usuário + botão de logout (`useAuth().logout`).
- `package.json` — adicionar dependência `firebase`.

### Variáveis de ambiente (frontend)

`NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`,
`NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`,
`NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`.

## Testes

- **Backend** (`back/tests/`):
  - Novo `tests/test_auth.py`: `get_current_user` com token válido (mock de
    `verify_id_token`), header ausente → 401, token inválido → 401.
  - `POST /image-generations/prompt` sem `Authorization` → 401.
  - Garantir que `test_pokemon`, `test_health`, `test_image_generation`
    continuam passando após a remoção do DB (ajustar `conftest.py` se preciso).
  - Rodar `uv run ruff check .` e `uv run ruff format .`.
- **Frontend**: sem suíte configurada. Validação: `npm run lint` + login real
  com Google e uma geração end-to-end.

## Documentação

- Atualizar `back/CLAUDE.md` (seções de env vars e autenticação — hoje
  descrevem o produto Steam/JWT) e a seção de autenticação do `front/CLAUDE.md`.
  Manter a edição focada (não reescrever o doc inteiro).

## Fora de escopo

- Fluxo de pagamento / créditos por geração (spec separado).
- Login por email/senha ou outros provedores.
- Contagem de uso / cota gratuita.
