#!/usr/bin/env bash
# Show compose status and app URL.

set -euo pipefail

# shellcheck source=./common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
project_root

echo "=== docker compose ps ==="
docker compose ps
echo
echo "=== docker compose images ==="
docker compose images
echo
echo "App URL: http://localhost:$(read_env_port)/"
