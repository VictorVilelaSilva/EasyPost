# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TangoShop — P2P marketplace for Dota 2 cosmetic items with escrow protection. Buyer pays via Pix → funds held → seller sends Steam trade offer → Steam API confirms delivery → funds released. 10% platform fee.

## Structure

| Directory | Stack | CLAUDE.md |
|-----------|-------|-----------|
| `back/` | Python 3.12, FastAPI, PostgreSQL, Redis | [`back/CLAUDE.md`](back/CLAUDE.md) |
| `front/` | Next.js 16.2, React 19, TypeScript, Tailwind 4 | [`front/CLAUDE.md`](front/CLAUDE.md) |

**Infrastructure:** `docker-compose.yml` at root starts Redis (port 6379), required by the backend.
