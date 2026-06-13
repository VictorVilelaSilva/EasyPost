#!/bin/sh
set -e

# Na primeira subida o volume está vazio: inicializa o banco a partir do
# template gerado no build (schema + admin + tinta padrão).
if [ ! -f /app/data/prod.db ]; then
  echo "→ Inicializando banco a partir do template..."
  cp /app/prisma/base.db /app/data/prod.db
fi

echo "→ Iniciando servidor Next..."
exec node server.js
