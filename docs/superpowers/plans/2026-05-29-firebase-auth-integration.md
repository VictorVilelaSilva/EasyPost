# Firebase Auth Integration + Remoção do Banco SQL — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar login com Google via Firebase ao Image Forge (gate de app inteiro), proteger as rotas de geração no FastAPI com verificação de ID token, e remover todo o stack de banco SQL/Redis legado do backend.

**Architecture:** Abordagem A (espelha a branch `main`). O SDK client do Firebase autentica e grava o perfil em `users/{uid}` no Firestore. O FastAPI usa `firebase-admin` apenas para verificar o ID token (stateless). O cache Redis do proxy Pokémon — atualmente um no-op nunca inicializado — é substituído por um cache em memória, permitindo remover o Redis.

**Tech Stack:** Backend: Python 3.12, FastAPI, `firebase-admin`, `uv`/`pytest`. Frontend: Next.js 16.2, React 19, `firebase` (client SDK).

**User Verification:** NO — no user verification required.

---

### Task 1: Substituir cache Redis por cache em memória no proxy Pokémon

**Goal:** Remover a dependência de Redis do código vivo, movendo o cache para um módulo em memória dentro de `app/pokemon/`, mantendo a interface (`get`/`set(ex=)`) usada por `pokemon/service.py`.

**Files:**
- Create: `back/app/pokemon/cache.py`
- Modify: `back/app/pokemon/service.py:7` (import)
- Test: `back/tests/test_pokemon.py` (já existe; deve continuar passando)

**Acceptance Criteria:**
- [ ] `pokemon/service.py` não importa mais de `app.common.cache`.
- [ ] Nenhum import de `redis` permanece no código vivo.
- [ ] `uv run pytest tests/test_pokemon.py -v` passa.

**Verify:** `cd back && uv run pytest tests/test_pokemon.py -v` → todos PASS

**Steps:**

- [ ] **Step 1: Criar `back/app/pokemon/cache.py`** com um cache assíncrono em memória com TTL, expondo a mesma sub-interface do Redis usada pelo serviço (`await cache.get(key)`, `await cache.set(key, value, ex=...)`):

```python
import time

_store: dict[str, tuple[float | None, str]] = {}


class InMemoryCache:
    """Cache em memória com TTL, com a sub-interface de Redis usada pelo proxy."""

    async def get(self, key: str) -> str | None:
        entry = _store.get(key)
        if entry is None:
            return None
        expires_at, value = entry
        if expires_at is not None and expires_at < time.monotonic():
            _store.pop(key, None)
            return None
        return value

    async def set(self, key: str, value: str, ex: int | None = None) -> None:
        expires_at = time.monotonic() + ex if ex else None
        _store[key] = (expires_at, value)


_cache = InMemoryCache()


def get_cache() -> InMemoryCache:
    return _cache
```

- [ ] **Step 2: Atualizar o import em `back/app/pokemon/service.py`**

Trocar a linha 7:

```python
from app.common.cache import get_cache
```

por:

```python
from app.pokemon.cache import get_cache
```

(O restante de `service.py` permanece inalterado — os blocos `if cache is not None` continuam válidos.)

- [ ] **Step 3: Rodar os testes do Pokémon**

Run: `cd back && uv run pytest tests/test_pokemon.py -v`
Expected: PASS (mesmo comportamento de antes; agora com cache real em memória)

- [ ] **Step 4: Commit**

```bash
git add back/app/pokemon/cache.py back/app/pokemon/service.py
git commit -m "refactor(pokemon): cache em memória no lugar de Redis"
```

```json:metadata
{"files": ["back/app/pokemon/cache.py", "back/app/pokemon/service.py"], "verifyCommand": "cd back && uv run pytest tests/test_pokemon.py -v", "acceptanceCriteria": ["service nao importa app.common.cache", "sem import de redis no codigo vivo", "tests de pokemon passam"], "requiresUserVerification": false}
```

---

### Task 2: Remover módulos legados, banco SQL e limpar config/pyproject

