FROM node:22-alpine AS base

# ---- Dependências ----
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# DATABASE_URL fictício só para o build (Prisma não conecta, só precisa estar definido)
ENV DATABASE_URL="file:./build.db"
RUN npx prisma generate
RUN npm run build
# Gera o banco-template (schema + seed) que será copiado para o volume no 1º start
RUN npx prisma db push --skip-generate && node prisma/seed.cjs

# ---- Produção ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# App (Next standalone)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma client gerado + engine (necessários para as queries em runtime)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
# Banco-template (schema + seed) gerado no build
COPY --from=builder --chown=nextjs:nodejs /app/prisma/build.db ./prisma/base.db
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Diretório do SQLite persistido (a permissão é herdada pelo volume nomeado)
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
