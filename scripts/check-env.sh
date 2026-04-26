#!/usr/bin/env bash
# Pre-build / pre-docker sanity check. Run from repo root: ./scripts/check-env.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

fail=0
warn() { echo "WARN: $*" >&2; }
err() { echo "ERR:  $*" >&2; fail=1; }

echo "=== user ==="
whoami
id
echo

echo "=== docker group ==="
if groups | grep -qw docker; then
  echo "OK: user is in group 'docker'"
else
  err "user is NOT in group 'docker' (sudo usermod -aG docker \"\$USER\" then log out/in)"
fi
echo

echo "=== binaries ==="
for cmd in node npm docker git; do
  if command -v "$cmd" >/dev/null 2>&1; then
    echo "OK: $(command -v "$cmd")"
  else
    err "missing: $cmd"
  fi
done
node --version 2>/dev/null || true
npm --version 2>/dev/null || true
docker --version 2>/dev/null || true
docker compose version 2>/dev/null || true
echo

echo "=== docker API ==="
if docker ps >/dev/null 2>&1; then
  docker ps | head -3
else
  err "docker ps failed (socket permission or daemon down)"
fi
echo

echo "=== project files ==="
test -f Dockerfile || err "missing Dockerfile"
test -f docker-compose.yml || err "missing docker-compose.yml"
test -f package.json || err "missing package.json"
test -f package-lock.json || err "missing package-lock.json (npm ci in Docker will fail)"
test -f docker-entrypoint.sh || err "missing docker-entrypoint.sh"
if [[ -x docker-entrypoint.sh ]]; then
  echo "OK: docker-entrypoint.sh is executable"
else
  err "docker-entrypoint.sh is not executable (chmod +x docker-entrypoint.sh)"
fi
if [[ -f .env ]]; then
  echo "OK: .env exists"
else
  warn ".env missing — copy .env.example to .env before compose"
fi
echo

if [[ $fail -eq 0 ]]; then
  echo "=== result: OK (ready to docker compose build) ==="
  exit 0
else
  echo "=== result: FAILED (fix errors above) ===" >&2
  exit 1
fi
