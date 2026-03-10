# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

No test suite is configured in this project.

## Environment Variables

Required in `.env.local`:
```
GOOGLE_GENERATIVE_AI_API_KEY=   # Gemini API (text + image generation)
NEXT_PUBLIC_FIREBASE_*=          # Firebase Auth + Firestore
STRIPE_SECRET_KEY=               # Payment processing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## Architecture

**EasyPost** is an AI-powered carousel post creator for Instagram and LinkedIn. Users enter a niche, pick a topic, configure visuals, and get AI-generated slides they can edit in a canvas editor before downloading.

### Creation Workflow (4 steps)

Managed by two hooks in `src/app/create/`:
- `hooks/useStepNavigation.ts` — tracks `currentStep` (1–4), selected template, and font
- `src/hooks/useCarouselWorkflow.ts` — orchestrates all API calls and state (niche, topics, carouselData, backgrounds)

**Step 1** (`Step1Configuration`) → user sets platform, objective, slide count, niche
**Step 2** (`Step2TemplateSelection`) → pick a visual template or "AI-generated"
**Step 3** (`Step3ImageConfig`) → configure colors, audience, image styles
**Step 4** (`Step5CanvasEditor`) → drag text blocks, fuse with AI, download as ZIP

### API Routes (`src/app/api/`)

All routes use `@google/genai` with model `gemini-3-pro-image-preview`:

| Route | Purpose |
|---|---|
| `generate-topics` | Returns topic suggestions for a niche |
| `generate-carousel` | Generates slide text + caption |
| `generate-images` | Generates one complete image per slide with text already rendered |
| `generate-suggestions` | Generates text suggestions |
| `fuse-slide` | Composites text blocks onto a background image via Gemini image editing; supports `auto` (AI Criativa) and `manual` (Meu Estilo) modes |
| `create-payment-intent` | Stripe payment intent |

`generate-images` and `fuse-slide` have `maxDuration` set to 120s and 60s respectively (Vercel function timeout).

### Canvas Editor (`src/app/create/components/steps/canvas-editor/`)

- `CanvasEditorPhase.tsx` — 3-column layout: slide list sidebar, canvas center, properties panel
- `useCanvasLogic.ts` — all editor state: active slide, selected block, fused images, download
- `DraggableTextBlock.tsx` — drag-and-drop text positioning using `xPercent`/`yPercent`
- `PropertiesPanel.tsx` — font, color, size controls for selected block
- `constants.ts` — canvas dimensions: `CANVAS_W = 320`, Instagram 4:5, LinkedIn 1:1
- Text blocks use percentage-based coordinates (0–100) relative to canvas dimensions

### Core Types (`src/types/index.ts`)

Key interfaces: `SlideData`, `CarouselData`, `ImageConfig`, `TextBlock`, `SlideBackgrounds`, `BrandColors`

`SlideBackgrounds` stores 3 base64 variants each for `cover`, `content`, and `cta` slide types.

### Auth & Data

- Firebase Auth via `src/contexts/AuthContext.tsx` (`AuthProvider` + `useAuth`)
- Firestore user doc at `users/{uid}` with fields: `email`, `name`, `requestCount`, `isPaid`, `createdAt`
- `src/lib/userService.ts` — `createUserIfNotExists`, `incrementRequestCount`, `markAsPaid`, `getUserData`
- After successful image generation, `incrementRequestCount` is called

### Tema Global (globals.css)

Tailwind v4 — no config file, uses `@import "tailwindcss"`. Dark cinematic theme:
- CSS variables: `--color-surface`, `--color-text`, `--color-text-muted`
- Primary: `hsl(230, 85%, 60%)` | Accent/brand purple: `#7f0df2`
- Utility classes: `.glass-card`, `.gradient-text`, `.btn-glow`, `.animate-reveal`
- Fonts: `--font-display` (Sora) + `--font-body` (Space Grotesk), applied via CSS vars not Tailwind classes

### Static Templates

Template images live in `public/templates/{templateId}/` with subdirs `capa/`, `conteudo/`, `final/`. O fluxo atual de geração de imagens não depende mais de uma etapa intermediária de estilo.
