# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
npm run db:push  # Apply Prisma schema to SQLite
npm run db:seed  # Seed initial data (Tinta Coral + admin user)
npm run db:studio # Open Prisma Studio
```

## Environment Variables

Required in `.env.local`:
```
NEXTAUTH_SECRET=      # Random string for JWT signing
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL="file:./dev.db"
```

Initial credentials (from seed):
- Admin: `admin@pintores.com` / `Admin@123`

## Architecture

**Plataforma de Orçamento para Pintores** — ferramenta web para pintores montarem orçamentos profissionais de pintura.

### Tech Stack
- Next.js 16 (App Router), TypeScript, Tailwind v4
- Prisma + SQLite (migrate to PostgreSQL by changing DATABASE_URL)
- NextAuth v4 (credentials + JWT)
- @react-pdf/renderer (PDF generation in API route)
- Zod (validation), Lucide React, Sonner

### Route Structure
- `/(auth)/login` + `/register` — public auth pages
- `/(painter)/dashboard` — budget list (Server Component)
- `/(painter)/orcamento/novo` — 4-step wizard (Client Component)
- `/(painter)/orcamento/[id]` — budget detail (Server Component)
- `/resumo/[id]` — public shareable summary (Server Component, no auth)
- `/admin/*` — admin area (role: ADMIN only)
- `/api/auth/[...nextauth]` — NextAuth handler
- `/api/auth/register` — painter registration
- `/api/pdf/[id]` — PDF generation (public, linked from /resumo)

### Key Files
- `src/lib/calculations.ts` — pure calc functions (paintableArea, packages, totals)
- `src/lib/budget.ts` — Server Actions for budget CRUD + getPublicBudgetById
- `src/lib/products.ts` — Server Actions for product CRUD (admin only)
- `src/lib/auth.ts` — NextAuth config
- `src/lib/prisma.ts` — Prisma singleton
- `src/lib/pdf.tsx` — PDF document component (@react-pdf/renderer)
- `src/middleware.ts` — route protection by role
- `prisma/schema.prisma` — DB schema
- `prisma/seed.ts` — initial data

### Calculation Logic
```
Area pintável = (altura × largura) - portas - janelas
Área para tinta = área pintável × demãos
Embalagens = Math.ceil(área para tinta / rendimento por embalagem)
Total = subtotal materiais + mão de obra
```
