#!/usr/bin/env bash
# Build Docker images for this project. Run from anywhere.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ -f scripts/check-env.sh ]]; then
  bash scripts/check-env.sh
fi

echo "=== docker compose build ==="
docker compose build "$@"

echo "=== done ==="
