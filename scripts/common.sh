#!/usr/bin/env bash
# Common helpers for scripts/*.sh.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./config.sh
source "${SCRIPT_DIR}/config.sh"

project_root() {
  cd "${ROOT_DIR}"
}

read_env_port() {
  local port="${DEFAULT_HOST_PORT}"
  if [[ -f "${ENV_FILE}" ]]; then
    local env_port
    env_port="$(sed -n 's/^[[:space:]]*PORT[[:space:]]*=[[:space:]]*\([0-9][0-9]*\)[[:space:]]*$/\1/p' "${ENV_FILE}" | awk 'END{print}')"
    if [[ -n "${env_port:-}" ]]; then
      port="${env_port}"
    fi
  fi
  printf "%s\n" "${port}"
}
