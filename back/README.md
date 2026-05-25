# Trade API - Backend

Marketplace P2P de itens Dota 2 com sistema de Escrow.

## Pré-requisitos

- Python 3.12+
- [uv](https://docs.astral.sh/uv/) (gerenciador de pacotes)
- PostgreSQL (via Supabase ou local)

## Setup

```bash
# 1. Instalar dependências
uv sync

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais
```

### Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Connection string PostgreSQL (ex: `postgresql+asyncpg://user:pass@localhost:5432/trade`) |
| `JWT_SECRET` | Segredo para assinar tokens JWT |
| `STEAM_API_KEY` | Chave da Steam Web API ([obter aqui](https://steamcommunity.com/dev/apikey)) |
| `ASAAS_API_KEY` | Chave da API Asaas |
| `ASAAS_BASE_URL` | `https://sandbox.asaas.com/api/v3` (sandbox) ou `https://api.asaas.com/v3` (produção) |
| `ASAAS_WEBHOOK_TOKEN` | Token para validar webhooks do Asaas |
| `FRONTEND_URL` | URL do frontend Next.js (ex: `http://localhost:3000`) |

## Rodar

```bash
# Aplicar migrations
uv run alembic upgrade head

# Iniciar servidor (dev com hot-reload)
uv run uvicorn app.main:app --reload --port 8000
```

A API estará disponível em `http://localhost:8000`.

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Testes

```bash
# Rodar todos os testes
uv run pytest

# Com output detalhado
uv run pytest -v
```

Os testes usam SQLite in-memory, não precisam de PostgreSQL.

## Estrutura

```
app/
├── main.py          # App FastAPI + CORS + background worker
├── config.py        # Settings (env vars)
├── database.py      # SQLAlchemy async engine
├── auth/            # Steam OpenID + JWT
├── inventory/       # Sync inventário Dota 2 via Steam API
├── listings/        # CRUD de anúncios
├── trade/           # Core: transações + escrow (state machine)
├── payment/         # Integração Asaas (Pix + webhooks)
├── worker/          # Background jobs (polling Steam, deadlines, refunds)
└── common/          # Dependencies (auth guard) + exceptions
```
