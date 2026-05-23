#!/bin/sh
set -e

PORT="${PORT:-3000}"

if [ ! -f dist/server/index.js ]; then
  echo "ERRO: dist/server/index.js não encontrado."
  exit 1
fi

if [ ! -f dist/server/wrangler.json ]; then
  echo "ERRO: dist/server/wrangler.json ausente."
  exit 1
fi

ENTRY=$(grep -oE 'worker-entry-[^"]+\.js' dist/server/index.js | head -1)
if [ -n "$ENTRY" ] && [ ! -f "dist/server/assets/$ENTRY" ]; then
  echo "ERRO: index.js referencia assets/$ENTRY mas o arquivo não existe."
  echo "Arquivos em dist/server/assets:"
  ls -la dist/server/assets/ | head -20
  exit 1
fi

cd dist/server

echo "Iniciando Freela OS na porta $PORT (worker: ${ENTRY:-index.js})..."

exec npx wrangler dev index.js \
  --config wrangler.json \
  --ip 0.0.0.0 \
  --port "$PORT" \
  --local-protocol=http \
  --local
