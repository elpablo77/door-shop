#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

PORT="${PORT:-${FRONTEND_PORT:-18080}}"
AUTH_EMAIL="${AUTH_EMAIL:-admin@test.com}"
AUTH_PASSWORD="${AUTH_PASSWORD:-password}"

echo "[smoke] docker compose up -d"
docker compose up -d

echo "[smoke] waiting for frontend proxy"
sleep 8

echo "[smoke] GET /api/catalog/doors"
curl -fsS "http://localhost:${PORT}/api/catalog/doors" | head -c 500 && echo

echo "[smoke] GET /api/catalog/suggest?q=at"
curl -fsS "http://localhost:${PORT}/api/catalog/suggest?q=at" | head -c 500 && echo

echo "[smoke] GET /api/catalog/series"
curl -fsS "http://localhost:${PORT}/api/catalog/series" | head -c 500 && echo

echo "[smoke] POST /api/auth/login"
LOGIN_RESPONSE="$(curl -fsS -X POST "http://localhost:${PORT}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${AUTH_EMAIL}\",\"password\":\"${AUTH_PASSWORD}\"}")"

TOKEN="$(printf '%s' "$LOGIN_RESPONSE" | sed -E 's/.*"token":"([^"]+)".*/\1/')"

if [[ -z "$TOKEN" || "$TOKEN" == "$LOGIN_RESPONSE" ]]; then
  echo "[smoke] failed to extract JWT token"
  exit 1
fi

echo "[smoke] POST /api/catalog/admin/reseed"
curl -fsS -X POST "http://localhost:${PORT}/api/catalog/admin/reseed" -H "Authorization: Bearer ${TOKEN}" | head -c 200 && echo

echo "[smoke] done"
