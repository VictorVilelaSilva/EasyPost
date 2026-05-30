# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Package manager:** `uv`

```bash
uv sync                      # Install dependencies
task dev                     # Dev server — port 8004, hot-reload
task test                    # Run tests with coverage
task cov                     # Coverage report
```

**Run a single test:**
```bash
uv run pytest tests/test_auth.py -v
uv run pytest -k "get_current_user" -v   # By name pattern
```

**Lint/format:**
```bash
uv run ruff check .
uv run ruff format .
```

Tests run without external services (no DB, no Redis, no network — OpenAI/PokéAPI calls are mocked, and the Firebase auth dependency is overridden in `tests/conftest.py`).

---

## Architecture

Stateless FastAPI app. `app/main.py` registers two routers (`pokemon`, `image_generation`) plus a `/health` endpoint. CORS allowed origins come from `settings.allowed_origins`.

```
app/
├── main.py                 # FastAPI app + /health
├── config.py               # Settings via pydantic-settings (reads .env, extra="ignore")
├── firebase/               # Firebase Admin init + get_current_user dependency
├── pokemon/                # PokéAPI caching proxy (in-memory cache)
└── image_generation/       # OpenAI image-generation proxy
```

- `app/pokemon/` — thin proxy over the PokéAPI with an in-memory TTL cache (`cache.py`).
- `app/image_generation/` — `router.py` exposes `POST /image-generations/pokemon` and `POST /image-generations/prompt` (multipart). `prompt.py` builds the prompt; `service.py` calls OpenAI `/images/edits`.

### Authentication

Login happens entirely on the frontend via Firebase (Google sign-in). The backend is a pure gatekeeper: `app/firebase/dependencies.py:get_current_user` reads the `Authorization: Bearer <idToken>` header and verifies it with `firebase-admin` (`app/firebase/admin.py`). It is injected into both `/image-generations/*` routes — requests without a valid token get `401`. The PokéAPI proxy is public.

The Admin SDK initializes from env vars (`FIREBASE_ADMIN_*`); initialization is wrapped so a missing credential never crashes import (e.g. in tests). User profiles live in Firestore (`users/{uid}`), written by the frontend on first login — the backend does not write to Firestore.

---

## Environment Variables (`.env`)

| Variable | Purpose |
|----------|---------|
| `FIREBASE_ADMIN_PROJECT_ID` | Firebase project id (token verification) |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Service account email |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Service account private key (`\n`-escaped) |
| `OPENAI_API_KEY` | Required for image generation; without it the endpoint returns 502 |
| `OPENAI_IMAGE_MODEL` | Defaults to `gpt-image-2` |
| `OPENAI_IMAGE_TIMEOUT_SECONDS` | OpenAI read timeout (default 300s) |
| `USER_FILES_DIR` | Local generated-image storage root (default `storage/user-files`) |
| `ALLOWED_ORIGINS` | CORS list (includes `http://localhost:3000` by default) |
| `POKEMON_API_BASE_URL` / `POKEMON_CACHE_TTL_SECONDS` | PokéAPI proxy |

`config.py` uses `extra="ignore"`, so leftover legacy keys in `.env` are harmless.
