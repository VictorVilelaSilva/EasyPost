# Plataforma de Orçamento para Pintores — Design Spec

**Data:** 2026-06-12  
**Status:** Aprovado  
**Repo:** EasyPost (refatoração completa do domínio)

---

## Contexto

Refatoração total do repositório EasyPost. O produto anterior (criador de carrosséis com IA) é descontinuado. O novo produto é uma plataforma web para pintores parceiros montarem orçamentos de pintura de forma rápida, profissional e padronizada.

---

## Stack

### Mantém
- Next.js 16 (App Router)
- Tailwind v4
- TypeScript
- Lucide React
- Sonner (toasts)
- Zod (validação)

### Entra
- **Prisma + SQLite** — banco de dados local (migração futura para PostgreSQL)
- **NextAuth.js v5** — autenticação com email/senha, JWT
- **bcryptjs** — hash de senhas
- **@react-pdf/renderer** — geração de PDF do orçamento

### Sai (remover)
- Firebase + firebase-admin
- @google/genai, @ai-sdk/google
- Stripe + @stripe/react-stripe-js + @stripe/stripe-js
- sharp, jszip, file-saver, framer-motion, motion

---

## Arquitetura

**Padrão:** Híbrido — Server Components para leitura de dados, Client Components para interfaces interativas, Server Actions para mutações, API route apenas para geração de PDF.

### Proteção de rotas — `middleware.ts`
| Rota | Acesso |
|---|---|
| `/(auth)/*` | Público; redireciona para `/dashboard` se logado |
| `/(painter)/*` | Requer sessão NextAuth (qualquer role) |
| `/admin/*` | Requer `role === "ADMIN"` |
| `/resumo/[id]` | Público (link compartilhável com cliente) |

---

## Rotas

```
src/app/
  (auth)/
    login/           → Tela de login
    register/        → Cadastro do pintor
  (painter)/
    dashboard/       → Painel com lista de orçamentos do pintor
    orcamento/
      novo/          → Criar orçamento (wizard 4 etapas)
      [id]/          → Ver / editar orçamento salvo
  resumo/[id]/       → Página pública de resumo (compartilhar)
  admin/
    page.tsx         → Dashboard admin
    produtos/        → CRUD de tintas e rendimentos
    pintores/        → Lista de pintores cadastrados
  api/
    pdf/[id]/        → API Route: gera e retorna PDF
    auth/[...nextauth]/  → NextAuth handler
```

---

## Banco de Dados (Prisma + SQLite)

