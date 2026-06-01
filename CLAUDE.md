# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Image Forge** — AI image-generation app. The user signs in with Google, uploads a face photo, picks a "universe" (Pokémon, Naruto, Avatar, Bleach, Copa, LEGO, etc.), customizes settings (background, format, outfit, and for Pokémon the creature placements), and the backend composes a Portuguese-aware prompt and calls OpenAI's `/images/edits` endpoint to produce a poster-style image with the user's likeness.

> **Stale docs warning:** The repo is named `EasyPost` and several root files describe an **abandoned** Dota 2 P2P escrow marketplace ("trade"/"TangoShop"). Do **not** trust these as a source of truth: `README.md` (describes a Postgres DB that no longer exists), `EPIC.md`, `PURCHASE_FLOW.md`, and the FastAPI title `"Trade API"` in `back/app/main.py`. The escrow product, its SQL database, Redis, and legacy backend modules have been **deleted**. Treat `back/app/main.py`'s router list and `back/app/config.py` as authoritative.

## Structure

| Directory | Stack | Notes |
|-----------|-------|-------|
| `back/` | Python 3.12, FastAPI, `uv`, `httpx`, `firebase-admin` | Three routers: `/pokemon`, `/image-generations`, `/generations`, plus `/health` and a static `/user-files` mount. |
| `front/` | Next.js 16.2, React 19, TS, Tailwind 4, Firebase JS SDK | Single-page wizard at `src/app/page.tsx`; feature code in `src/features/image-forge/`. |

`back/app/` contains only `config.py`, `main.py`, and the packages `common/`, `firebase/`, `generations/`, `image_generation/`, `pokemon/`. Any reference elsewhere to `app/auth`, `app/trade`, `app/worker`, or `app/observability` is outdated — those modules are gone.

## Commands

**Frontend** (`front/`):
```bash
npm install
npm run dev      # Dev server on port 3000
npm run build
npm run lint
```

**Backend** (`back/`) — uses `uv` + `taskipy` (`task` runs the scripts in `pyproject.toml`):
```bash
uv sync
task dev         # uvicorn app.main:app --reload on port 8004
task test        # pytest -s -x --cov=app -vv (stops on first failure)
task cov         # pytest with term-missing coverage report
uv run pytest tests/test_image_generation.py -v          # single file
uv run pytest tests/test_image_generation.py::test_name  # single test
uv run ruff check .
uv run ruff format .
```

Tests run with **no external services** — `tests/conftest.py` auto-overrides the `get_current_user` Firebase dependency with a fake user, and OpenAI/PokéAPI/Firebase Admin calls are mocked. Firebase Admin init failures are swallowed at import time so tests run without credentials.

**Docker (root):** `docker-compose up` builds `./back` (port **8004**) and `./front` (host **3002** → container 3000). Generated images persist through the bind mount `./storage/user-files:/app/storage/user-files`. Both services read the root `.env` (optional).

## Ports

| Process | Port |
|---------|------|
| Frontend dev (`npm run dev`) | 3000 |
| Frontend Docker | 3002 → 3000 |
| Backend (dev or Docker) | 8004 |

`NEXT_PUBLIC_API_URL` defaults to `http://localhost:8004` (`front/src/features/image-forge/constants.ts`).

## Authentication (Firebase)

All `/image-generations/*` and `/generations/*` endpoints require a Firebase ID token.

- **Frontend** authenticates via Firebase Auth (Google sign-in). `src/components/auth/auth-gate.tsx` gates the whole app behind login; `src/contexts/auth-context.tsx` exposes `useAuth()`. API calls attach `Authorization: Bearer <idToken>` from `auth.currentUser.getIdToken(true)`.
- **Backend** verifies the token in `app/firebase/dependencies.py::get_current_user` (a FastAPI dependency) using the Firebase Admin SDK initialized in `app/firebase/admin.py`. It returns `{"uid", "email"}`. Missing/invalid tokens → 401.
- Firebase env: frontend uses `NEXT_PUBLIC_FIREBASE_*`; backend uses `FIREBASE_ADMIN_PROJECT_ID` / `FIREBASE_ADMIN_CLIENT_EMAIL` / `FIREBASE_ADMIN_PRIVATE_KEY` (newlines escaped as `\n`).
- Firestore (frontend `src/lib/user-service.ts`) is used **only** to upsert a `users/{uid}` record on first login. Generated images are **not** stored in Firebase — see below.

## Where generated images live

Despite some commit messages mentioning "Firebase," generated images are stored on the **backend filesystem**, not in Firebase:

- `app/generations/storage.py` writes the decoded image under `{user_files_dir}/public/generations/<b64uid>/` and a JSON sidecar under `{user_files_dir}/metadata/generations/<b64uid>/`. `<b64uid>` is the URL-safe base64 of the Firebase uid.
- Images are served back as URLs via the static mount `app.mount("/user-files", ...)` in `main.py` (only the `public/` subtree is exposed).
- Flow: the frontend generates an image, then POSTs the base64 to `POST /generations` (`src/lib/generation-service.ts`) to persist it; the dashboard reads `GET /generations/recent`.

