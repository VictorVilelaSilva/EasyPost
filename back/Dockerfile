FROM python:3.12-slim AS base

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

FROM base AS deps
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

FROM base AS runner
WORKDIR /app

COPY --from=deps /app/.venv ./.venv
COPY . .

ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8004
CMD alembic upgrade head && exec uvicorn app.main:app --host 0.0.0.0 --port 8004
