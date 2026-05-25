# Backend Design — Marketplace P2P Dota 2

## Resumo

Backend para marketplace P2P de itens cosméticos de Dota 2 com sistema de escrow financeiro. Elimina golpes garantindo que o pagamento só é liberado após confirmação técnica da entrega do item via Steam API.

**Stack:** FastAPI (Python) + PostgreSQL (Supabase) + Asaas (Pix) + Steam Web API

**Escala MVP:** ~100 utilizadores, ~10 transações/dia (validação de conceito)

**Frontend:** Next.js (REST API)

---

## Arquitetura

```
┌──────────────┐     ┌──────────────────────────────┐     ┌─────────────┐
│   Next.js    │────▶│         FastAPI               │────▶│  Supabase   │
│   Frontend   │◀────│                               │◀────│  PostgreSQL │
└──────────────┘     │  ┌─────────┐ ┌─────────────┐  │     └─────────────┘
                     │  │  Auth   │ │  Inventory   │  │
                     │  │ (Steam) │ │  (Steam API) │  │     ┌─────────────┐
                     │  ├─────────┤ ├─────────────┤  │────▶│   Asaas     │
                     │  │  Trade  │ │   Payment    │  │◀────│  (Pix)      │
                     │  │ (Core)  │ │  (Escrow)    │  │     └─────────────┘
                     │  └─────────┘ └─────────────┘  │
                     │                               │     ┌─────────────┐
                     │  ┌──────────────────────────┐ │────▶│  Steam API  │
                     │  │  Background Worker       │ │◀────│             │
                     │  │  (Polling Cron)          │ │     └─────────────┘
                     │  └──────────────────────────┘ │
                     └──────────────────────────────┘
```

Monolito FastAPI com separação por domínios + worker de background para polling da Steam.

---

## Estrutura do Projeto

```
app/
├── main.py                  # FastAPI app + startup
├── config.py                # Settings (env vars)
├── database.py              # SQLAlchemy async engine + session
├── auth/
│   ├── router.py            # Endpoints Steam OpenID + JWT
│   ├── service.py           # Lógica de autenticação
│   ├── models.py            # User model
│   └── schemas.py           # Pydantic schemas
├── inventory/
│   ├── router.py            # Endpoints de inventário
│   ├── service.py           # Lógica + chamadas Steam API
│   ├── models.py            # Item/Listing models
│   └── schemas.py
├── trade/
│   ├── router.py            # Endpoints de transação
│   ├── service.py           # Lógica core do escrow + trade
│   ├── models.py            # Transaction model
│   └── schemas.py
├── payment/
│   ├── router.py            # Endpoints Asaas + webhooks
│   ├── service.py           # Integração Asaas
│   └── schemas.py
├── worker/
│   └── steam_poller.py      # Cron job polling Steam API
└── common/
    ├── dependencies.py      # JWT validation, get_current_user
    └── exceptions.py        # Custom exceptions
```

---

## Modelo de Dados

### Users (US1)

```sql
create table users (
    id              integer generated always as identity primary key,
    steam_id        text not null unique,
    display_name    text not null,
    avatar_url      text,
    trade_url       text,
    steam_api_key   text,
    is_trade_banned boolean not null default false,
    reputation      smallint not null default 100,
    balance         numeric(12,2) not null default 0.00,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);
```

### Listings (US2)

```sql
create table listings (
    id              integer generated always as identity primary key,
    seller_id       integer not null references users(id),
    asset_id        text not null,
    class_id        text not null,
    item_name       text not null,
    icon_url        text,
    rarity          text,
    price           numeric(10,2) not null,
    status          text not null default 'active'
                    check (status in ('active','reserved','sold','cancelled')),
    tradable_after  timestamptz,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);
```

### Transactions (US3/US4/US5/US6)