## Architecture

### Backend image-generation flow

`POST /image-generations/prompt` is the **generic** endpoint the frontend uses for **all** universes (including Pokémon). `POST /image-generations/pokemon` is an older dedicated form endpoint kept around but not called by the current frontend.

1. `router.py` parses the multipart form, validates with `PokemonImageGenerationInput` (`schemas.py`). For `prompt_template == "couple"` it requires a `face_image` plus 1–2 `body_images`; other templates take a single `reference_image`.
2. `prompt.py::build_pokemon_prompt` dispatches to `prompts/__init__.py::PROMPT_BUILDERS[prompt_template]`. The `pokemon` builder has a special signature (badges + creature placements); every other builder uses the generic signature (universe label, personal characteristics, reference notes, format, background, outfit).
3. `prompts/shared.py` holds shared prompt fragments: the mandatory PT-BR on-image-text rule, the "variables" block, and the outfit/position phrase helpers (`POSITION_PROMPTS` maps Portuguese position phrases to English directions).
4. `service.py::generate_image_with_reference` POSTs to `{openai_base_url}/images/edits` with the reference image(s) as `files["image"]` and prompt/model/size/quality as `data`. Returns base64. Distinguishes `OpenAIImageGenerationTimeout` (→ 504) from generic `OpenAIImageGenerationError` (→ 502, also raised when `OPENAI_API_KEY` is unset).

**Prompt templates** (`PromptTemplate` literal in `schemas.py`): `anime-general`, `avatar`, `bleach`, `copa`, `couple`, `lego`, `monster_high`, `pokemon`, `rick_morty`, `san_andreas`. To add one: add the literal to `PromptTemplate`, create `prompts/<name>.py` exporting `build_prompt`, and register it in `PROMPT_BUILDERS`.

`app/pokemon/` is a thin in-memory-cached proxy over `https://pokeapi.co/api/v2`, backing the frontend's Pokémon picker.

### Frontend wizard flow

`front/src/app/page.tsx` is one client component owning all wizard state across four steps: `dashboard → universe → settings → preview`.

- **Universes are data-driven.** `constants.ts::universes` lists 13 `UniverseOption`s; each carries a `promptTemplate` that maps the display name to a backend template. Note several map to the same template — e.g. `Kimetsu`, `Naruto`, `Digimon`, and `Anime Geral` all use `anime-general`.
- **Per-universe settings UI** is dispatched, not branched: `components/settings-step.tsx` holds `UNIVERSE_SETTINGS`, a `Record<Universe, Component>` keyed by display name. Each universe component lives in `components/settings/universes/` and accepts the shared `UniverseSettingsProps`. Adding a universe = add a `UniverseOption` to `constants.ts`, create a settings component, and register it in `UNIVERSE_SETTINGS`.
- `lib/image-generation-api.ts::generateImage` builds the `FormData`, derives `size` from the chosen `Format`, attaches the bearer token, and posts to `/image-generations/prompt`. `couple` sends `face_image` + `body_images`; everything else sends `reference_image`.
- `lib/prompt-template-rules.ts` toggles optional UI (`hasBackground`, `hasBadges`) by template.

### Configuration

`back/app/config.py` is a single pydantic-settings `Settings` loaded from `.env`. Fields the live code actually uses:

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Required for generation; unset → 502. |
| `OPENAI_IMAGE_MODEL` | Defaults to `gpt-image-2`. |
| `OPENAI_IMAGE_TIMEOUT_SECONDS` | OpenAI read timeout (default 300s). |
| `FIREBASE_ADMIN_PROJECT_ID` / `_CLIENT_EMAIL` / `_PRIVATE_KEY` | ID-token verification. |
| `ALLOWED_ORIGINS` | CORS list. |
| `USER_FILES_DIR` | Root for stored generations (default `storage/user-files`). |
| `POKEMON_API_BASE_URL` / `POKEMON_CACHE_TTL_SECONDS` | PokéAPI proxy. |

There are no longer any required DB/JWT fields. See `back/.env.example`.

## Next.js 16

This is **Next.js 16.2** — APIs and conventions may differ from older Next.js in training data. Consult `front/node_modules/next/dist/docs/` before writing Next.js-specific code.

## Reference prompts

The root-level `*.md` universe files (`pokemon.md`, `avatar.md`, `bleach.md`, `copa.md`, `couple.md`, `lego.md`, `monster_high.md`, `rick_morty.md`, `san_andreas.md`, `anime-general.md`) are human-authored prompt drafts that informed the builders in `back/app/image_generation/prompts/`. They are documentation, not used at runtime.