**Goal:** Apagar os módulos legados não usados, o stack SQLAlchemy/Alembic e o Redis; limpar `config.py` e `pyproject.toml` deixando só o que o código vivo usa.

**Files:**
- Delete: `back/app/auth/`, `back/app/trade/`, `back/app/worker/`, `back/app/observability/`, `back/app/common/`, `back/app/database.py`, `back/alembic/`, `back/alembic.ini`
- Modify: `back/app/config.py`, `back/pyproject.toml`

**Acceptance Criteria:**
- [ ] Os diretórios/arquivos legados acima não existem mais.
- [ ] `config.py` contém apenas campos vivos + os 3 `firebase_admin_*`.
- [ ] `pyproject.toml` sem `sqlalchemy`, `asyncpg`, `alembic`, `passlib`, `redis`, `python-jose`, `aiosqlite`; sem tasks `migrate`/`rev`/`seed`.
- [ ] `cd back && uv sync` resolve sem erros e a app importa (`uv run python -c "import app.main"`).
- [ ] `uv run pytest -v` passa (health, pokemon, image_generation).

**Verify:** `cd back && uv sync && uv run python -c "import app.main" && uv run pytest -v` → import OK, todos os testes PASS

**Steps:**

- [ ] **Step 1: Apagar os módulos legados e o stack SQL**

```bash
cd back
git rm -r app/auth app/trade app/worker app/observability app/common app/database.py alembic alembic.ini
```

- [ ] **Step 2: Reescrever `back/app/config.py`** deixando só o necessário + Firebase:

```python
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # CORS / frontend
    allowed_origins: list[str] = ["http://localhost:8005"]
    frontend_url: str = "http://localhost:8005"
    environment: str = "production"

    # PokéAPI proxy
    pokemon_api_base_url: str = "https://pokeapi.co/api/v2"
    pokemon_cache_ttl_seconds: int = 86400

    # OpenAI image generation
    openai_api_key: str = ""
    openai_base_url: str = "https://api.openai.com/v1"
    openai_image_model: str = "gpt-image-2"
    openai_image_timeout_seconds: float = 300.0

    # Firebase Admin (verificação de ID token)
    firebase_admin_project_id: str = ""
    firebase_admin_client_email: str = ""
    firebase_admin_private_key: str = ""


settings = Settings()  # type: ignore[call-arg]
```

- [ ] **Step 3: Editar `back/pyproject.toml`** — `dependencies` passa a ser:

```toml
dependencies = [
    "fastapi>=0.115",
    "uvicorn[standard]>=0.34",
    "pydantic-settings>=2.7",
    "httpx>=0.28",
    "python-multipart>=0.0.18",
    "firebase-admin>=6.5",
]
```

`[dependency-groups]` `dev` passa a ser (remover `aiosqlite`):

```toml
dev = [
    "pytest>=8.0",
    "pytest-asyncio>=0.24",
    "pytest-cov>=5.0",
    "httpx>=0.28",
    "ruff>=0.8",
    "taskipy>=1.14.1",
]
```

Em `[tool.taskipy.tasks]`, **remover** as linhas `seed`, `migrate` e `rev`. O bloco fica:

```toml
[tool.taskipy.tasks]
dev = "uvicorn app.main:app --reload --host 0.0.0.0 --port 8004"
sync = "uv sync"
start = "uvicorn app.main:app --host 0.0.0.0 --port 8004"
test = "pytest -s -x --cov=app -vv"
cov = "pytest --cov=app --cov-report=term-missing"
```

Opcional (cosmético): atualizar `description` do projeto para refletir o Image Forge.

- [ ] **Step 4: Sincronizar deps e verificar import + testes**

