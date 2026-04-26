#!/usr/bin/env bash
set -euo pipefail

SRC="${1:-./data/app.db}"
DEST="${2:-./data/app.db.bak}"

cp "$SRC" "$DEST"
echo "Backup saved to $DEST"
