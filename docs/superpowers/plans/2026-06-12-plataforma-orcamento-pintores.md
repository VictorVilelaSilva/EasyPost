# Plataforma de Orçamento para Pintores — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refatorar o repositório EasyPost em uma plataforma web para pintores montarem orçamentos de pintura.

**Architecture:** Next.js 16 App Router híbrido — Server Components para leitura de dados, Client Components para wizard e calculadora, Server Actions para mutações. Prisma + SQLite, NextAuth v4, geração de PDF via API route.

**Tech Stack:** Next.js 16, TypeScript, Tailwind v4, Prisma + SQLite, next-auth v4, bcryptjs, @react-pdf/renderer, Zod, Lucide React, Sonner

**User Verification:** NO

---

## Mapa de Arquivos

### Deletar (todo o código EasyPost)
- `src/app/create/` (diretório inteiro)
- `src/app/checkout/` (diretório inteiro)
- `src/app/preview/` (diretório inteiro)
- `src/app/_components/` (diretório inteiro)
- `src/app/api/` (todos os routes.ts exceto vamos recriar)
- `src/components/ColorPickerPopover.tsx`, `ExclusiveCheckbox.tsx`, `UsageLimitModal.tsx`
- `src/components/ui/android.tsx`, `src/components/ui/iphone.tsx`
- `src/contexts/AuthContext.tsx`, `src/contexts/PreviewContext.tsx`
- `src/hooks/` (todos os 4 hooks)
- `src/lib/` (todos os arquivos atuais)
- `src/types/index.ts`
- `src/app/sitemap.ts`

### Criar
```
prisma/schema.prisma
prisma/seed.ts
src/lib/prisma.ts
src/lib/auth.ts
src/lib/calculations.ts
src/lib/budget.ts
src/lib/products.ts
src/types/index.ts
src/types/next-auth.d.ts
src/middleware.ts
src/app/(auth)/login/page.tsx          (substituir)
src/app/(auth)/login/components/LoginForm.tsx  (substituir)
src/app/(auth)/register/page.tsx
src/app/(auth)/register/components/RegisterForm.tsx
src/app/(painter)/layout.tsx
src/app/(painter)/dashboard/page.tsx
src/app/(painter)/dashboard/components/BudgetList.tsx
src/app/(painter)/orcamento/novo/page.tsx
src/app/(painter)/orcamento/novo/components/BudgetWizard.tsx
src/app/(painter)/orcamento/novo/components/Step1Client.tsx
src/app/(painter)/orcamento/novo/components/Step2Area.tsx
src/app/(painter)/orcamento/novo/components/AreaCalculator.tsx
src/app/(painter)/orcamento/novo/components/Step3Materials.tsx
src/app/(painter)/orcamento/novo/components/Step4Summary.tsx
src/app/(painter)/orcamento/[id]/page.tsx
src/app/resumo/[id]/page.tsx
src/app/api/auth/[...nextauth]/route.ts
src/app/api/pdf/[id]/route.ts
src/app/admin/layout.tsx
src/app/admin/page.tsx
src/app/admin/produtos/page.tsx
src/app/admin/produtos/components/ProductForm.tsx
src/app/admin/pintores/page.tsx
src/components/GlobalHeader.tsx        (substituir)
src/components/StatusBadge.tsx
```

### Modificar
```
package.json
src/app/layout.tsx
src/app/page.tsx
src/app/globals.css
.env.local (criar se não existir)
CLAUDE.md
```

---

## Task 0: Limpar Repositório e Atualizar Dependências

**Goal:** Remover todo o código EasyPost, instalar as novas dependências e configurar env vars.

**Files:**
- Modify: `package.json`
- Delete: todos os listados na seção "Deletar" acima
- Create: `.env.local`

**Acceptance Criteria:**
- [ ] `npm install` roda sem erros
- [ ] `npm run build` falha apenas por falta de arquivos (esperado neste ponto)
- [ ] Nenhum import de firebase/genai/stripe no projeto

**Steps:**

- [ ] **Step 1: Deletar arquivos antigos**

```bash
cd "/home/victorhbi/Área de trabalho/projects/EasyPost"
rm -rf src/app/create src/app/checkout src/app/preview src/app/_components
rm -rf src/app/api
rm -f src/components/ColorPickerPopover.tsx src/components/ExclusiveCheckbox.tsx
rm -f src/components/UsageLimitModal.tsx
rm -f src/components/ui/android.tsx src/components/ui/iphone.tsx
rm -f src/contexts/AuthContext.tsx src/contexts/PreviewContext.tsx
rm -rf src/hooks
rm -f src/lib/creationLog.ts src/lib/downloadZip.ts src/lib/extractColors.ts
rm -f src/lib/firebaseAdmin.ts src/lib/firebase.ts src/lib/resizeImage.ts
rm -f src/lib/stripe.ts src/lib/textOverlay.ts src/lib/usageLimits.ts src/lib/userService.ts
rm -f src/types/index.ts src/app/sitemap.ts
```

- [ ] **Step 2: Atualizar package.json**

Substituir o conteúdo de `package.json` por:

```json
{
  "name": "pintores-orcamento",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^6.0.0",
    "@react-pdf/renderer": "^4.0.0",
    "bcryptjs": "^2.4.3",
    "lucide-react": "^0.475.0",
    "next": "16.1.6",
    "next-auth": "^4.24.11",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "sonner": "^2.0.7",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "prisma": "^6.0.0",
    "tailwindcss": "^4",
    "tsx": "^4.19.2",
    "typescript": "^5"
  }
}
```

- [ ] **Step 3: Instalar dependências**

```bash
npm install
```

- [ ] **Step 4: Criar .env.local**

```bash
cat > .env.local << 'EOF'
NEXTAUTH_SECRET=mude-isso-para-uma-string-aleatoria-em-producao
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL="file:./prisma/dev.db"
EOF
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove EasyPost code, update dependencies for orcamento platform"
```

```json:metadata
{"files": ["package.json", ".env.local"], "verifyCommand": "npm install", "acceptanceCriteria": ["npm install sem erros", "sem imports de firebase/stripe no projeto"], "requiresUserVerification": false}
```

---

## Task 1: Prisma Schema, Seed e lib/prisma.ts

**Goal:** Criar o banco SQLite com todos os models e popular com dados iniciais.

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `src/lib/prisma.ts`

**Acceptance Criteria:**
- [ ] `npm run db:push` cria o banco sem erros
- [ ] `npm run db:seed` cria Tinta Coral e usuário admin
- [ ] `npx prisma studio` mostra as tabelas criadas

**Steps:**

- [ ] **Step 1: Criar prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

enum Role {
  PAINTER
  ADMIN
}

enum Status {
  DRAFT
  SENT
  APPROVED
  REJECTED
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  phone     String?
  password  String
  role      Role     @default(PAINTER)
  createdAt DateTime @default(now())
  budgets   Budget[]
}

model Product {
  id             String          @id @default(cuid())
  name           String
  brand          String
  line           String?
  finish         String?
  packageSize    Float
  packageLabel   String
  yieldM2        Float
  price          Float
  isActive       Boolean         @default(true)
  notes          String?
  budgetProducts BudgetProduct[]
}

model Budget {
  id            String            @id @default(cuid())
  painterId     String
  painter       User              @relation(fields: [painterId], references: [id])
  clientName    String
  clientPhone   String?
  clientAddress String?
  clientNotes   String?
  status        Status            @default(DRAFT)
  laborValue    Float             @default(0)
  laborDeadline String?
  paymentMethod String?
  laborNotes    String?
  totalMaterials Float            @default(0)
  totalValue    Float             @default(0)
  validity      Int?
  notes         String?
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
  areas         BudgetArea[]
  products      BudgetProduct[]
  extraItems    BudgetExtraItem[]
}

model BudgetArea {
  id           String @id @default(cuid())
  budgetId     String
  budget       Budget @relation(fields: [budgetId], references: [id], onDelete: Cascade)
  name         String
  totalArea    Float
  coats        Int    @default(2)
  areaForPaint Float
  notes        String?
}