Run:
```bash
cd back && uv sync && uv run python -c "import app.main" && uv run pytest -v
```
Expected: `uv sync` OK; import sem erro; testes de health/pokemon/image_generation PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(back): remover banco SQL e modulos legados; limpar config/deps"
```

```json:metadata
{"files": ["back/app/config.py", "back/pyproject.toml"], "verifyCommand": "cd back && uv sync && uv run python -c \"import app.main\" && uv run pytest -v", "acceptanceCriteria": ["modulos legados removidos", "config so com campos vivos + firebase", "deps SQL/redis removidas", "app importa e testes passam"], "requiresUserVerification": false}
```

---

### Task 3: Módulo Firebase Admin + dependência `get_current_user` (com testes)

**Goal:** Inicializar o `firebase-admin` a partir de envs e fornecer uma dependência FastAPI que verifica o ID token do header `Authorization: Bearer`.

**Files:**
- Create: `back/app/firebase/__init__.py`, `back/app/firebase/admin.py`, `back/app/firebase/dependencies.py`
- Test: `back/tests/test_auth.py`

**Acceptance Criteria:**
- [ ] Importar `app.firebase.admin` nunca lança (init resiliente).
- [ ] `get_current_user` retorna `{uid, email}` com token válido (mock de `verify_id_token`).
- [ ] Header ausente → `HTTPException` 401; token inválido → 401.
- [ ] `uv run pytest tests/test_auth.py -v` passa.

**Verify:** `cd back && uv run pytest tests/test_auth.py -v` → todos PASS

**Steps:**

- [ ] **Step 1: Criar `back/app/firebase/__init__.py`** (vazio)

```python
```

- [ ] **Step 2: Criar `back/app/firebase/admin.py`**

```python
import logging

import firebase_admin
from firebase_admin import auth as admin_auth
from firebase_admin import credentials

from app.config import settings

logger = logging.getLogger(__name__)


