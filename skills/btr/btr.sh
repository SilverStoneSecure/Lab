#!/usr/bin/env bash
set -euo pipefail

# btr helper: run check-env, install deps if needed, start app on PORT (default 3001)
ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

if [ "${SKIP_CHECK:-0}" = "1" ]; then
  echo "BTR: SKIP_CHECK=1 set — skipping npm run check-env"
else
  echo "BTR: running environment check (npm run check-env)"
  if ! npm run check-env; then
    echo "check-env failed - aborting"
    exit 1
  fi
fi

if [ ! -d node_modules ]; then
  echo "node_modules missing — installing dependencies (npm ci)"
  npm ci
fi

PORT=${PORT:-3001}

if lsof -iTCP:${PORT} -sTCP:LISTEN -Pn >/dev/null 2>&1; then
  echo "Port ${PORT} is already in use. Assuming server is running at http://localhost:${PORT}"
  exit 0
fi

echo "Starting app on port ${PORT} (logs -> /tmp/btr_app.log)"
env PORT=${PORT} nohup npm run start > /tmp/btr_app.log 2>&1 &
sleep 1
echo "Started. Open http://localhost:${PORT} to view the app."
