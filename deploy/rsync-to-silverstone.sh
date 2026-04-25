#!/usr/bin/env bash
set -euo pipefail

# Rsync this static site to SilverStone (LAN 192.168.1.200) or override DEPLOY_HOST.
#
# Usage:
#   export DEPLOY_USER=chad
#   ./deploy/rsync-to-silverstone.sh
#
# Optional overrides:
#   export DEPLOY_HOST=192.168.1.200   # default: SilverStone
#   export DEPLOY_PATH=/srv/www/homelab-docs
#
# Requires: rsync, SSH key or password auth to the remote user.

usage() {
  sed -n '1,20p' "$0" | tail -n +2
  exit 1
}

[[ "${1:-}" == "-h" || "${1:-}" == "--help" ]] && usage

DEPLOY_HOST="${DEPLOY_HOST:-192.168.1.200}"
: "${DEPLOY_USER:?Set DEPLOY_USER (SSH login)}"
DEPLOY_PATH="${DEPLOY_PATH:-/srv/www/homelab-docs}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

rsync -avz --delete \
  --exclude '.git/' \
  --exclude '.cursor/' \
  --exclude 'deploy/' \
  "$ROOT/" "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/"

echo "Deployed to ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/"