```prisma
enum Role   { PAINTER ADMIN }
enum Status { DRAFT SENT APPROVED REJECTED }

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
  id           String  @id @default(cuid())
  name         String
  brand        String
  line         String?
  finish       String?
  packageSize  Float           // litros ou kg
  packageLabel String          // "lata 18L", "galão 3,6L"
  yieldM2      Float           // m² por embalagem
  price        Float           // R$ unitário
  isActive     Boolean @default(true)
  notes        String?
  budgetProducts BudgetProduct[]
}

model Budget {
  id            String   @id @default(cuid())
  painterId     String
  painter       User     @relation(fields: [painterId], references: [id])
  clientName    String
  clientPhone   String?
  clientAddress String?
  clientNotes   String?
  status        Status   @default(DRAFT)
  laborValue    Float    @default(0)
  laborDeadline String?
  paymentMethod String?
  laborNotes    String?
  totalMaterials Float   @default(0)
  totalValue     Float   @default(0)
  validity       Int?            // dias
  notes          String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  areas          BudgetArea[]
  products       BudgetProduct[]
  extraItems     BudgetExtraItem[]
}

model BudgetArea {
  id           String @id @default(cuid())
  budgetId     String
  budget       Budget @relation(fields: [budgetId], references: [id], onDelete: Cascade)
  name         String          // "Sala", "Quarto 1"
  totalArea    Float           // m² pintável (já descontado portas/janelas)
  coats        Int    @default(2)
  areaForPaint Float           // totalArea × coats
  notes        String?
}

model BudgetProduct {
  id        String  @id @default(cuid())
  budgetId  String
  budget    Budget  @relation(fields: [budgetId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Float           // embalagens (Math.ceil)
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

**Decisão MVP:** dados do cliente ficam inline no `Budget` (sem tabela `Client` separada). Tabela `Client` entra na v2 se o pintor precisar reutilizar clientes.

---

## Fluxo de Criação do Orçamento (4 etapas)

Gerenciado por `BudgetWizard.tsx` (Client Component). Barra de progresso sempre visível no topo.

**Salvamento:** o wizard mantém estado local (React state) durante as etapas. O orçamento é salvo no banco **apenas ao clicar "Salvar orçamento" na Etapa 4**. Não há auto-save intermediário no MVP. O pintor pode navegar entre etapas livremente sem persistir.

### Etapa 1 — Dados do Cliente
Campos: nome*, telefone, endereço da obra, observações gerais.

### Etapa 2 — Cálculo de Área
Duas abas alternáveis:

**"Já sei a metragem"**
- Área total (m²) — aceita vírgula e ponto
- Número de demãos
- Nome do ambiente
- Botão "+ Adicionar outro ambiente"

**"Calcular agora"**
- Bloco Paredes: altura × largura → área bruta
- Bloco Portas: quantidade × altura × largura → desconto
- Bloco Janelas: quantidade × altura × largura → desconto
- Área pintável = bruta − portas − janelas
- Resultado calculado em tempo real
- Suporte a múltiplos ambientes: botão "+ Adicionar outro ambiente" disponível em ambos os modos. Cada ambiente tem seus próprios campos e gera uma `BudgetArea` separada.

Cálculo final: `areaForPaint = totalArea × coats`

### Etapa 3 — Materiais e Mão de Obra

**Tinta principal**
- Tinta Coral Padrão pré-selecionada
- Quantidade calculada automaticamente: `Math.ceil(areaForPaint / yieldM2)`
- Campo para ajuste manual da quantidade
- Subtotal = quantidade × preço unitário

**Itens extras** (lista dinâmica)
- Nome, quantidade, preço unitário → subtotal calculado
- Exemplos sugeridos: massa corrida, selador, fundo preparador, fita, lixa, rolo

**Mão de obra**
- Valor livre (sem cálculo automático no MVP)
- Prazo estimado, forma de pagamento, observações do serviço

### Etapa 4 — Resumo Final
- Dados do cliente e endereço
- Lista de ambientes com áreas
- Tinta + embalagens + subtotal
- Itens extras + subtotais
- Subtotal materiais
- Mão de obra
- **Total = materiais + mão de obra**
- Validade do orçamento
- Botões: "Salvar orçamento" / "Exportar PDF"

---

## Componentes

| Componente | Tipo | Responsabilidade |
|---|---|---|
| `BudgetWizard` | Client | Controla navegação entre etapas 1–4 |
| `AreaCalculator` | Client | Calculadora interativa (abas + cálculo em tempo real) |
| `MaterialsForm` | Client | Tinta + extras + mão de obra |
| `BudgetSummary` | Server/Client | Resumo final |
| `ProductSelector` | Client | Dropdown de tintas ativas |
| `StatusBadge` | Server | Badge de status do orçamento |

---

## Lógica de Cálculo (`lib/calculations.ts`)

Funções puras, sem efeitos colaterais, testáveis em isolamento:

```ts
calcPaintableArea(walls, doors, windows): number
// área bruta das paredes − descontos de portas e janelas

calcAreaForPaint(paintableArea, coats): number
// paintableArea × coats

calcPackages(areaForPaint, yieldM2): number
// Math.ceil(areaForPaint / yieldM2)

calcTotals(products, extraItems, laborValue): { totalMaterials, totalValue }
// soma subtotais + mão de obra
```

---

## Server Actions (`lib/budget.ts`)

Todas validadas com Zod antes de chamar Prisma:

| Action | Descrição |
|---|---|
| `createBudget(data)` | Cria rascunho, retorna `id` |
| `updateBudget(id, data)` | Atualiza qualquer etapa |
| `updateBudgetStatus(id, status)` | Muda status (DRAFT→SENT→APPROVED/REJECTED) |
| `deleteBudget(id)` | Remove orçamento do pintor autenticado |

---

## Seed (`prisma/seed.ts`)

Criado automaticamente em `prisma db seed`:
1. **Produto:** Tinta Coral Padrão Inicial · 18L · 50 m²/lata · R$ 0,00 (editável pelo admin)
2. **Usuário admin:** `admin@pintores.com` / senha temporária `Admin@123`

---

## Área Administrativa (`/admin`)

Protegida por `role === "ADMIN"`. Páginas:
- `/admin` — dashboard com totais (orçamentos, pintores, produtos)
- `/admin/produtos` — CRUD completo de produtos/tintas
- `/admin/pintores` — listagem de pintores cadastrados

---

## Página de Resumo Pública (`/resumo/[id]`)

- Server Component, sem autenticação
- Mostra todos os dados do orçamento formatados para o cliente
- Botão "Exportar PDF" chama `GET /api/pdf/[id]`
- Nota de estimativa visível

---

## Fora do Escopo (MVP)

- Pagamento online
- Envio por WhatsApp (v2)
- Tabela Client separada com histórico por cliente (v2)
- App mobile nativo
- Cálculo automático de mão de obra
- Integração com ERP
- Teto, rodapé, moldura na calculadora de área
