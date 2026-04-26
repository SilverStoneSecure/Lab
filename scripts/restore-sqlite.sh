#!/usr/bin/env bash
set -euo pipefail

SRC="${1:-./data/app.db.bak}"
DEST="${2:-./data/app.db}"

cp "$SRC" "$DEST"
echo "Restored to $DEST"
