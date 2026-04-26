#!/usr/bin/env bash
# Stop and remove containers (docker compose down).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "=== docker compose down ==="
docker compose down "$@"

echo "=== done ==="