model BudgetProduct {
  id        String  @id @default(cuid())
  budgetId  String
  budget    Budget  @relation(fields: [budgetId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Float
  unitPrice Float
  subtotal  Float
}

model BudgetExtraItem {
  id        String @id @default(cuid())
  budgetId  String
  budget    Budget @relation(fields: [budgetId], references: [id], onDelete: Cascade)
  name      String
  quantity  Float
  unitPrice Float
  subtotal  Float
}
```

- [ ] **Step 2: Criar src/lib/prisma.ts**

```ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

- [ ] **Step 3: Criar prisma/seed.ts**

```ts
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Produto padrão Coral
  await prisma.product.upsert({
    where: { id: "coral-padrao-inicial" },
    update: {},
    create: {
      id: "coral-padrao-inicial",
      name: "Tinta Coral Padrão Inicial",
      brand: "Coral",
      line: "a definir",
      finish: "a definir",
      packageSize: 18,
      packageLabel: "lata 18L",
      yieldM2: 50,
      price: 0,
      notes: "Produto padrão inicial. Atualize o preço e rendimento na área admin.",
    },
  })

  // Admin inicial
  const hashed = await bcrypt.hash("Admin@123", 12)
  await prisma.user.upsert({
    where: { email: "admin@pintores.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@pintores.com",
      password: hashed,
      role: "ADMIN",
    },
  })

  console.log("Seed concluído.")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

- [ ] **Step 4: Gerar client e aplicar schema**

```bash
npx prisma generate
npm run db:push
npm run db:seed
```

Esperado: `Seed concluído.`

- [ ] **Step 5: Commit**

```bash
git add prisma/ src/lib/prisma.ts
git commit -m "feat: add Prisma schema, SQLite seed, and prisma singleton"
```

```json:metadata
{"files": ["prisma/schema.prisma", "prisma/seed.ts", "src/lib/prisma.ts"], "verifyCommand": "npm run db:push && npm run db:seed", "acceptanceCriteria": ["banco criado sem erros", "seed insere Coral e admin"], "requiresUserVerification": false}
```

---

## Task 2: NextAuth Config, Middleware e Tipos

**Goal:** Autenticação funcional com login/logout, proteção de rotas por middleware.

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/middleware.ts`
- Create: `src/types/next-auth.d.ts`

**Acceptance Criteria:**
- [ ] `GET /api/auth/providers` retorna `credentials`
- [ ] Middleware redireciona `/dashboard` → `/login` se não logado
- [ ] Middleware redireciona `/admin` → `/dashboard` se não for ADMIN

**Steps:**

- [ ] **Step 1: Criar src/lib/auth.ts**

```ts
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user) return null
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null
        return { id: user.id, name: user.name, email: user.email, role: user.role }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: string }).role
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: { signIn: "/login" },
}
```

- [ ] **Step 2: Criar src/app/api/auth/[...nextauth]/route.ts**

```ts
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

- [ ] **Step 3: Criar src/types/next-auth.d.ts**

```ts
import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      name?: string | null
      email?: string | null
    }
  }
  interface User {
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
  }
}
```

- [ ] **Step 4: Criar src/middleware.ts**

```ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === "ADMIN"
    const isAdminPath = req.nextUrl.pathname.startsWith("/admin")

    if (isAdminPath && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/orcamento/:path*", "/admin/:path*"],
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts src/app/api/ src/middleware.ts src/types/
git commit -m "feat: add NextAuth credentials auth, JWT session, route middleware"
```

```json:metadata
{"files": ["src/lib/auth.ts", "src/app/api/auth/[...nextauth]/route.ts", "src/middleware.ts", "src/types/next-auth.d.ts"], "verifyCommand": "npm run dev", "acceptanceCriteria": ["GET /api/auth/providers retorna credentials", "middleware protege /dashboard e /admin"], "requiresUserVerification": false}
```

---

## Task 3: Tipos de Domínio e Funções de Cálculo

**Goal:** Tipos TypeScript do domínio e funções puras de cálculo de área/tinta.

**Files:**
- Create: `src/types/index.ts`
- Create: `src/lib/calculations.ts`

**Acceptance Criteria:**
- [ ] `calcPaintableArea` desconta portas e janelas corretamente
- [ ] `calcPackages` arredonda para cima (Math.ceil)
- [ ] `calcTotals` soma materiais + mão de obra
- [ ] `npm run build` não apresenta erros de tipo

**Steps:**

- [ ] **Step 1: Criar src/types/index.ts**

```ts
export type BudgetStatus = "DRAFT" | "SENT" | "APPROVED" | "REJECTED"
export type UserRole = "PAINTER" | "ADMIN"

export interface AreaInput {
  name: string
  mode: "known" | "calculate"
  // modo "known"
  knownArea?: number
  coats: number
  // modo "calculate"
  wallHeight?: number
  wallWidth?: number
  doorsCount?: number
  doorHeight?: number
  doorWidth?: number
  windowsCount?: number
  windowHeight?: number
  windowWidth?: number
}

export interface WizardProduct {
  productId: string
  name: string
  packageLabel: string
  yieldM2: number
  unitPrice: number
  quantity: number
  subtotal: number
}

export interface WizardExtraItem {
  name: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface WizardState {
  clientName: string
  clientPhone: string
  clientAddress: string
  clientNotes: string
  areas: AreaInput[]
  products: WizardProduct[]
  extraItems: WizardExtraItem[]
  laborValue: number
  laborDeadline: string
  paymentMethod: string
  laborNotes: string
  totalMaterials: number
  totalValue: number
}
```

- [ ] **Step 2: Criar src/lib/calculations.ts**

```ts
import type { AreaInput } from "@/types"

export function calcPaintableArea(area: AreaInput): number {
  if (area.mode === "known") {
    return area.knownArea ?? 0
  }
  const gross = (area.wallHeight ?? 0) * (area.wallWidth ?? 0)
  const doorsArea = (area.doorsCount ?? 0) * (area.doorHeight ?? 0) * (area.doorWidth ?? 0)
  const windowsArea = (area.windowsCount ?? 0) * (area.windowHeight ?? 0) * (area.windowWidth ?? 0)
  return Math.max(0, gross - doorsArea - windowsArea)
}

export function calcAreaForPaint(paintableArea: number, coats: number): number {
  return paintableArea * Math.max(1, coats)
}

export function calcPackages(areaForPaint: number, yieldM2: number): number {
  if (yieldM2 <= 0 || areaForPaint <= 0) return 0
  return Math.ceil(areaForPaint / yieldM2)
}

export function calcTotals(
  products: { quantity: number; unitPrice: number }[],
  extraItems: { quantity: number; unitPrice: number }[],
  laborValue: number
): { totalMaterials: number; totalValue: number } {
  const productSubtotal = products.reduce((s, p) => s + p.quantity * p.unitPrice, 0)
  const extraSubtotal = extraItems.reduce((s, e) => s + e.quantity * e.unitPrice, 0)
  const totalMaterials = productSubtotal + extraSubtotal
  return { totalMaterials, totalValue: totalMaterials + laborValue }
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function parseDecimal(value: string): number {
  return parseFloat(value.replace(",", ".")) || 0
}
```

- [ ] **Step 3: Verificar tipos**

```bash
npx tsc --noEmit
```

Esperado: sem erros relacionados a `src/types/` ou `src/lib/calculations.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/types/ src/lib/calculations.ts
git commit -m "feat: add domain types and pure calculation functions"
```

```json:metadata
{"files": ["src/types/index.ts", "src/lib/calculations.ts"], "verifyCommand": "npx tsc --noEmit", "acceptanceCriteria": ["calcPackages usa Math.ceil", "calcPaintableArea desconta portas e janelas", "sem erros de tipo"], "requiresUserVerification": false}
```

---

## Task 4: Layout Global, Componentes Base e Globals.css

**Goal:** Layout raiz limpo, GlobalHeader, StatusBadge e CSS sem rastros do EasyPost.

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Create: `src/app/(painter)/layout.tsx`
- Create: `src/components/GlobalHeader.tsx`
- Create: `src/components/StatusBadge.tsx`
- Modify: `src/app/page.tsx`

**Acceptance Criteria:**
- [ ] `npm run dev` inicia sem erros de compilação
- [ ] `/` redireciona para `/dashboard` (logado) ou `/login` (não logado)
- [ ] GlobalHeader exibe nome do usuário e botão de logout

**Steps:**

- [ ] **Step 1: Atualizar src/app/globals.css**

```css
@import "tailwindcss";

:root {
  --font-body: "Inter", system-ui, sans-serif;
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-surface: #ffffff;
  --color-surface-secondary: #f8fafc;
  --color-border: #e2e8f0;
  --color-text: #0f172a;
  --color-text-muted: #64748b;
}

body {
  font-family: var(--font-body);
  background: var(--color-surface-secondary);
  color: var(--color-text);
}
```

- [ ] **Step 2: Atualizar src/app/layout.tsx**

```tsx
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: "Orçamento de Pintura",
  description: "Plataforma para pintores gerarem orçamentos profissionais",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Criar src/app/(painter)/layout.tsx**

```tsx
import GlobalHeader from "@/components/GlobalHeader"

export default function PainterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-surface-secondary)" }}>
      <GlobalHeader />
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
```

- [ ] **Step 4: Criar src/components/GlobalHeader.tsx**

```tsx
"use client"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { LogOut, PaintBucket } from "lucide-react"

export default function GlobalHeader() {
  const { data: session } = useSession()

  return (
    <header
      style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}
      className="px-4 py-3"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-sm">
          <PaintBucket size={18} style={{ color: "var(--color-primary)" }} />
          Orçamento de Pintura
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {session?.user?.name}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1 text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}
```

Note: `GlobalHeader` usa `useSession` → precisa de `SessionProvider`. Adicionar um provider wrapper:

Criar `src/components/SessionProviderWrapper.tsx`:

```tsx
"use client"
import { SessionProvider } from "next-auth/react"

export default function SessionProviderWrapper({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

Atualizar `src/app/layout.tsx` para envolver com `SessionProviderWrapper`:

```tsx
import SessionProviderWrapper from "@/components/SessionProviderWrapper"
// ...
<body>
  <SessionProviderWrapper>{children}</SessionProviderWrapper>
  <Toaster richColors position="top-right" />
</body>
```

- [ ] **Step 5: Criar src/components/StatusBadge.tsx**

```tsx
import type { BudgetStatus } from "@/types"

const config: Record<BudgetStatus, { label: string; color: string; bg: string }> = {
  DRAFT:    { label: "Rascunho", color: "#92400e", bg: "#fef3c7" },
  SENT:     { label: "Enviado",  color: "#1e40af", bg: "#dbeafe" },
  APPROVED: { label: "Aprovado", color: "#065f46", bg: "#d1fae5" },
  REJECTED: { label: "Recusado", color: "#991b1b", bg: "#fee2e2" },
}

export default function StatusBadge({ status }: { status: BudgetStatus }) {
  const { label, color, bg } = config[status]
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ color, background: bg }}
    >
      {label}
    </span>
  )
}
```

- [ ] **Step 6: Atualizar src/app/page.tsx**

```tsx
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  redirect(session ? "/dashboard" : "/login")
}
```

- [ ] **Step 7: Verificar dev server**

```bash
npm run dev
```

Abrir `http://localhost:3000` — deve redirecionar para `/login`.

