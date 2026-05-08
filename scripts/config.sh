#!/usr/bin/env bash
# Shared script configuration for local Docker workflows.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"
DEFAULT_HOST_PORT="3000"
DOCKER_COMPOSE_FILE="${ROOT_DIR}/docker-compose.yml"
