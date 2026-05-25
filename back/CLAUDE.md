# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Package manager:** `uv`

```bash
uv sync                      # Install dependencies
task dev                     # Dev server — port 8000, hot-reload
task test                    # Run tests with HTML coverage report
task cov                     # Coverage report
task migrate                 # alembic upgrade head
task rev "description"       # Create new migration (autogenerate)
task seed                    # Run seed script
```

**Run a single test:**
```bash
uv run pytest tests/test_trade.py::TestStateMachine::test_happy_path -v
uv run pytest tests/test_trade.py -v        # All in file
uv run pytest -k "test_create_listing" -v  # By name pattern
```

**Lint/format:**
```bash
uv run ruff check .
uv run ruff format .
```

Tests use in-memory SQLite (`sqlite+aiosqlite:///:memory:`) — no PostgreSQL or Redis needed.

---

## Architecture

### Domain Structure

Each domain follows: `router.py` → `service.py` → `models.py` → `schemas.py`

```
app/
├── main.py           # FastAPI app, lifespan (starts background workers)
├── config.py         # Settings via pydantic-settings (reads .env)
├── database.py       # SQLAlchemy async engine + session factory
├── auth/             # Steam OpenID login, JWT generation/refresh
├── inventory/        # Steam API item fetch, Redis caching
├── listings/         # Listing CRUD
├── trade/            # Core escrow logic + state machine
├── payment/          # Asaas/Pix integration, webhook handler
├── worker/           # Background asyncio tasks
└── common/           # get_current_user dependency, custom exceptions
```

### Transaction State Machine

Core of the business logic — `app/trade/service.py`. `_check_transition()` enforces legal transitions:

```
pending_payment → paid → trade_pending → trade_sent → completed
                                       ↘           ↗
                                        cancelled → refunded
```

| Trigger | Transition |
|---------|-----------|
| Asaas webhook `PAYMENT_RECEIVED` | `pending_payment → paid` |
| Automatic (post-payment) | `paid → trade_pending` |
| Seller registers `trade_offer_id` | `trade_pending → trade_sent` |
| Steam poller: offer Accepted | `trade_sent → completed` |
| Steam poller: offer Declined/Expired | `trade_sent → cancelled` |
| Background cron: 12h deadline elapsed | `trade_pending → cancelled` |
| Automatic after cancel | `cancelled → refunded` |

### Background Worker (`app/worker/steam_poller.py`)

Runs as asyncio tasks via `lifespan` in `main.py`:
- **Every 2 min** — polls Steam API for `trade_sent` transactions; state `3` = Accepted → `completed`, states `6/7/8/11` → `cancelled`
- **Every 5 min** — cancels `trade_pending` transactions past 12h deadline
- **Every 5 min** — processes Asaas refunds for `cancelled` transactions

### Authentication

Steam OpenID → JWT access token (short-lived) + refresh token (httpOnly cookie). `app/common/dependencies.py` provides the `get_current_user` FastAPI dependency injected into protected routes.

### Caching

Redis for Steam API responses. TTLs: inventory 300s, item details 1800s. Configured via `REDIS_URL`.

---

## Environment Variables (`.env`)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Token signing key |
| `STEAM_API_KEY` | Fallback system Steam key (users provide their own) |
| `ASAAS_API_KEY` | Payment processor |
| `ASAAS_BASE_URL` | `https://sandbox.asaas.com/api/v3` (dev) or production |
| `ASAAS_WEBHOOK_TOKEN` | Webhook HMAC validation |
| `FRONTEND_URL` | CORS allowed origin |
| `REDIS_URL` | Cache backend |
| `TRADE_DEADLINE_HOURS` | Default: 12 |
| `PAYOUT_HOLD_HOURS` | Default: 24 |