- [ ] **Step 8: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx src/app/page.tsx
git add src/app/\(painter\)/layout.tsx src/components/
git commit -m "feat: add layout, GlobalHeader, StatusBadge, clean CSS"
```

```json:metadata
{"files": ["src/app/globals.css", "src/app/layout.tsx", "src/app/(painter)/layout.tsx", "src/components/GlobalHeader.tsx", "src/components/StatusBadge.tsx", "src/app/page.tsx"], "verifyCommand": "npm run dev", "acceptanceCriteria": ["/ redireciona para /login", "sem erros de compilação"], "requiresUserVerification": false}
```

---

## Task 5: Páginas de Autenticação (Login + Register)

**Goal:** Telas de login e cadastro funcionais com NextAuth credentials.

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`
- Modify: `src/app/(auth)/login/components/LoginForm.tsx`
- Create: `src/app/(auth)/register/page.tsx`
- Create: `src/app/(auth)/register/components/RegisterForm.tsx`

**Acceptance Criteria:**
- [ ] Login com `admin@pintores.com` / `Admin@123` redireciona para `/dashboard`
- [ ] Credenciais erradas exibem mensagem de erro
- [ ] Registro cria novo pintor e redireciona para `/login`

**Steps:**

- [ ] **Step 1: Atualizar src/app/(auth)/login/page.tsx**

```tsx
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import LoginForm from "./components/LoginForm"

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect("/dashboard")

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--color-surface-secondary)" }}>
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2">Orçamento de Pintura</h1>
        <p className="text-center text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
          Entre com sua conta para continuar
        </p>
        <LoginForm />
        <p className="text-center text-sm mt-4" style={{ color: "var(--color-text-muted)" }}>
          Não tem conta?{" "}
          <a href="/register" style={{ color: "var(--color-primary)" }}>
            Cadastre-se
          </a>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Atualizar src/app/(auth)/login/components/LoginForm.tsx**

```tsx
"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const data = new FormData(e.currentTarget)
    const result = await signIn("credentials", {
      email: data.get("email"),
      password: data.get("password"),
      redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError("Email ou senha incorretos.")
      return
    }
    router.push("/dashboard")
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        className="w-full px-3 py-2 rounded-lg border text-sm"
        style={{ borderColor: "var(--color-border)" }}
      />
      <input
        name="password"
        type="password"
        placeholder="Senha"
        required
        className="w-full px-3 py-2 rounded-lg border text-sm"
        style={{ borderColor: "var(--color-border)" }}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 rounded-lg text-sm font-medium text-white"
        style={{ background: loading ? "#93c5fd" : "var(--color-primary)" }}
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  )
}
```

- [ ] **Step 3: Criar src/app/(auth)/register/page.tsx**

```tsx
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import RegisterForm from "./components/RegisterForm"

export default async function RegisterPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect("/dashboard")

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--color-surface-secondary)" }}>
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2">Criar conta</h1>
        <p className="text-center text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
          Preencha os dados para se cadastrar
        </p>
        <RegisterForm />
        <p className="text-center text-sm mt-4" style={{ color: "var(--color-text-muted)" }}>
          Já tem conta?{" "}
          <a href="/login" style={{ color: "var(--color-primary)" }}>
            Entrar
          </a>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Criar src/app/(auth)/register/components/RegisterForm.tsx**

```tsx
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const data = new FormData(e.currentTarget)
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        email: data.get("email"),
        phone: data.get("phone"),
        password: data.get("password"),
      }),
    })
    setLoading(false)
    if (!res.ok) {
      const body = await res.json()
      setError(body.error ?? "Erro ao criar conta.")
      return
    }
    toast.success("Conta criada! Faça login.")
    router.push("/login")
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {["name","email","phone","password"].map((field) => (
        <input
          key={field}
          name={field}
          type={field === "password" ? "password" : field === "email" ? "email" : "text"}
          placeholder={{ name: "Nome completo", email: "Email", phone: "Telefone", password: "Senha" }[field]}
          required={field !== "phone"}
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: "var(--color-border)" }}
        />
      ))}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 rounded-lg text-sm font-medium text-white"
        style={{ background: loading ? "#93c5fd" : "var(--color-primary)" }}
      >
        {loading ? "Criando..." : "Criar conta"}
      </button>
    </form>
  )
}
```

- [ ] **Step 5: Criar API route de registro src/app/api/auth/register/route.ts**

```ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 })
  }
  const { name, email, phone, password } = result.data
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) {
    return NextResponse.json({ error: "Email já cadastrado." }, { status: 409 })
  }
  const hashed = await bcrypt.hash(password, 12)
  await prisma.user.create({ data: { name, email, phone, password: hashed } })
  return NextResponse.json({ ok: true }, { status: 201 })
}
```

- [ ] **Step 6: Testar fluxo completo**

```bash
npm run dev
```

1. Acessar `http://localhost:3000/login`
2. Login com `admin@pintores.com` / `Admin@123` → deve ir para `/dashboard` (404 por enquanto, OK)
3. Acessar `/register`, criar novo pintor → deve voltar para `/login`

- [ ] **Step 7: Commit**

```bash
git add src/app/\(auth\)/ src/app/api/auth/
git commit -m "feat: add login and register pages with NextAuth credentials"
```

```json:metadata
{"files": ["src/app/(auth)/login/page.tsx", "src/app/(auth)/login/components/LoginForm.tsx", "src/app/(auth)/register/page.tsx", "src/app/(auth)/register/components/RegisterForm.tsx", "src/app/api/auth/register/route.ts"], "verifyCommand": "npm run dev", "acceptanceCriteria": ["login com admin@pintores.com funciona", "registro cria pintor", "credenciais erradas mostram erro"], "requiresUserVerification": false}
```

---

## Task 6: Dashboard do Pintor e Server Actions de Orçamento

**Goal:** Painel com lista de orçamentos do pintor e Server Actions CRUD.

**Files:**
- Create: `src/lib/budget.ts`
- Create: `src/app/(painter)/dashboard/page.tsx`
- Create: `src/app/(painter)/dashboard/components/BudgetList.tsx`

**Acceptance Criteria:**
- [ ] `/dashboard` exibe lista de orçamentos do pintor logado
- [ ] Botão "Novo orçamento" leva para `/orcamento/novo`
- [ ] Orçamentos mostram: cliente, data, status, valor total

**Steps:**

- [ ] **Step 1: Criar src/lib/budget.ts**

```ts
"use server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import type { WizardState } from "@/types"

async function getSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Não autenticado")
  return session
}

export async function getMyBudgets() {
  const session = await getSession()
  return prisma.budget.findMany({
    where: { painterId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      clientName: true,
      status: true,
      totalValue: true,
      createdAt: true,
    },
  })
}

export async function saveBudget(state: WizardState) {
  const session = await getSession()

  const budget = await prisma.budget.create({
    data: {
      painterId: session.user.id,
      clientName: state.clientName,
      clientPhone: state.clientPhone,
      clientAddress: state.clientAddress,
      clientNotes: state.clientNotes,
      laborValue: state.laborValue,
      laborDeadline: state.laborDeadline,
      paymentMethod: state.paymentMethod,
      laborNotes: state.laborNotes,
      totalMaterials: state.totalMaterials,
      totalValue: state.totalValue,
      areas: {
        create: state.areas.map((a) => ({
          name: a.name,
          totalArea: a.knownArea ?? 0,
          coats: a.coats,
          areaForPaint: (a.knownArea ?? 0) * a.coats,
        })),
      },
      products: {
        create: state.products.map((p) => ({
          productId: p.productId,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          subtotal: p.subtotal,
        })),
      },
      extraItems: {
        create: state.extraItems.map((e) => ({
          name: e.name,
          quantity: e.quantity,
          unitPrice: e.unitPrice,
          subtotal: e.subtotal,
        })),
      },
    },
  })

  revalidatePath("/dashboard")
  return { id: budget.id }
}

export async function updateBudgetStatus(
  id: string,
  status: "DRAFT" | "SENT" | "APPROVED" | "REJECTED"
) {
  const session = await getSession()
  await prisma.budget.update({
    where: { id, painterId: session.user.id },
    data: { status },
  })
  revalidatePath("/dashboard")
}

export async function deleteBudget(id: string) {
  const session = await getSession()
  await prisma.budget.delete({ where: { id, painterId: session.user.id } })
  revalidatePath("/dashboard")
}

export async function getBudgetById(id: string) {
  const session = await getSession()
  return prisma.budget.findFirst({
    where: { id, painterId: session.user.id },
    include: { areas: true, products: { include: { product: true } }, extraItems: true },
  })
}
```

- [ ] **Step 2: Criar src/app/(painter)/dashboard/page.tsx**

