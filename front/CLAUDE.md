# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: Next.js Version

**This is Next.js 16.2** — it has breaking changes from versions in your training data. Before writing any Next.js code, read the relevant guide in `node_modules/next/dist/docs/`.

## Commands

```bash
npm install
npm run dev      # Dev server — port 3000
npm run build    # Production build
npm run lint     # ESLint
```

Backend requires Redis — start it from the repo root:
```bash
docker-compose up
```

---

## Architecture

### Stack

- **Next.js 16.2** (App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS 4** — styling
- **Framer Motion 12** — animations
- **Lucide React** — icons
- **Sonner** — toast notifications
- **Radix UI** — accessible primitives

### Directory Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # / — Marketplace listing
│   ├── dashboard/        # User inventory
│   ├── checkout/[id]/    # Purchase flow
│   ├── trade/[id]/       # Trade tracking (seller sends offer)
│   ├── order/[id]/       # Order status (buyer view)
│   ├── search/           # Search & filter
│   ├── onboarding/       # Trade URL setup (required before selling)
│   ├── auth/callback/    # Steam OpenID callback
│   └── api/              # Next.js API routes (proxy to backend)
├── components/
│   ├── ui/               # Generic reusable components
│   ├── layout/           # Header, nav, shell components
│   └── auth/             # Auth-specific components
└── lib/
    ├── api.ts            # Central API client (see below)
    ├── rarities.ts       # Dota 2 item rarity config
    └── utils.ts          # Shared utilities (cn, etc.)
```

### Componentization

Pages in `app/` should be thin — they orchestrate data and compose components, with no heavy inline JSX. Visual logic belongs in `components/`.

Rules:
- Any UI block reused in 2+ places becomes a component in `components/ui/`
- Components specific to a page go in `components/<domain>/` (e.g. `components/listing/`, `components/trade/`)
- Avoid "full-page" components — break them into smaller pieces with a single responsibility (card, skeleton, form, etc.)
- Loading skeletons are separate components (e.g. `InventorySkeleton`), not inline conditionals
- Prefer composition over excessive props: if a component takes more than ~5 props, consider splitting it

### API Layer (`src/lib/api.ts`)

All backend calls go through `apiFetch()`. It handles:
- Attaching the JWT access token from cookies
- Auto-refreshing the token on `401` and retrying the original request
- Typed responses — interfaces here mirror backend Pydantic schemas

Do not use raw `fetch` for backend calls — always use `apiFetch()`.

### Authentication

Steam OpenID flow: user is redirected to Steam → callback lands at `/auth/callback` → backend sets httpOnly refresh cookie and returns access token → stored for use in `apiFetch()`. The `/onboarding` page is required before a user can create listings (needs trade URL).

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend URL — defaults to `http://localhost:8000/api` |
