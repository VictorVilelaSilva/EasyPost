# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Image Forge** — AI image-generation app. The user uploads a face photo, picks a universe (Pokémon, Kimetsu, Naruto, Digimon, Avatar), customizes settings (background, aspect ratio, outfit, Pokémon placements), and the backend builds a prompt and calls OpenAI's `/images/edits` endpoint to produce a poster-style image with the user's likeness.

> **Heads-up:** The repo is named `EasyPost` and several files (root README, `EPIC.md`, `back/README.md`, `pyproject.toml` description, the `Trade API` FastAPI title) still describe an older Dota 2 P2P escrow marketplace ("TangoShop"). That product was abandoned. Legacy modules (`back/app/auth`, `back/app/trade`, `back/app/worker`, `back/app/observability`, `back/app/common`) still sit on disk but are **not** imported by `back/app/main.py` — only `pokemon` and `image_generation` routers are wired. Don't trust the legacy code as a source of truth; treat `main.py`'s router list as authoritative.

## Structure

| Directory | Stack | Notes |
|-----------|-------|-------|
| `back/` | Python 3.12, FastAPI, `uv`, `httpx` | Two live routers: `/pokemon` (PokéAPI proxy) and `/image-generations` (OpenAI proxy). Plus `/health`. |
| `front/` | Next.js 16.2, React 19, TS, Tailwind 4 | Single-page wizard at `src/app/page.tsx`; all feature code in `src/features/image-forge/`. |

`back/CLAUDE.md` and `front/CLAUDE.md` currently describe the old escrow product — treat them as outdated until rewritten.

## Commands

**Frontend** (`front/`):
```bash
npm install
npm run dev      # Dev server on port 3000
npm run build
npm run lint
```

**Backend** (`back/`) — uses `uv` + `taskipy`:
```bash
uv sync
task dev         # uvicorn on port 8004, --reload
task test        # pytest with coverage
uv run pytest tests/test_image_generation.py -v   # single test file
uv run ruff check .
uv run ruff format .
```

Tests run without external services (no DB, no Redis, no network — OpenAI/PokéAPI calls are mocked).

**Docker (root):**
```bash
docker-compose up
```
This builds the backend (`./back`) and frontend (`./front`). The backend exposes port **8004** and persists generated user images through the bind mount `./storage/user-files:/app/storage/user-files`. The frontend maps host port **3002** to container port **3000**.

## Ports at a glance

| Process | Port |
|---------|------|
| Frontend dev (`npm run dev`) | 3000 |
| Frontend Docker | 3002 → 3000 |
| Backend dev (`task dev`) | 8004 |
| Backend Docker | 8004 |

The frontend's `NEXT_PUBLIC_API_URL` defaults to `http://localhost:8004` (`front/src/features/image-forge/constants.ts`).

## Architecture

### Frontend flow

`front/src/app/page.tsx` is a single client component that owns all wizard state and switches between four steps:

```
dashboard → universe → settings → preview
```

When the user hits "Generate" on `Pokemon`, `lib/image-generation-api.ts` posts a `multipart/form-data` request to `${API_URL}/image-generations/pokemon` with the reference image plus form fields (`trainer_name`, `background`, `image_format`, `badges_enabled`, outfit pieces, `pokemon` as JSON array, `size`, `quality`, `output_format`). Other universes currently short-circuit to the preview without calling the backend.

All UI lives under `src/features/image-forge/components/` split by step (`settings/*`, `preview/*`).

### Backend flow

`back/app/main.py` registers two routers and a `/health` endpoint. CORS allowed origins come from `settings.allowed_origins`.

- `app/pokemon/` — thin caching proxy over `https://pokeapi.co/api/v2`, used by the frontend's pokémon picker (`hooks/use-pokemon-search.ts`).
- `app/image_generation/`
  - `router.py` — `POST /image-generations/pokemon` accepts multipart form, validates with `PokemonImageGenerationInput`, builds a prompt, and calls the OpenAI service.
  - `prompt.py` — composes the final prompt from a base template + variable overrides (trainer name, outfit, pokémon placements with Portuguese-keyed position phrases).
  - `service.py` — `httpx.AsyncClient` POST to `{openai_base_url}/images/edits` with the uploaded image as `files["image"]` and prompt/model/size/quality as `data`. Returns the base64 image. Distinguishes `OpenAIImageGenerationTimeout` (504) from generic errors (502).

### Configuration

`back/app/config.py` defines a single `Settings` (pydantic-settings) with many legacy fields still marked required (`database_url`, `jwt_secret`) — `.env` must define them even though the live routers don't read them. The fields the active code actually uses are:

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Required for image generation; without it the endpoint returns 502. |
| `OPENAI_IMAGE_MODEL` | Defaults to `gpt-image-2`. |
| `OPENAI_IMAGE_TIMEOUT_SECONDS` | Read timeout for the OpenAI request (default 300s). |
| `ALLOWED_ORIGINS` | CORS list. |
| `POKEMON_API_BASE_URL` / `POKEMON_CACHE_TTL_SECONDS` | PokéAPI proxy. |

## Next.js 16

`front/AGENTS.md` says: **this is Next.js 16.2** — APIs and conventions may differ from older Next.js in training data. Consult `node_modules/next/dist/docs/` before writing Next.js-specific code.

## Reference prompts

`pokemon.md`, `avatar.md`, `anime-general.md` at the repo root are human-authored prompt drafts that informed the backend's `prompt.py` template. They are documentation, not used at runtime.