```tsx
import { getMyBudgets } from "@/lib/budget"
import BudgetList from "./components/BudgetList"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function DashboardPage() {
  const budgets = await getMyBudgets()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Meus Orçamentos</h1>
        <Link
          href="/orcamento/novo"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "var(--color-primary)" }}
        >
          <Plus size={16} />
          Novo orçamento
        </Link>
      </div>
      <BudgetList budgets={budgets} />
    </div>
  )
}
```

- [ ] **Step 3: Criar src/app/(painter)/dashboard/components/BudgetList.tsx**

```tsx
"use client"
import StatusBadge from "@/components/StatusBadge"
import type { BudgetStatus } from "@/types"
import { formatCurrency } from "@/lib/calculations"
import Link from "next/link"

interface Budget {
  id: string
  clientName: string
  status: string
  totalValue: number
  createdAt: Date
}

export default function BudgetList({ budgets }: { budgets: Budget[] }) {
  if (budgets.length === 0) {
    return (
      <div className="text-center py-16" style={{ color: "var(--color-text-muted)" }}>
        <p className="text-lg mb-2">Nenhum orçamento ainda</p>
        <p className="text-sm">Clique em "Novo orçamento" para começar.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {budgets.map((b) => (
        <Link
          key={b.id}
          href={`/orcamento/${b.id}`}
          className="flex items-center justify-between p-4 rounded-xl border"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <div>
            <p className="font-medium text-sm">{b.clientName}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              {new Date(b.createdAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">{formatCurrency(b.totalValue)}</span>
            <StatusBadge status={b.status as BudgetStatus} />
          </div>
        </Link>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Verificar**

```bash
npm run dev
```

Login → deve ver `/dashboard` com lista vazia e botão "Novo orçamento".

- [ ] **Step 5: Commit**

```bash
git add src/lib/budget.ts src/app/\(painter\)/dashboard/
git commit -m "feat: add dashboard, budget list, and budget server actions"
```

```json:metadata
{"files": ["src/lib/budget.ts", "src/app/(painter)/dashboard/page.tsx", "src/app/(painter)/dashboard/components/BudgetList.tsx"], "verifyCommand": "npm run dev", "acceptanceCriteria": ["/dashboard carrega com lista vazia", "botão novo orçamento visível", "saveBudget persiste no banco"], "requiresUserVerification": false}
```

---

## Task 7: Wizard de Criação de Orçamento (Etapas 1–4)

**Goal:** Fluxo completo de criação de orçamento com calculadora de área.

**Files:**
- Create: `src/app/(painter)/orcamento/novo/page.tsx`
- Create: `src/app/(painter)/orcamento/novo/components/BudgetWizard.tsx`
- Create: `src/app/(painter)/orcamento/novo/components/Step1Client.tsx`
- Create: `src/app/(painter)/orcamento/novo/components/AreaCalculator.tsx`
- Create: `src/app/(painter)/orcamento/novo/components/Step2Area.tsx`
- Create: `src/app/(painter)/orcamento/novo/components/Step3Materials.tsx`
- Create: `src/app/(painter)/orcamento/novo/components/Step4Summary.tsx`

**Acceptance Criteria:**
- [ ] Navegação entre etapas 1→2→3→4 funciona
- [ ] Calculadora de área desconta portas e janelas
- [ ] "+ Adicionar ambiente" permite múltiplos ambientes
- [ ] Tinta Coral pré-selecionada na etapa 3
- [ ] Quantidade de embalagens calculada automaticamente
- [ ] "Salvar orçamento" persiste no banco e redireciona para `/dashboard`

**Steps:**

- [ ] **Step 1: Criar src/app/(painter)/orcamento/novo/page.tsx**

```tsx
import { prisma } from "@/lib/prisma"
import BudgetWizard from "./components/BudgetWizard"

export default async function NovOrcamentoPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  })
  return <BudgetWizard products={products} />
}
```

- [ ] **Step 2: Criar src/app/(painter)/orcamento/novo/components/BudgetWizard.tsx**

```tsx
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { saveBudget } from "@/lib/budget"
import { calcTotals } from "@/lib/calculations"
import type { WizardState } from "@/types"
import Step1Client from "./Step1Client"
import Step2Area from "./Step2Area"
import Step3Materials from "./Step3Materials"
import Step4Summary from "./Step4Summary"

const STEPS = ["Cliente", "Área", "Materiais", "Resumo"]

const INITIAL_STATE: WizardState = {
  clientName: "", clientPhone: "", clientAddress: "", clientNotes: "",
  areas: [{ name: "Ambiente 1", mode: "known", knownArea: 0, coats: 2 }],
  products: [], extraItems: [],
  laborValue: 0, laborDeadline: "", paymentMethod: "", laborNotes: "",
  totalMaterials: 0, totalValue: 0,
}

interface Product {
  id: string; name: string; brand: string; packageLabel: string; yieldM2: number; price: number
}

export default function BudgetWizard({ products }: { products: Product[] }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [state, setState] = useState<WizardState>(() => {
    const defaultProduct = products[0]
    if (!defaultProduct) return INITIAL_STATE
    return {
      ...INITIAL_STATE,
      products: [{
        productId: defaultProduct.id,
        name: `${defaultProduct.name} — ${defaultProduct.packageLabel}`,
        packageLabel: defaultProduct.packageLabel,
        yieldM2: defaultProduct.yieldM2,
        unitPrice: defaultProduct.price,
        quantity: 0,
        subtotal: 0,
      }],
    }
  })
  const [saving, setSaving] = useState(false)

  function update(partial: Partial<WizardState>) {
    setState((s) => ({ ...s, ...partial }))
  }

  async function handleSave() {
    setSaving(true)
    const { totalMaterials, totalValue } = calcTotals(state.products, state.extraItems, state.laborValue)
    const finalState = { ...state, totalMaterials, totalValue }
    try {
      await saveBudget(finalState)
      toast.success("Orçamento salvo!")
      router.push("/dashboard")
    } catch {
      toast.error("Erro ao salvar orçamento.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center" style={{ minWidth: 40 }}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: i <= step ? "var(--color-primary)" : "var(--color-border)",
                  color: i <= step ? "white" : "var(--color-text-muted)",
                }}
              >
                {i + 1}
              </div>
              <span className="text-xs mt-1" style={{ color: i === step ? "var(--color-primary)" : "var(--color-text-muted)" }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mb-4" style={{ background: i < step ? "var(--color-primary)" : "var(--color-border)" }} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {step === 0 && <Step1Client state={state} update={update} onNext={() => setStep(1)} />}
      {step === 1 && <Step2Area state={state} update={update} onBack={() => setStep(0)} onNext={() => setStep(2)} />}
      {step === 2 && <Step3Materials state={state} update={update} products={products} onBack={() => setStep(1)} onNext={() => setStep(3)} />}
      {step === 3 && <Step4Summary state={state} onBack={() => setStep(2)} onSave={handleSave} saving={saving} />}
    </div>
  )
}
```

- [ ] **Step 3: Criar Step1Client.tsx**

```tsx
"use client"
import type { WizardState } from "@/types"

interface Props {
  state: WizardState
  update: (p: Partial<WizardState>) => void
  onNext: () => void
}

export default function Step1Client({ state, update, onNext }: Props) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!state.clientName.trim()) return
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Dados do cliente</h2>
      {[
        { key: "clientName", label: "Nome do cliente *", required: true },
        { key: "clientPhone", label: "Telefone", required: false },
        { key: "clientAddress", label: "Endereço da obra", required: false },
        { key: "clientNotes", label: "Observações gerais", required: false },
      ].map(({ key, label, required }) => (
        <div key={key}>
          <label className="text-sm font-medium block mb-1">{label}</label>
          <input
            value={state[key as keyof WizardState] as string}
            onChange={(e) => update({ [key]: e.target.value })}
            required={required}
            className="w-full px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: "var(--color-border)" }}
          />
        </div>
      ))}
      <button
        type="submit"
        className="w-full py-2 rounded-lg text-sm font-medium text-white mt-2"
        style={{ background: "var(--color-primary)" }}
      >
        Próximo →
      </button>
    </form>
  )
}
```

- [ ] **Step 4: Criar AreaCalculator.tsx**

```tsx
"use client"
import { useState } from "react"
import { calcPaintableArea, calcAreaForPaint, parseDecimal } from "@/lib/calculations"
import type { AreaInput } from "@/types"

interface Props {
  area: AreaInput
  onChange: (updated: AreaInput) => void
}