```sql
create table transactions (
    id                  integer generated always as identity primary key,
    listing_id          integer not null references listings(id),
    buyer_id            integer not null references users(id),
    seller_id           integer not null references users(id),
    amount              numeric(10,2) not null,
    platform_fee        numeric(10,2) not null,
    seller_amount       numeric(10,2) not null,
    status              text not null default 'pending_payment'
                        check (status in (
                            'pending_payment',
                            'paid',
                            'trade_pending',
                            'trade_sent',
                            'completed',
                            'cancelled',
                            'refunded'
                        )),
    security_code       text not null,
    trade_offer_id      text,
    payment_id          text,
    trade_deadline      timestamptz,
    seller_payout_after timestamptz,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now()
);
```

### Payment Events (Webhook log)

```sql
create table payment_events (
    id              integer generated always as identity primary key,
    transaction_id  integer not null references transactions(id),
    event_type      text not null,
    payload         jsonb not null,
    created_at      timestamptz not null default now()
);
```

### Indexes

```sql
-- FK indexes
create index listings_seller_id_idx on listings (seller_id);
create index transactions_listing_id_idx on transactions (listing_id);
create index transactions_buyer_id_idx on transactions (buyer_id);
create index transactions_seller_id_idx on transactions (seller_id);
create index payment_events_transaction_id_idx on payment_events (transaction_id);

-- Partial indexes
create index listings_active_idx on listings (created_at desc)
    where status = 'active';

create index transactions_active_idx on transactions (status, trade_deadline)
    where status not in ('completed', 'cancelled', 'refunded');

-- Composite index para polling
create index transactions_polling_idx on transactions (status, trade_offer_id)
    where status = 'trade_sent';
```

---

## Máquina de Estados (Transactions)

```
                    ┌─────────────────┐
                    │ pending_payment  │  Comprador clicou "Comprar"
                    └────────┬────────┘
                             │ Pix confirmado (webhook Asaas)
                             ▼
                    ┌─────────────────┐
                    │      paid       │  Escrow ativo, deadline 12h inicia
                    └────────┬────────┘
                             │ Automático
                             ▼
                    ┌─────────────────┐
            ┌───── │  trade_pending   │  Vendedor tem 12h para enviar
            │      └────────┬────────┘
            │               │ Vendedor regista trade_offer_id
            │               ▼
            │      ┌─────────────────┐
            │ ┌─── │   trade_sent    │  Poller monitora Steam API
            │ │    └────────┬────────┘
            │ │             │ Steam: TradeOfferState Accepted
            │ │             ▼
            │ │    ┌─────────────────┐
            │ │    │   completed     │  Saldo creditado (saque após 24h)
            │ │    └─────────────────┘
            │ │
            │ │  Trade recusada/expirada
            │ └──────────┐
            │            ▼
            │   ┌─────────────────┐
            └──▶│   cancelled     │  Timeout 12h OU recusa na Steam
                └────────┬────────┘
                         │ Estorno automático
                         ▼
                ┌─────────────────┐
                │    refunded     │  Valor devolvido ao comprador
                └─────────────────┘
```

### Transições

| De | Para | Trigger |
|---|---|---|
| `pending_payment` | `paid` | Webhook Asaas (PAYMENT_RECEIVED) |
| `pending_payment` | `cancelled` | Timeout pagamento ou comprador cancela |
| `paid` | `trade_pending` | Automático após confirmação |
| `trade_pending` | `trade_sent` | Vendedor registra `trade_offer_id` |
| `trade_pending` | `cancelled` | Timeout 12h (cron) |
| `trade_sent` | `completed` | Poller: TradeOfferState Accepted |
| `trade_sent` | `cancelled` | Poller: recusa/expiração na Steam |
| `cancelled` | `refunded` | Estorno automático via Asaas |

---

## Endpoints da API

### Auth (`/api/auth`)

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/auth/steam/login` | Redireciona para Steam OpenID | Não |
| GET | `/auth/steam/callback` | Callback Steam → JWT | Não |
| POST | `/auth/refresh` | Renova access token | Cookie |
| POST | `/auth/logout` | Invalida refresh token | JWT |

### Users (`/api/users`)

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/users/me` | Perfil do utilizador | JWT |
| PATCH | `/users/me` | Atualiza trade_url e steam_api_key | JWT |

