#!/bin/sh
set -e

PORT="${PORT:-3000}"

exec npx wrangler dev \
  --config dist/server/wrangler.json \
  --ip 0.0.0.0 \
  --port "$PORT" \
  --local-protocol=http \
  --local