export default function AreaCalculator({ area, onChange }: Props) {
  const [mode, setMode] = useState<"known" | "calculate">(area.mode)

  function set(partial: Partial<AreaInput>) {
    const updated = { ...area, ...partial, mode }
    onChange(updated)
  }

  const paintable = calcPaintableArea({ ...area, mode })
  const forPaint = calcAreaForPaint(paintable, area.coats)

  return (
    <div className="rounded-xl border p-4" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
      <div className="mb-3">
        <label className="text-sm font-medium block mb-1">Nome do ambiente</label>
        <input
          value={area.name}
          onChange={(e) => set({ name: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: "var(--color-border)" }}
        />
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-4">
        {(["known", "calculate"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); onChange({ ...area, mode: m }) }}
            className="flex-1 py-2 rounded-lg text-sm font-medium border"
            style={{
              background: mode === m ? "var(--color-primary)" : "var(--color-surface)",
              color: mode === m ? "white" : "var(--color-text-muted)",
              borderColor: mode === m ? "var(--color-primary)" : "var(--color-border)",
            }}
          >
            {m === "known" ? "Já sei a metragem" : "Calcular agora"}
          </button>
        ))}
      </div>

      {mode === "known" && (
        <div>
          <label className="text-sm font-medium block mb-1">Área total (m²)</label>
          <input
            type="text"
            placeholder="Ex: 25,5 ou 25.5"
            value={area.knownArea ?? ""}
            onChange={(e) => set({ knownArea: parseDecimal(e.target.value) })}
            className="w-full px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: "var(--color-border)" }}
          />
        </div>
      )}

      {mode === "calculate" && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "wallHeight", label: "Altura parede (m)" },
            { key: "wallWidth", label: "Largura parede (m)" },
            { key: "doorsCount", label: "Qtd. portas" },
            { key: "doorHeight", label: "Altura porta (m)" },
            { key: "doorWidth", label: "Largura porta (m)" },
            { key: "windowsCount", label: "Qtd. janelas" },
            { key: "windowHeight", label: "Altura janela (m)" },
            { key: "windowWidth", label: "Largura janela (m)" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs font-medium block mb-1">{label}</label>
              <input
                type="text"
                placeholder="0"
                value={area[key as keyof AreaInput] ?? ""}
                onChange={(e) => set({ [key]: parseDecimal(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: "var(--color-border)" }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Demãos */}
      <div className="mt-3">
        <label className="text-sm font-medium block mb-1">Demãos</label>
        <input
          type="number"
          min={1}
          max={5}
          value={area.coats}
          onChange={(e) => set({ coats: parseInt(e.target.value) || 1 })}
          className="w-24 px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: "var(--color-border)" }}
        />
      </div>

      {/* Result */}
      {forPaint > 0 && (
        <div className="mt-3 p-3 rounded-lg text-sm" style={{ background: "#eff6ff" }}>
          <span className="font-semibold">Área para tinta: {forPaint.toFixed(1)} m²</span>
          <span className="text-xs ml-2" style={{ color: "var(--color-text-muted)" }}>
            ({paintable.toFixed(1)} m² × {area.coats} demãos)
          </span>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Criar Step2Area.tsx**

```tsx
"use client"
import { Plus } from "lucide-react"
import AreaCalculator from "./AreaCalculator"
import type { WizardState, AreaInput } from "@/types"

interface Props {
  state: WizardState
  update: (p: Partial<WizardState>) => void
  onBack: () => void
  onNext: () => void
}

export default function Step2Area({ state, update, onBack, onNext }: Props) {
  function updateArea(index: number, updated: AreaInput) {
    const areas = [...state.areas]
    areas[index] = updated
    update({ areas })
  }

  function addArea() {
    update({
      areas: [
        ...state.areas,
        { name: `Ambiente ${state.areas.length + 1}`, mode: "known", knownArea: 0, coats: 2 },
      ],
    })
  }

  function removeArea(index: number) {
    update({ areas: state.areas.filter((_, i) => i !== index) })
  }

  const totalForPaint = state.areas.reduce((sum, a) => {
    const paintable = a.mode === "known"
      ? (a.knownArea ?? 0)
      : Math.max(0, (a.wallHeight ?? 0) * (a.wallWidth ?? 0)
          - (a.doorsCount ?? 0) * (a.doorHeight ?? 0) * (a.doorWidth ?? 0)
          - (a.windowsCount ?? 0) * (a.windowHeight ?? 0) * (a.windowWidth ?? 0))
    return sum + paintable * a.coats
  }, 0)

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Cálculo de área</h2>

      {state.areas.map((area, i) => (
        <div key={i} className="relative">
          <AreaCalculator area={area} onChange={(u) => updateArea(i, u)} />
          {state.areas.length > 1 && (
            <button
              type="button"
              onClick={() => removeArea(i)}
              className="absolute top-3 right-3 text-xs text-red-500"
            >
              Remover
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addArea}
        className="w-full py-2 rounded-lg text-sm border-dashed border-2 flex items-center justify-center gap-1"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
      >
        <Plus size={14} /> Adicionar outro ambiente
      </button>

      {totalForPaint > 0 && (
        <div className="p-3 rounded-lg text-sm font-semibold" style={{ background: "#eff6ff", color: "var(--color-primary)" }}>
          Total para tinta: {totalForPaint.toFixed(1)} m²
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-2 rounded-lg text-sm border" style={{ borderColor: "var(--color-border)" }}>
          ← Voltar
        </button>
        <button
          onClick={onNext}
          disabled={totalForPaint === 0}
          className="flex-1 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: totalForPaint === 0 ? "#93c5fd" : "var(--color-primary)" }}
        >
          Próximo →
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Criar Step3Materials.tsx**

```tsx
"use client"
import { useEffect } from "react"
import { calcPackages, calcTotals, formatCurrency, parseDecimal } from "@/lib/calculations"
import { Plus, Trash2 } from "lucide-react"
import type { WizardState, WizardProduct, WizardExtraItem } from "@/types"

interface Product { id: string; name: string; brand: string; packageLabel: string; yieldM2: number; price: number }

interface Props {
  state: WizardState
  update: (p: Partial<WizardState>) => void
  products: Product[]
  onBack: () => void
  onNext: () => void
}

export default function Step3Materials({ state, update, products, onBack, onNext }: Props) {
  const totalAreaForPaint = state.areas.reduce((sum, a) => {
    const paintable = a.mode === "known"
      ? (a.knownArea ?? 0)
      : Math.max(0, (a.wallHeight ?? 0) * (a.wallWidth ?? 0)
          - (a.doorsCount ?? 0) * (a.doorHeight ?? 0) * (a.doorWidth ?? 0)
          - (a.windowsCount ?? 0) * (a.windowHeight ?? 0) * (a.windowWidth ?? 0))
    return sum + paintable * a.coats
  }, 0)

  // Recalculate product quantity when area changes
  useEffect(() => {
    if (state.products.length === 0) return
    const updated = state.products.map((p) => {
      const qty = calcPackages(totalAreaForPaint, p.yieldM2)
      return { ...p, quantity: qty, subtotal: qty * p.unitPrice }
    })
    update({ products: updated })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalAreaForPaint])

  function updateProductQty(index: number, qty: number) {
    const updated = [...state.products]
    updated[index] = { ...updated[index], quantity: qty, subtotal: qty * updated[index].unitPrice }
    update({ products: updated })
  }

  function addExtra() {
    update({ extraItems: [...state.extraItems, { name: "", quantity: 1, unitPrice: 0, subtotal: 0 }] })
  }

  function updateExtra(index: number, partial: Partial<WizardExtraItem>) {
    const updated = [...state.extraItems]
    const item = { ...updated[index], ...partial }
    item.subtotal = item.quantity * item.unitPrice
    updated[index] = item
    update({ extraItems: updated })
  }

  function removeExtra(index: number) {
    update({ extraItems: state.extraItems.filter((_, i) => i !== index) })
  }

  const { totalMaterials } = calcTotals(state.products, state.extraItems, 0)

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold">Materiais e mão de obra</h2>

      {/* Paint product */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Tinta principal</h3>
        {state.products.map((p, i) => (
          <div key={i} className="p-4 rounded-xl border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
            <p className="font-medium text-sm">{p.name}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              Rendimento: {p.yieldM2} m²/embalagem · {formatCurrency(p.unitPrice)}/embalagem
            </p>
            <div className="flex items-center gap-3 mt-3">
              <label className="text-sm">Quantidade:</label>
              <input
                type="number"
                min={0}
                value={p.quantity}
                onChange={(e) => updateProductQty(i, parseInt(e.target.value) || 0)}
                className="w-20 px-2 py-1 rounded border text-sm text-center"
                style={{ borderColor: "var(--color-border)" }}
              />
              <span className="text-sm font-semibold">{formatCurrency(p.subtotal)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Extra items */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Itens extras</h3>
        {state.extraItems.map((item, i) => (
          <div key={i} className="flex gap-2 mb-2 items-start">
            <input
              placeholder="Nome do item"
              value={item.name}
              onChange={(e) => updateExtra(i, { name: e.target.value })}
              className="flex-1 px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: "var(--color-border)" }}
            />
            <input
              type="text"
              placeholder="Qtd"
              value={item.quantity}
              onChange={(e) => updateExtra(i, { quantity: parseDecimal(e.target.value) })}
              className="w-16 px-2 py-2 rounded-lg border text-sm text-center"
              style={{ borderColor: "var(--color-border)" }}
            />
            <input
              type="text"
              placeholder="R$ unit."
              value={item.unitPrice || ""}
              onChange={(e) => updateExtra(i, { unitPrice: parseDecimal(e.target.value) })}
              className="w-24 px-2 py-2 rounded-lg border text-sm"
              style={{ borderColor: "var(--color-border)" }}
            />
            <button onClick={() => removeExtra(i)} className="p-2 text-red-400"><Trash2 size={14} /></button>
          </div>
        ))}
        <button
          type="button"
          onClick={addExtra}
          className="w-full py-2 rounded-lg text-sm border-dashed border-2 flex items-center justify-center gap-1"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        >
          <Plus size={14} /> Adicionar item extra
        </button>
      </div>

      {/* Labor */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Mão de obra</h3>
        <div className="flex flex-col gap-3">
          {[
            { key: "laborValue", label: "Valor do serviço (R$)", type: "text" },
            { key: "laborDeadline", label: "Prazo estimado", type: "text" },
            { key: "paymentMethod", label: "Forma de pagamento", type: "text" },
            { key: "laborNotes", label: "Observações do serviço", type: "text" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-sm font-medium block mb-1">{label}</label>
              <input
                value={state[key as keyof WizardState] as string}
                onChange={(e) => {
                  const val = key === "laborValue" ? parseDecimal(e.target.value) : e.target.value
                  update({ [key]: val })
                }}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: "var(--color-border)" }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 rounded-lg text-sm" style={{ background: "#eff6ff" }}>
        Subtotal materiais: <strong>{formatCurrency(totalMaterials)}</strong>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-2 rounded-lg text-sm border" style={{ borderColor: "var(--color-border)" }}>
          ← Voltar
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "var(--color-primary)" }}
        >
          Ver resumo →
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Criar Step4Summary.tsx**

```tsx
"use client"
import { calcTotals, formatCurrency } from "@/lib/calculations"
import type { WizardState } from "@/types"

interface Props {
  state: WizardState
  onBack: () => void
  onSave: () => void
  saving: boolean
}

export default function Step4Summary({ state, onBack, onSave, saving }: Props) {
  const { totalMaterials, totalValue } = calcTotals(state.products, state.extraItems, state.laborValue)

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-semibold">Resumo do orçamento</h2>

      <div className="p-4 rounded-xl border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <p className="font-semibold">{state.clientName}</p>
        {state.clientPhone && <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{state.clientPhone}</p>}
        {state.clientAddress && <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{state.clientAddress}</p>}
      </div>

      <div className="p-4 rounded-xl border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <p className="text-sm font-semibold mb-3">Áreas</p>
        {state.areas.map((a, i) => {
          const paintable = a.mode === "known" ? (a.knownArea ?? 0)
            : Math.max(0, (a.wallHeight ?? 0) * (a.wallWidth ?? 0)
                - (a.doorsCount ?? 0) * (a.doorHeight ?? 0) * (a.doorWidth ?? 0)
                - (a.windowsCount ?? 0) * (a.windowHeight ?? 0) * (a.windowWidth ?? 0))
          const forPaint = paintable * a.coats
          return (
            <div key={i} className="flex justify-between text-sm py-1">
              <span>{a.name}</span>
              <span>{forPaint.toFixed(1)} m² ({a.coats} demãos)</span>
            </div>
          )
        })}
      </div>

      <div className="p-4 rounded-xl border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <p className="text-sm font-semibold mb-3">Materiais</p>
        {state.products.map((p, i) => (
          <div key={i} className="flex justify-between text-sm py-1">
            <span>{p.name} × {p.quantity}</span>
            <span>{formatCurrency(p.subtotal)}</span>
          </div>
        ))}
        {state.extraItems.map((e, i) => (
          <div key={i} className="flex justify-between text-sm py-1">
            <span>{e.name} × {e.quantity}</span>
            <span>{formatCurrency(e.subtotal)}</span>
          </div>
        ))}
        <div className="border-t mt-2 pt-2 flex justify-between text-sm font-semibold" style={{ borderColor: "var(--color-border)" }}>
          <span>Subtotal materiais</span>
          <span>{formatCurrency(totalMaterials)}</span>
        </div>
      </div>

      <div className="p-4 rounded-xl border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="flex justify-between text-sm py-1">
          <span>Mão de obra</span>
          <span>{formatCurrency(state.laborValue)}</span>
        </div>
        {state.laborDeadline && <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Prazo: {state.laborDeadline}</p>}
        {state.paymentMethod && <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Pagamento: {state.paymentMethod}</p>}
      </div>

      <div className="p-4 rounded-xl" style={{ background: "var(--color-primary)", color: "white" }}>
        <div className="flex justify-between items-center">
          <span className="font-semibold">TOTAL</span>
          <span className="text-xl font-bold">{formatCurrency(totalValue)}</span>
        </div>
        <p className="text-xs mt-1 opacity-75">* Estimativa. Valores podem variar.</p>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-2 rounded-lg text-sm border" style={{ borderColor: "var(--color-border)" }}>
          ← Voltar
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex-1 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: saving ? "#93c5fd" : "var(--color-primary)" }}
        >
          {saving ? "Salvando..." : "Salvar orçamento"}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Verificar fluxo completo**

```bash
npm run dev
```

1. Login → Dashboard → "Novo orçamento"
2. Preencher dados do cliente → Próximo
3. Adicionar área (modo "Já sei" com 50m², 2 demãos) → ver total 100m²
4. Confirmar que a tinta Coral foi pré-selecionada com 2 embalagens (100/50)
5. Adicionar item extra → Próximo
6. Resumo → Salvar → Dashboard com orçamento salvo na lista

- [ ] **Step 9: Commit**

```bash
git add src/app/\(painter\)/orcamento/
git commit -m "feat: add budget creation wizard with area calculator and materials form"
```

```json:metadata
{"files": ["src/app/(painter)/orcamento/novo/page.tsx", "src/app/(painter)/orcamento/novo/components/BudgetWizard.tsx", "src/app/(painter)/orcamento/novo/components/AreaCalculator.tsx", "src/app/(painter)/orcamento/novo/components/Step1Client.tsx", "src/app/(painter)/orcamento/novo/components/Step2Area.tsx", "src/app/(painter)/orcamento/novo/components/Step3Materials.tsx", "src/app/(painter)/orcamento/novo/components/Step4Summary.tsx"], "verifyCommand": "npm run dev", "acceptanceCriteria": ["wizard 4 etapas funciona", "tinta Coral pré-selecionada", "Math.ceil aplicado na quantidade", "salvar persiste no banco"], "requiresUserVerification": false}
```

---

## Task 8: Página de Orçamento [id], Resumo Público e PDF

**Goal:** Ver orçamento salvo, compartilhar resumo público e exportar PDF.

**Files:**
- Create: `src/app/(painter)/orcamento/[id]/page.tsx`
- Create: `src/app/resumo/[id]/page.tsx`
- Create: `src/app/api/pdf/[id]/route.ts`
- Create: `src/lib/pdf.ts`

**Acceptance Criteria:**
- [ ] `/orcamento/[id]` mostra os dados do orçamento salvo
- [ ] `/resumo/[id]` acessível sem login
- [ ] `GET /api/pdf/[id]` retorna arquivo PDF com `Content-Type: application/pdf`

**Steps:**

- [ ] **Step 1: Criar src/app/(painter)/orcamento/[id]/page.tsx**

```tsx
import { getBudgetById } from "@/lib/budget"
import { notFound } from "next/navigation"
import { formatCurrency } from "@/lib/calculations"
import StatusBadge from "@/components/StatusBadge"
import type { BudgetStatus } from "@/types"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

export default async function OrcamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const budget = await getBudgetById(id)
  if (!budget) notFound()

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{budget.clientName}</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            {new Date(budget.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={budget.status as BudgetStatus} />
          <Link
            href={`/resumo/${budget.id}`}
            target="_blank"
            className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border"
            style={{ borderColor: "var(--color-border)", color: "var(--color-primary)" }}
          >
            <ExternalLink size={14} /> Ver resumo
          </Link>
        </div>
      </div>

      {budget.clientAddress && (
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{budget.clientAddress}</p>
      )}

      {/* Areas */}
      <div className="p-4 rounded-xl border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <p className="text-sm font-semibold mb-2">Áreas</p>
        {budget.areas.map((a) => (
          <div key={a.id} className="flex justify-between text-sm py-1">
            <span>{a.name}</span>
            <span>{a.areaForPaint.toFixed(1)} m²</span>
          </div>
        ))}
      </div>

      {/* Products */}
      <div className="p-4 rounded-xl border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <p className="text-sm font-semibold mb-2">Materiais</p>
        {budget.products.map((p) => (
          <div key={p.id} className="flex justify-between text-sm py-1">
            <span>{p.product.name} × {p.quantity}</span>
            <span>{formatCurrency(p.subtotal)}</span>
          </div>
        ))}
        {budget.extraItems.map((e) => (
          <div key={e.id} className="flex justify-between text-sm py-1">
            <span>{e.name} × {e.quantity}</span>
            <span>{formatCurrency(e.subtotal)}</span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="p-4 rounded-xl border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="flex justify-between text-sm py-1">
          <span>Subtotal materiais</span>
          <span>{formatCurrency(budget.totalMaterials)}</span>
        </div>
        <div className="flex justify-between text-sm py-1">
          <span>Mão de obra</span>
          <span>{formatCurrency(budget.laborValue)}</span>
        </div>
        <div className="flex justify-between font-bold py-1 border-t mt-1" style={{ borderColor: "var(--color-border)" }}>
          <span>TOTAL</span>
          <span>{formatCurrency(budget.totalValue)}</span>
        </div>
      </div>

      <Link href="/dashboard" className="text-sm" style={{ color: "var(--color-text-muted)" }}>
        ← Voltar ao painel
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Criar src/app/resumo/[id]/page.tsx**

```tsx
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { formatCurrency } from "@/lib/calculations"

export default async function ResumoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const budget = await prisma.budget.findUnique({
    where: { id },
    include: { areas: true, products: { include: { product: true } }, extraItems: true },
  })
  if (!budget) notFound()

  return (
    <div className="min-h-screen p-4" style={{ background: "var(--color-surface-secondary)" }}>
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Orçamento de Pintura</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            {new Date(budget.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </div>

        <div className="p-4 rounded-xl border mb-4" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
          <p className="font-semibold">{budget.clientName}</p>
          {budget.clientPhone && <p className="text-sm">{budget.clientPhone}</p>}
          {budget.clientAddress && <p className="text-sm">{budget.clientAddress}</p>}
        </div>

        <div className="p-4 rounded-xl border mb-4" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
          <p className="text-sm font-semibold mb-2">Áreas de pintura</p>
          {budget.areas.map((a) => (
            <div key={a.id} className="flex justify-between text-sm py-1">
              <span>{a.name} ({a.coats} demãos)</span>
              <span>{a.areaForPaint.toFixed(1)} m²</span>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl border mb-4" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
          <p className="text-sm font-semibold mb-2">Materiais</p>
          {budget.products.map((p) => (
            <div key={p.id} className="flex justify-between text-sm py-1">
              <span>{p.product.name} × {p.quantity} {p.product.packageLabel}</span>
              <span>{formatCurrency(p.subtotal)}</span>
            </div>
          ))}
          {budget.extraItems.map((e) => (
            <div key={e.id} className="flex justify-between text-sm py-1">
              <span>{e.name} × {e.quantity}</span>
              <span>{formatCurrency(e.subtotal)}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-semibold border-t pt-2 mt-1" style={{ borderColor: "var(--color-border)" }}>
            <span>Subtotal materiais</span><span>{formatCurrency(budget.totalMaterials)}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border mb-4" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
          <div className="flex justify-between text-sm py-1">
            <span>Mão de obra</span><span>{formatCurrency(budget.laborValue)}</span>
          </div>
          {budget.laborDeadline && <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Prazo: {budget.laborDeadline}</p>}
          {budget.paymentMethod && <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Pagamento: {budget.paymentMethod}</p>}
        </div>

        <div className="p-4 rounded-xl mb-4" style={{ background: "var(--color-primary)", color: "white" }}>
          <div className="flex justify-between items-center">
            <span className="font-semibold">TOTAL</span>
            <span className="text-2xl font-bold">{formatCurrency(budget.totalValue)}</span>
          </div>
        </div>

        <p className="text-xs text-center mb-6" style={{ color: "var(--color-text-muted)" }}>
          * Este orçamento é uma estimativa. Valores podem variar conforme condições da obra.
        </p>

        <a
          href={`/api/pdf/${budget.id}`}
          target="_blank"
          className="block w-full py-3 rounded-xl text-center text-sm font-medium border"
          style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
        >
          Exportar PDF
        </a>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Criar src/lib/pdf.ts**

```tsx
import {
  Document, Page, Text, View, StyleSheet,
} from "@react-pdf/renderer"
import { formatCurrency } from "@/lib/calculations"

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 4, textAlign: "center" },
  subtitle: { fontSize: 10, color: "#64748b", textAlign: "center", marginBottom: 20 },
  section: { marginBottom: 16, padding: 12, border: "1pt solid #e2e8f0", borderRadius: 6 },
  sectionTitle: { fontSize: 11, fontWeight: "bold", marginBottom: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  bold: { fontWeight: "bold" },
  total: { backgroundColor: "#2563eb", color: "white", padding: 12, borderRadius: 6, flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { fontSize: 12, fontWeight: "bold", color: "white" },
  totalValue: { fontSize: 16, fontWeight: "bold", color: "white" },
  note: { fontSize: 8, color: "#64748b", textAlign: "center", marginTop: 12 },
})

interface BudgetForPdf {
  clientName: string
  clientPhone?: string | null
  clientAddress?: string | null
  clientNotes?: string | null
  createdAt: Date
  areas: { name: string; coats: number; areaForPaint: number }[]
  products: { product: { name: string; packageLabel: string }; quantity: number; subtotal: number }[]
  extraItems: { name: string; quantity: number; subtotal: number }[]
  totalMaterials: number
  laborValue: number
  laborDeadline?: string | null
  paymentMethod?: string | null
  totalValue: number
}

export function BudgetPdfDocument({ budget }: { budget: BudgetForPdf }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Orçamento de Pintura</Text>
        <Text style={styles.subtitle}>{new Date(budget.createdAt).toLocaleDateString("pt-BR")}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{budget.clientName}</Text>
          {budget.clientPhone && <Text>{budget.clientPhone}</Text>}
          {budget.clientAddress && <Text>{budget.clientAddress}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Áreas de pintura</Text>
          {budget.areas.map((a, i) => (
            <View key={i} style={styles.row}>
              <Text>{a.name} ({a.coats} demãos)</Text>
              <Text>{a.areaForPaint.toFixed(1)} m²</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Materiais</Text>
          {budget.products.map((p, i) => (
            <View key={i} style={styles.row}>
              <Text>{p.product.name} × {p.quantity} {p.product.packageLabel}</Text>
              <Text>{formatCurrency(p.subtotal)}</Text>
            </View>
          ))}
          {budget.extraItems.map((e, i) => (
            <View key={i} style={styles.row}>
              <Text>{e.name} × {e.quantity}</Text>
              <Text>{formatCurrency(e.subtotal)}</Text>
            </View>
          ))}
          <View style={[styles.row, { borderTopWidth: 1, borderTopColor: "#e2e8f0", marginTop: 4, paddingTop: 4 }]}>
            <Text style={styles.bold}>Subtotal materiais</Text>
            <Text style={styles.bold}>{formatCurrency(budget.totalMaterials)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text>Mão de obra</Text>
            <Text>{formatCurrency(budget.laborValue)}</Text>
          </View>
          {budget.laborDeadline && <Text>Prazo: {budget.laborDeadline}</Text>}
          {budget.paymentMethod && <Text>Pagamento: {budget.paymentMethod}</Text>}
        </View>

        <View style={styles.total}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalValue}>{formatCurrency(budget.totalValue)}</Text>
        </View>

        <Text style={styles.note}>
          * Este orçamento é uma estimativa. Valores podem variar conforme condições da obra.
        </Text>
      </Page>
    </Document>
  )
}
```

- [ ] **Step 4: Criar src/app/api/pdf/[id]/route.ts**

```ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { renderToBuffer } from "@react-pdf/renderer"
import { BudgetPdfDocument } from "@/lib/pdf"
import React from "react"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const budget = await prisma.budget.findUnique({
    where: { id },
    include: { areas: true, products: { include: { product: true } }, extraItems: true },
  })
  if (!budget) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const buffer = await renderToBuffer(
    React.createElement(BudgetPdfDocument, { budget })
  )

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="orcamento-${budget.clientName.replace(/\s+/g, "-")}.pdf"`,
    },
  })
}
```

- [ ] **Step 5: Verificar**

```bash
npm run dev
```

1. Criar um orçamento completo → ir para `/orcamento/[id]`
2. Clicar em "Ver resumo" → `/resumo/[id]` deve abrir sem login em outra aba
3. Clicar em "Exportar PDF" → deve baixar arquivo PDF

- [ ] **Step 6: Commit**

```bash
git add src/app/\(painter\)/orcamento/\[id\]/ src/app/resumo/ src/app/api/pdf/ src/lib/pdf.ts
git commit -m "feat: add budget detail page, public summary, and PDF export"
```

```json:metadata
{"files": ["src/app/(painter)/orcamento/[id]/page.tsx", "src/app/resumo/[id]/page.tsx", "src/app/api/pdf/[id]/route.ts", "src/lib/pdf.ts"], "verifyCommand": "npm run dev", "acceptanceCriteria": ["/resumo/[id] acessível sem login", "PDF gerado com Content-Type application/pdf", "orçamento detail mostra todos os dados"], "requiresUserVerification": false}
```

---

## Task 9: Área Administrativa

**Goal:** CRUD de produtos e listagem de pintores para o administrador.

**Files:**
- Create: `src/lib/products.ts`
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/produtos/page.tsx`
- Create: `src/app/admin/produtos/components/ProductForm.tsx`
- Create: `src/app/admin/pintores/page.tsx`

**Acceptance Criteria:**
- [ ] `/admin` redireciona pintor comum para `/dashboard`
- [ ] `/admin/produtos` lista os produtos existentes
- [ ] Admin consegue criar, editar preço/rendimento e desativar produto
- [ ] `/admin/pintores` lista todos os pintores cadastrados

**Steps:**

- [ ] **Step 1: Criar src/lib/products.ts**

```ts
"use server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "ADMIN") throw new Error("Acesso negado")
  return session
}

const productSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  line: z.string().optional(),
  finish: z.string().optional(),
  packageSize: z.number().positive(),
  packageLabel: z.string().min(1),
  yieldM2: z.number().positive(),
  price: z.number().min(0),
  notes: z.string().optional(),
})

export async function createProduct(data: unknown) {
  await requireAdmin()
  const parsed = productSchema.parse(data)
  await prisma.product.create({ data: parsed })
  revalidatePath("/admin/produtos")
}

export async function updateProduct(id: string, data: unknown) {
  await requireAdmin()
  const parsed = productSchema.partial().parse(data)
  await prisma.product.update({ where: { id }, data: parsed })
  revalidatePath("/admin/produtos")
}

export async function toggleProduct(id: string, isActive: boolean) {
  await requireAdmin()
  await prisma.product.update({ where: { id }, data: { isActive } })
  revalidatePath("/admin/produtos")
}
```

- [ ] **Step 2: Criar src/app/admin/layout.tsx**

```tsx
import Link from "next/link"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-surface-secondary)" }}>
      <header style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }} className="px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-6">
          <span className="font-semibold text-sm">Admin</span>
          <nav className="flex gap-4">
            {[
              { href: "/admin", label: "Dashboard" },
              { href: "/admin/produtos", label: "Produtos" },
              { href: "/admin/pintores", label: "Pintores" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {label}
              </Link>
            ))}
          </nav>
          <Link href="/dashboard" className="ml-auto text-sm" style={{ color: "var(--color-text-muted)" }}>
            ← Painel
          </Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
```

- [ ] **Step 3: Criar src/app/admin/page.tsx**

```tsx
import { prisma } from "@/lib/prisma"

export default async function AdminDashboard() {
  const [totalBudgets, totalPainters, totalProducts] = await Promise.all([
    prisma.budget.count(),
    prisma.user.count({ where: { role: "PAINTER" } }),
    prisma.product.count({ where: { isActive: true } }),
  ])

  const cards = [
    { label: "Orçamentos", value: totalBudgets },
    { label: "Pintores", value: totalPainters },
    { label: "Produtos ativos", value: totalProducts },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Dashboard Admin</h1>
      <div className="grid grid-cols-3 gap-4">
        {cards.map(({ label, value }) => (
          <div key={label} className="p-5 rounded-xl border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Criar src/app/admin/produtos/page.tsx**

```tsx
import { prisma } from "@/lib/prisma"
import ProductForm from "./components/ProductForm"
import { formatCurrency } from "@/lib/calculations"
import { toggleProduct } from "@/lib/products"

export default async function ProdutosPage() {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Produtos</h1>
      </div>

      <ProductForm />

      <div className="mt-8 flex flex-col gap-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between p-4 rounded-xl border"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-surface)",
              opacity: p.isActive ? 1 : 0.5,
            }}
          >
            <div>
              <p className="font-medium text-sm">{p.name} <span className="text-xs text-gray-400">— {p.brand}</span></p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                {p.packageLabel} · {p.yieldM2} m²/embalagem · {formatCurrency(p.price)}
              </p>
            </div>
            <form action={async () => {
              "use server"
              await toggleProduct(p.id, !p.isActive)
            }}>
              <button type="submit" className="text-xs px-3 py-1 rounded border" style={{ borderColor: "var(--color-border)" }}>
                {p.isActive ? "Desativar" : "Ativar"}
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Criar src/app/admin/produtos/components/ProductForm.tsx**

```tsx
"use client"
import { useState } from "react"
import { createProduct } from "@/lib/products"
import { toast } from "sonner"

export default function ProductForm() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    try {
      await createProduct({
        name: fd.get("name"),
        brand: fd.get("brand"),
        line: fd.get("line"),
        finish: fd.get("finish"),
        packageSize: parseFloat(fd.get("packageSize") as string),
        packageLabel: fd.get("packageLabel"),
        yieldM2: parseFloat(fd.get("yieldM2") as string),
        price: parseFloat(fd.get("price") as string),
        notes: fd.get("notes"),
      })
      toast.success("Produto criado!")
      setOpen(false)
    } catch {
      toast.error("Erro ao criar produto.")
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-lg text-sm font-medium text-white"
        style={{ background: "var(--color-primary)" }}
      >
        + Novo produto
      </button>
    )
  }

  const fields = [
    { name: "name", label: "Nome *", required: true },
    { name: "brand", label: "Marca *", required: true },
    { name: "line", label: "Linha" },
    { name: "finish", label: "Acabamento" },
    { name: "packageSize", label: "Tamanho embalagem (L ou kg) *", type: "number", required: true },
    { name: "packageLabel", label: "Label embalagem (ex: lata 18L) *", required: true },
    { name: "yieldM2", label: "Rendimento (m²/embalagem) *", type: "number", required: true },
    { name: "price", label: "Preço R$ *", type: "number", required: true },
    { name: "notes", label: "Observações" },
  ]

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-xl border flex flex-col gap-3"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
      <h3 className="font-semibold">Novo produto</h3>
      <div className="grid grid-cols-2 gap-3">
        {fields.map(({ name, label, type, required }) => (
          <div key={name}>
            <label className="text-xs font-medium block mb-1">{label}</label>
            <input
              name={name}
              type={type ?? "text"}
              required={required}
              step={type === "number" ? "0.01" : undefined}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: "var(--color-border)" }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2 rounded-lg text-sm border" style={{ borderColor: "var(--color-border)" }}>
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "var(--color-primary)" }}>
          {loading ? "Salvando..." : "Salvar produto"}
        </button>
      </div>
    </form>
  )
}
```

- [ ] **Step 6: Criar src/app/admin/pintores/page.tsx**

```tsx
import { prisma } from "@/lib/prisma"

export default async function PintoresPage() {
  const painters = await prisma.user.findMany({
    where: { role: "PAINTER" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { budgets: true } } },
  })

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Pintores cadastrados</h1>
      <div className="flex flex-col gap-3">
        {painters.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
            <div>
              <p className="font-medium text-sm">{p.name}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                {p.email} {p.phone ? `· ${p.phone}` : ""}
              </p>
            </div>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {p._count.budgets} orçamentos
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Verificar área admin**

```bash
npm run dev
```

1. Login com `admin@pintores.com` / `Admin@123`
2. Acessar `/admin` → ver counts
3. Acessar `/admin/produtos` → ver Tinta Coral Padrão, criar novo produto
4. Acessar `/admin/pintores` → ver pintores
5. Login com pintor comum → tentar `/admin` → deve redirecionar para `/dashboard`

- [ ] **Step 8: Commit**

```bash
git add src/lib/products.ts src/app/admin/
git commit -m "feat: add admin area with product CRUD and painter listing"
```

```json:metadata
{"files": ["src/lib/products.ts", "src/app/admin/layout.tsx", "src/app/admin/page.tsx", "src/app/admin/produtos/page.tsx", "src/app/admin/produtos/components/ProductForm.tsx", "src/app/admin/pintores/page.tsx"], "verifyCommand": "npm run dev", "acceptanceCriteria": ["admin acessa /admin/produtos", "pintor comum é redirecionado de /admin", "criar produto funciona"], "requiresUserVerification": false}
```

---

## Task 10: Atualizar CLAUDE.md e Build Final

**Goal:** Documentar a nova arquitetura e garantir que o build de produção passa.

**Files:**
- Modify: `CLAUDE.md`

**Acceptance Criteria:**
- [ ] `npm run build` passa sem erros
- [ ] `npm run lint` sem erros críticos
- [ ] CLAUDE.md reflete a nova arquitetura

**Steps:**

- [ ] **Step 1: Atualizar CLAUDE.md**

Substituir o conteúdo por:

```markdown
# CLAUDE.md

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
DATABASE_URL="file:./prisma/dev.db"
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
- `/resumo/[id]` — public shareable summary (Server Component)
- `/admin/*` — admin area (role: ADMIN only)
- `/api/auth/[...nextauth]` — NextAuth handler
- `/api/auth/register` — painter registration
- `/api/pdf/[id]` — PDF generation

### Key Files
- `src/lib/calculations.ts` — pure calc functions (paintableArea, packages, totals)
- `src/lib/budget.ts` — Server Actions for budget CRUD
- `src/lib/products.ts` — Server Actions for product CRUD (admin only)
- `src/lib/auth.ts` — NextAuth config
- `src/lib/prisma.ts` — Prisma singleton
- `src/lib/pdf.ts` — PDF document component (@react-pdf/renderer)
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
```

- [ ] **Step 2: Build final**

```bash
npm run build
```

Esperado: build completo sem erros. Warnings de `@react-pdf/renderer` sobre `node:` modules são normais.

- [ ] **Step 3: Lint**

```bash
npm run lint
```

Corrigir erros (não warnings).

- [ ] **Step 4: Commit final**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for orcamento platform architecture"
git add -A
git commit -m "chore: final cleanup and production build passing"
```

```json:metadata
{"files": ["CLAUDE.md"], "verifyCommand": "npm run build", "acceptanceCriteria": ["npm run build sem erros", "CLAUDE.md atualizado"], "requiresUserVerification": false}
```

---

## Fix: Cálculo DRY em Step2Area, Step3Materials, Step4Summary

Nos três componentes, substitua o cálculo inline por chamadas às funções do `lib/calculations.ts`:

```ts
import { calcPaintableArea, calcAreaForPaint } from "@/lib/calculations"

// Substituir blocos inline por:
const paintable = calcPaintableArea(a)
const forPaint = calcAreaForPaint(paintable, a.coats)
```

Em `Step3Materials.tsx`, o reduce passa a ser:
```ts
const totalAreaForPaint = state.areas.reduce(
  (sum, a) => sum + calcAreaForPaint(calcPaintableArea(a), a.coats),
  0
)
```

Em `lib/budget.ts`, `saveBudget` deve calcular `totalArea` corretamente para o modo "calculate":
```ts
areas: {
  create: state.areas.map((a) => {
    const paintable = calcPaintableArea(a)
    const forPaint = calcAreaForPaint(paintable, a.coats)
    return {
      name: a.name,
      totalArea: paintable,
      coats: a.coats,
      areaForPaint: forPaint,
    }
  }),
},
```

---

## Dependências entre Tasks

```
Task 0 (limpeza)
  └── Task 1 (prisma)
        ├── Task 2 (auth)
        │     └── Task 4 (layout)
        │           └── Task 5 (auth pages)
        │                 └── Task 6 (dashboard)
        │                       └── Task 7 (wizard)
        │                             └── Task 8 (detail + pdf)
        │                                   └── Task 9 (admin)
        │                                         └── Task 10 (build)
        └── Task 3 (types + calc)
              (usado por Tasks 4-9)
```
