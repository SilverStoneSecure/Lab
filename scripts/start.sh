#!/usr/bin/env bash
# Start containers in detached mode (docker compose up -d).

set -euo pipefail

# shellcheck source=./common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
project_root

if [[ -f scripts/check-env.sh ]]; then
  bash scripts/check-env.sh
fi

echo "=== docker compose up -d ==="
docker compose up -d "$@"

HOST_PORT="$(read_env_port)"

echo "App should be available at: http://localhost:${HOST_PORT}/"
echo "=== done ==="