def _init_app() -> None:
    if firebase_admin._apps:
        return

    if settings.firebase_admin_client_email and settings.firebase_admin_private_key:
        cred = credentials.Certificate(
            {
                "type": "service_account",
                "project_id": settings.firebase_admin_project_id,
                "client_email": settings.firebase_admin_client_email,
                "private_key": settings.firebase_admin_private_key.replace("\\n", "\n"),
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        )
        firebase_admin.initialize_app(cred)
    elif settings.firebase_admin_project_id:
        firebase_admin.initialize_app(options={"projectId": settings.firebase_admin_project_id})
    else:
        firebase_admin.initialize_app()


try:
    _init_app()
except Exception:  # noqa: BLE001 — init não deve derrubar o import (ex.: testes sem credenciais)
    logger.exception("Falha ao inicializar o Firebase Admin")

__all__ = ["admin_auth"]
```

- [ ] **Step 3: Criar `back/app/firebase/dependencies.py`**

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.firebase.admin import admin_auth

_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> dict:
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticação ausente",
        )
    try:
        decoded = admin_auth.verify_id_token(credentials.credentials)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticação inválido",
        ) from exc

    return {"uid": decoded["uid"], "email": decoded.get("email")}
```

- [ ] **Step 4: Escrever o teste falhando `back/tests/test_auth.py`**

```python
import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.firebase import dependencies


@pytest.mark.asyncio
async def test_get_current_user_valid_token(monkeypatch):
    monkeypatch.setattr(
        dependencies.admin_auth,
        "verify_id_token",
        lambda token: {"uid": "abc123", "email": "user@example.com"},
    )
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="valid-token")

    result = await dependencies.get_current_user(credentials=creds)

    assert result == {"uid": "abc123", "email": "user@example.com"}


@pytest.mark.asyncio
async def test_get_current_user_missing_header():
    with pytest.raises(HTTPException) as exc:
        await dependencies.get_current_user(credentials=None)
    assert exc.value.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user_invalid_token(monkeypatch):
    def _raise(token):
        raise ValueError("invalid")

    monkeypatch.setattr(dependencies.admin_auth, "verify_id_token", _raise)
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="bad-token")

    with pytest.raises(HTTPException) as exc:
        await dependencies.get_current_user(credentials=creds)
    assert exc.value.status_code == 401
```

- [ ] **Step 5: Rodar o teste e verificar que passa**

Run: `cd back && uv run pytest tests/test_auth.py -v`
Expected: 3 PASS

- [ ] **Step 6: Commit**

```bash
git add back/app/firebase back/tests/test_auth.py
git commit -m "feat(back): Firebase Admin e dependencia get_current_user"
```

```json:metadata
{"files": ["back/app/firebase/admin.py", "back/app/firebase/dependencies.py", "back/tests/test_auth.py"], "verifyCommand": "cd back && uv run pytest tests/test_auth.py -v", "acceptanceCriteria": ["import resiliente", "token valido retorna uid/email", "header ausente 401", "token invalido 401"], "requiresUserVerification": false}
```

---

### Task 4: Proteger as rotas de geração + conftest com override de auth

**Goal:** Exigir login válido nas duas rotas de geração (`/image-generations/pokemon` e `/image-generations/prompt`) e manter os testes de endpoint passando via override da dependência.

**Files:**
- Modify: `back/app/image_generation/router.py`
- Create: `back/tests/conftest.py`

**Acceptance Criteria:**
- [ ] Ambas as rotas dependem de `get_current_user`.
- [ ] Sem `Authorization`, as rotas retornam 401 (coberto pelo override removido em um teste, ou pela suíte de unit de auth).
- [ ] Com o override de auth (conftest), os testes de `test_image_generation.py` continuam passando.
- [ ] `uv run pytest -v` passa por inteiro.

**Verify:** `cd back && uv run pytest -v` → todos PASS

**Steps:**

- [ ] **Step 1: Importar a dependência no router**

Em `back/app/image_generation/router.py`, adicionar ao bloco de imports do FastAPI o `Depends` (já há `APIRouter, File, Form, HTTPException, UploadFile`) e importar a dependência:

```python
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
```

E, abaixo dos imports existentes:

```python
from app.firebase.dependencies import get_current_user
```

- [ ] **Step 2: Adicionar a dependência às duas rotas**

Na rota `@router.post("/pokemon", ...)` (`generate_pokemon_image`), adicionar como primeiro parâmetro:

```python
async def generate_pokemon_image(
    current_user: dict = Depends(get_current_user),
    reference_image: UploadFile = File(...),
    ...
```

Na rota `@router.post("/prompt", ...)` (`generate_prompt_image`), adicionar como primeiro parâmetro:

```python
async def generate_prompt_image(
    current_user: dict = Depends(get_current_user),
    reference_image: UploadFile | None = File(None),
    ...
```

(Não é preciso usar `current_user` no corpo — a presença da dependência já força a verificação. O parâmetro permanece disponível para uso futuro.)

- [ ] **Step 3: Criar `back/tests/conftest.py`** com override autouse da auth, para os testes de endpoint não precisarem de token real:

```python
import pytest

from app.firebase.dependencies import get_current_user
from app.main import app


@pytest.fixture(autouse=True)
def _override_auth():
    app.dependency_overrides[get_current_user] = lambda: {
        "uid": "test-uid",
        "email": "test@example.com",
    }
    yield
    app.dependency_overrides.pop(get_current_user, None)
```

- [ ] **Step 4: Rodar a suíte completa**

Run: `cd back && uv run pytest -v`
Expected: todos PASS (health, pokemon, image_generation com override, auth unit).

- [ ] **Step 5: Lint + format**

Run: `cd back && uv run ruff check . && uv run ruff format .`
Expected: sem erros.

- [ ] **Step 6: Commit**

```bash
git add back/app/image_generation/router.py back/tests/conftest.py
git commit -m "feat(back): proteger rotas de geracao com auth do Firebase"
```

```json:metadata
{"files": ["back/app/image_generation/router.py", "back/tests/conftest.py"], "verifyCommand": "cd back && uv run pytest -v && uv run ruff check .", "acceptanceCriteria": ["ambas rotas exigem get_current_user", "conftest faz override autouse", "suite completa passa", "ruff sem erros"], "requiresUserVerification": false}
```

---

### Task 5: Setup do Firebase client + user-service no frontend

**Goal:** Adicionar a dependência `firebase`, inicializar o SDK client e criar o serviço que grava o perfil em `users/{uid}` no Firestore.

**Files:**
- Modify: `front/package.json` (adicionar `firebase`)
- Create: `front/src/lib/firebase.ts`, `front/src/lib/user-service.ts`

**Acceptance Criteria:**
- [ ] `firebase` instalado (`npm install firebase`).
- [ ] `firebase.ts` exporta `auth`, `googleProvider`, `db`.
- [ ] `user-service.ts` exporta `createUserIfNotExists`.
- [ ] `npm run lint` passa.

**Verify:** `cd front && npm run lint` → sem erros

**Steps:**

- [ ] **Step 1: Instalar a dependência**

```bash
cd front && npm install firebase
```

- [ ] **Step 2: Criar `front/src/lib/firebase.ts`**

```ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
```

- [ ] **Step 3: Criar `front/src/lib/user-service.ts`**

```ts
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";

import { db } from "./firebase";

export async function createUserIfNotExists(user: User): Promise<void> {
  try {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        email: user.email,
        name: user.displayName ?? null,
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error("[user-service] createUserIfNotExists:", err);
  }
}
```

- [ ] **Step 4: Lint**

Run: `cd front && npm run lint`
Expected: sem erros.

- [ ] **Step 5: Commit**

```bash
git add front/package.json front/package-lock.json front/src/lib/firebase.ts front/src/lib/user-service.ts
git commit -m "feat(front): setup do Firebase client e user-service"
```

```json:metadata
{"files": ["front/package.json", "front/src/lib/firebase.ts", "front/src/lib/user-service.ts"], "verifyCommand": "cd front && npm run lint", "acceptanceCriteria": ["firebase instalado", "firebase.ts exporta auth/googleProvider/db", "createUserIfNotExists criado", "lint passa"], "requiresUserVerification": false}
```

---

### Task 6: AuthContext (AuthProvider + useAuth)

**Goal:** Prover estado global de autenticação no frontend, criando o perfil no primeiro login e expondo `{ user, loading, logout }`.

**Files:**
- Create: `front/src/contexts/auth-context.tsx`

**Acceptance Criteria:**
- [ ] `AuthProvider` registra `onAuthStateChanged`, chama `createUserIfNotExists` quando há usuário, e expõe `loading`.
- [ ] `useAuth()` retorna `{ user, loading, logout }`.
- [ ] `npm run lint` passa.

**Verify:** `cd front && npm run lint` → sem erros

**Steps:**

- [ ] **Step 1: Criar `front/src/contexts/auth-context.tsx`**

```tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { createUserIfNotExists } from "@/lib/user-service";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        void createUserIfNotExists(firebaseUser);
      }
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

- [ ] **Step 2: Lint**

Run: `cd front && npm run lint`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add front/src/contexts/auth-context.tsx
git commit -m "feat(front): AuthContext com login Google e perfil no Firestore"
```

```json:metadata
{"files": ["front/src/contexts/auth-context.tsx"], "verifyCommand": "cd front && npm run lint", "acceptanceCriteria": ["AuthProvider registra onAuthStateChanged", "cria perfil no primeiro login", "useAuth expoe user/loading/logout", "lint passa"], "requiresUserVerification": false}
```

---

### Task 7: LoginScreen + AuthGate + wiring no layout

**Goal:** Exibir a tela de login (Google) quando não autenticado e liberar o wizard só após login, envolvendo o app no `layout.tsx`.

**Files:**
- Create: `front/src/components/auth/login-screen.tsx`, `front/src/components/auth/auth-gate.tsx`
- Modify: `front/src/app/layout.tsx`

**Acceptance Criteria:**
- [ ] `AuthGate`: `loading` → spinner; sem `user` → `LoginScreen`; com `user` → `children`.
- [ ] `LoginScreen` faz `signInWithPopup(auth, googleProvider)` e trata erro/loading.
- [ ] `layout.tsx` envolve `children` em `AuthProvider` + `AuthGate`.
- [ ] `npm run lint` passa.

**Verify:** `cd front && npm run lint` → sem erros

**Steps:**

- [ ] **Step 1: Criar `front/src/components/auth/login-screen.tsx`**

```tsx
"use client";

import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { Loader2 } from "lucide-react";

import { auth, googleProvider } from "@/lib/firebase";

export function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code !== "auth/popup-closed-by-user") {
        setError("Não foi possível entrar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-4 text-[#f5f5f5]">
      <div className="w-full max-w-sm rounded-2xl border border-[#2a2a2a] bg-[#101010] p-8 text-center shadow-2xl">
        <h1 className="text-2xl font-semibold">ImageForge IA</h1>
        <p className="mt-2 text-sm text-[#a3a3a3]">
          Entre para gerar suas imagens com IA.
        </p>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-[#f5f5f5] px-4 py-3 font-semibold text-[#050505] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <svg className="size-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          <span>{loading ? "Entrando..." : "Continuar com Google"}</span>
        </button>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Criar `front/src/components/auth/auth-gate.tsx`**

```tsx
"use client";

import { Loader2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { LoginScreen } from "./login-screen";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-[#f5f5f5]">
        <Loader2 className="size-6 animate-spin" aria-hidden="true" />
      </main>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}
```

- [ ] **Step 3: Envolver o app em `front/src/app/layout.tsx`**

Adicionar os imports no topo (após os imports existentes):

```tsx
import { AuthProvider } from "@/contexts/auth-context";
import { AuthGate } from "@/components/auth/auth-gate";
```

E trocar `{children}` dentro do `<body>` por:

```tsx
<AuthProvider>
  <AuthGate>{children}</AuthGate>
</AuthProvider>
```

- [ ] **Step 4: Lint**

Run: `cd front && npm run lint`
Expected: sem erros.

- [ ] **Step 5: Commit**

```bash
git add front/src/components/auth front/src/app/layout.tsx
git commit -m "feat(front): gate de login (Google) no app inteiro"
```

```json:metadata
{"files": ["front/src/components/auth/login-screen.tsx", "front/src/components/auth/auth-gate.tsx", "front/src/app/layout.tsx"], "verifyCommand": "cd front && npm run lint", "acceptanceCriteria": ["AuthGate alterna spinner/login/children", "LoginScreen faz signInWithPopup", "layout envolve em AuthProvider+AuthGate", "lint passa"], "requiresUserVerification": false}
```

---

### Task 8: Anexar token nas chamadas e logout no header

**Goal:** Enviar o ID token nas requisições de geração e adicionar usuário/logout ao `AppHeader`.

**Files:**
- Modify: `front/src/features/image-forge/lib/image-generation-api.ts`
- Modify: `front/src/features/image-forge/components/app-header.tsx`

**Acceptance Criteria:**
- [ ] `generateImage` anexa `Authorization: Bearer <idToken>`; sem token, lança erro claro.
- [ ] `AppHeader` mostra o usuário e um botão de logout (`useAuth().logout`).
- [ ] `npm run lint` passa.

**Verify:** `cd front && npm run lint` → sem erros

**Steps:**

- [ ] **Step 1: Anexar o token em `image-generation-api.ts`**

Adicionar o import no topo:

```ts
import { auth } from "@/lib/firebase";
```

Substituir o bloco do `fetch` (linhas ~52-55) por:

```ts
  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  const response = await fetch(`${API_URL}/image-generations/prompt`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
```

(Não definir `Content-Type` manualmente — o browser define o boundary do `multipart/form-data`.)

- [ ] **Step 2: Adicionar usuário/logout no `app-header.tsx`**

Tornar o componente client e usar o contexto. No topo do arquivo adicionar:

```tsx
"use client";

import { LogOut } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
```

(Os imports existentes de `Wand2`, `Button`, `Step` permanecem.) Dentro do componente `AppHeader`, antes do `return`:

```tsx
  const { user, logout } = useAuth();
```

Substituir o bloco do avatar fixo (`<div ...>VF</div>`) por nome do usuário + botão de logout:

```tsx
          <span className="hidden max-w-[12rem] truncate text-sm text-[#a3a3a3] sm:inline">
            {user?.displayName ?? user?.email ?? ""}
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={() => void logout()}
            className="flex items-center gap-2 rounded-lg border border-[#2a2a2a] px-3 py-2 text-sm text-[#a3a3a3] transition hover:bg-[#181818] hover:text-[#f5f5f5]"
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
```

- [ ] **Step 3: Lint**

Run: `cd front && npm run lint`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add front/src/features/image-forge/lib/image-generation-api.ts front/src/features/image-forge/components/app-header.tsx
git commit -m "feat(front): enviar ID token na geracao e logout no header"
```

```json:metadata
{"files": ["front/src/features/image-forge/lib/image-generation-api.ts", "front/src/features/image-forge/components/app-header.tsx"], "verifyCommand": "cd front && npm run lint", "acceptanceCriteria": ["generateImage anexa Bearer token", "erro claro sem token", "header mostra usuario e logout", "lint passa"], "requiresUserVerification": false}
```

---

### Task 9: Atualizar documentação (CLAUDE.md back e front)

**Goal:** Alinhar `back/CLAUDE.md` e `front/CLAUDE.md` à nova realidade (auth Firebase, sem banco SQL), de forma focada.

**Files:**
- Modify: `back/CLAUDE.md`, `front/CLAUDE.md`

**Acceptance Criteria:**
- [ ] `back/CLAUDE.md`: seção de autenticação descreve verificação de ID token do Firebase; tabela de env vars remove `DATABASE_URL`/`JWT_SECRET`/`REDIS_URL`/Steam/Asaas e adiciona `FIREBASE_ADMIN_*`, `OPENAI_*`; remover comandos `migrate`/`rev`/`seed`.
- [ ] `front/CLAUDE.md`: seção de autenticação descreve login Google via Firebase + `AuthGate`; env vars incluem `NEXT_PUBLIC_FIREBASE_*`.

**Verify:** Revisão manual do diff (`git diff back/CLAUDE.md front/CLAUDE.md`).

**Steps:**

- [ ] **Step 1: Editar `back/CLAUDE.md`** — substituir a seção **Authentication** por uma descrição do fluxo Firebase (frontend autentica com Google; backend verifica `Authorization: Bearer <idToken>` via `firebase-admin` em `app/firebase/dependencies.py:get_current_user`; rotas `/image-generations/*` protegidas). Atualizar a tabela de env vars: remover `DATABASE_URL`, `JWT_SECRET`, `STEAM_API_KEY`, `ASAAS_*`, `REDIS_URL`, `TRADE_DEADLINE_HOURS`, `PAYOUT_HOLD_HOURS`; adicionar `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`, `OPENAI_API_KEY`, `ALLOWED_ORIGINS`. Remover os comandos `task migrate/rev/seed` da seção Commands e a menção a SQLite/PostgreSQL/Redis.

- [ ] **Step 2: Editar `front/CLAUDE.md`** — substituir a seção **Authentication** (hoje descreve Steam OpenID) por: login com Google via Firebase (`signInWithPopup`); `AuthProvider`/`useAuth` em `src/contexts/auth-context.tsx`; `AuthGate` em `src/components/auth/` protege o app inteiro; perfil em Firestore `users/{uid}`; o ID token é anexado às chamadas de geração. Atualizar a tabela de env vars adicionando os `NEXT_PUBLIC_FIREBASE_*`.

- [ ] **Step 3: Commit**

```bash
git add back/CLAUDE.md front/CLAUDE.md
git commit -m "docs: atualizar CLAUDE.md para auth Firebase e remocao do banco"
```

```json:metadata
{"files": ["back/CLAUDE.md", "front/CLAUDE.md"], "verifyCommand": "git diff --stat back/CLAUDE.md front/CLAUDE.md", "acceptanceCriteria": ["back doc descreve auth Firebase e env vars novas", "front doc descreve login Google + AuthGate", "comandos de migracao removidos"], "requiresUserVerification": false}
```

---

## Notas finais

- **Env vars a configurar** (fora do plano de código): backend `.env` com `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`; frontend `.env.local` com `NEXT_PUBLIC_FIREBASE_*`.
- **Validação manual end-to-end** (após Task 8): subir `task dev` (back) e `npm run dev` (front), logar com Google, gerar uma imagem e confirmar que o backend aceita o token.
- **Regras do Firestore**: garantir que `users/{uid}` só seja gravável pelo próprio usuário autenticado (configuração no console do Firebase; fora do escopo de código deste plano).
