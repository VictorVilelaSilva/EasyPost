# Decision Log: Instagram Content Generator

## 1. Core Architecture and Image Generation Approach
**Decision:** Use Next.js App Router with Vercel Edge Functions and `@vercel/og` (Satori) for dynamic image generation.
**Alternatives Considered:** 
- A heavy backend (Node/Express with Puppeteer) taking screenshots of HTML.
- Third-party API (Bannerbear/Placid).
**Rationale:** Satori is stateless, extremely fast, has zero per-image cost, and scales perfectly on Vercel without timeouts.

## 2. Content Generation API
**Decision:** Use Google's Gemini Flash model (`gemini-2.5-flash`) via the Vercel AI SDK.
**Rationale:** The task (generating 15 topics and 5 short slides) is straightforward and does not require reasoning-heavy or expensive models. Gemini 2.5 Flash is extremely fast and cost-effective.

## 3. Architecture & Data Flow
**Decision:** 2-step generation process.
1. `/api/generate-topics` -> Returns 15 topics based on User Niche.
2. `/api/generate-carousel` -> Returns JSON with 5 slide texts + 1 Instagram Caption based on selected topic.
**Rationale:** Separating topic generation from content generation reduces LLM latency and allows the user to pick the best idea before committing to a full generation.

## 4. Image Generation Flow
**Decision:** 100% Serverless/Stateless image generation via `/api/og` endpoint.
1. Frontend makes 5 distinct requests to `/api/og` endpoint with necessary slide parameters (text, theme).
2. Satori generates PNGs dynamically at the Edge.
3. Frontend downloads PNGs, zips them using `jszip`, and triggers a download.
**Alternatives Considered:** Saving images to an S3 bucket or Supabase Storage and providing a download link.
**Rationale:** Eliminates the need for cloud storage, reduces costs, simplifies the architecture (no cleanup scripts needed), and is significantly faster since it bypasses round-trips to an external bucket.
