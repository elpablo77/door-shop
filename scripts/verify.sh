#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "[verify] frontend: npm ci + build"
cd frontend
npm ci
npm run build
cd "$ROOT_DIR"

echo "[verify] auth-service tests"
cd auth-service
./gradlew --no-daemon test
cd "$ROOT_DIR"

echo "[verify] catalog-service tests"
cd catalog-service
./gradlew --no-daemon test
cd "$ROOT_DIR"

echo "[verify] order-service tests"
cd order-service
./gradlew --no-daemon test
cd "$ROOT_DIR"

echo "[verify] docker compose build"
docker compose build

echo "[verify] done"