### Inventory (`/api/inventory`)

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/inventory/sync` | Busca inventário Dota 2 na Steam API | JWT |

### Listings (`/api/listings`)

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/listings` | Lista anúncios ativos (cursor-based pagination) | Não |
| GET | `/listings/{id}` | Detalhe de um anúncio | Não |
| POST | `/listings` | Cria anúncio | JWT |
| DELETE | `/listings/{id}` | Cancela anúncio próprio | JWT |
| GET | `/listings/me` | Anúncios do vendedor | JWT |

### Transactions (`/api/transactions`)

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/transactions` | Inicia compra → Pix | JWT |
| GET | `/transactions/{id}` | Detalhe da transação | JWT |
| PATCH | `/transactions/{id}/trade-offer` | Vendedor registra trade_offer_id | JWT (seller) |
| GET | `/transactions/me` | Histórico de transações | JWT |

### Payments (`/api/payments`)

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/payments/webhook` | Webhook Asaas | Asaas signature |
| POST | `/payments/withdraw` | Saque do balance via Pix | JWT |

### Background Workers

| Job | Frequência | Descrição |
|-----|-----------|-----------|
| `poll_steam_trades` | 2 min | Consulta Steam API para transações `trade_sent` |
| `check_trade_deadlines` | 5 min | Cancela transações `trade_pending` com timeout |
| `process_refunds` | 5 min | Estorno no Asaas para transações `cancelled` |

---

## Fluxo Completo (Happy Path)

1. `GET /auth/steam/login` → Login Steam
2. `PATCH /users/me` → Configura trade_url + api_key
3. `GET /inventory/sync` → Carrega itens do inventário
4. `POST /listings` → Vendedor anuncia Arcana por R$100
5. `GET /listings` → Comprador encontra o anúncio
6. `POST /transactions` → Comprador paga → Pix gerado
7. `POST /payments/webhook` → Asaas confirma → escrow ativo
8. `PATCH /transactions/{id}/trade-offer` → Vendedor envia trade_offer_id
9. Worker `poll_steam_trades` → Detecta Accepted → completed
10. `POST /payments/withdraw` → Vendedor saca R$90 (após 24h)

---

## Decision Log

| # | Decisão | Alternativa | Porquê |
|---|---------|------------|--------|
| 1 | FastAPI + PostgreSQL/Supabase | Django, Node.js | Requisito do utilizador |
| 2 | Asaas para Pix | Stripe, Efí | API brasileira com Pix nativo, split e conta digital |
| 3 | JWT stateless + refresh cookie httpOnly | Sessões server-side, Supabase Auth | Simples, sem estado no servidor |
| 4 | Polling periódico (cron) para Steam API | Polling por transação, híbrido | Simples e suficiente para escala pequena |
| 5 | Notificações fora do escopo MVP | E-mail, WhatsApp, dashboard | Decisão do utilizador |
| 6 | Integer identity como PK | UUID | Preferência do utilizador — mais simples |
| 7 | Status como text + CHECK | ENUM type | Mais fácil adicionar novos estados sem ALTER TYPE |
| 8 | Balance na tabela users | Tabela wallets separada | YAGNI — escala pequena |
| 9 | payment_events com JSONB | Colunas tipadas | Webhooks mudam de formato; preserva payload raw |
| 10 | Partial indexes em listings/transactions | Full indexes | Queries filtram maioritariamente por status ativo |
| 11 | Monolito com módulos | Microserviços | YAGNI — escala pequena, deploy simples |

---

## Pressupostos

1. Supabase usado como hosting PostgreSQL; lógica de negócio toda na FastAPI
2. API Key da Steam fornecida pelo utilizador no onboarding
3. Comissão da plataforma: 10%
4. Prazo do vendedor para enviar troca: 12 horas
5. Período de segurança pós-entrega para saque: 24 horas
6. Deploy inicial simples (VPS ou container único)
