#!/usr/bin/env bash
# Stop and remove containers (docker compose down).

set -euo pipefail

# shellcheck source=./common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
project_root

echo "=== docker compose down ==="
docker compose down "$@"

echo "=== done ==="
