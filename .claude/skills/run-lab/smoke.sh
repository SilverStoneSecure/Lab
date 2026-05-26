#!/usr/bin/env bash
# smoke.sh — launch the Lab server and run curl-based smoke tests
# Usage: bash .claude/skills/run-lab/smoke.sh [PORT]
# Defaults to port 3099 to avoid collision with Rocket.Chat on 3000.

set -euo pipefail
cd "$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"

PORT="${1:-3099}"
BASE="http://localhost:$PORT"
LOG="/tmp/lab-server-$PORT.log"
COOKIES="/tmp/lab-cookies-$PORT.txt"
FAIL=0

# ---------------------------------------------------------------------------
pass() { echo "  PASS  $1"; }
fail() { echo "  FAIL  $1"; FAIL=1; }
check() {
  local label="$1"; shift
  local got
  got=$(curl -s -c "$COOKIES" -b "$COOKIES" "$@")
  echo "$got"
}
status() {
  local label="$1"; shift
  local got
  got=$(curl -s -o /dev/null -w "%{http_code}" "$@")
  echo "$got"
}

echo "=== Lab smoke ==="
echo "Starting server on port $PORT …"

PORT=$PORT NODE_ENV=development node src/server.js >"$LOG" 2>&1 &
SERVER_PID=$!
trap "kill $SERVER_PID 2>/dev/null; echo 'Server stopped.'" EXIT

# Wait up to 8 s for server to be ready
for i in $(seq 1 16); do
  if curl -s -o /dev/null -w "%{http_code}" "$BASE/" | grep -q '^200$'; then break; fi
  sleep 0.5
done

# ---------------------------------------------------------------------------
echo ""
echo "--- 1. Homepage (public) ---"
CODE=$(status "GET /" "$BASE/")
[ "$CODE" = "200" ] && pass "GET / → 200" || fail "GET / → $CODE (expected 200)"

TITLE=$(curl -s "$BASE/" | grep -o '<title>[^<]*</title>' || true)
echo "  title: $TITLE"
[[ "$TITLE" == *"SilverStoneLab"* ]] && pass "title contains SilverStoneLab" || fail "unexpected title: $TITLE"

# ---------------------------------------------------------------------------
echo ""
echo "--- 2. Login page ---"
CODE=$(status "GET /login" "$BASE/login")
[ "$CODE" = "200" ] && pass "GET /login → 200" || fail "GET /login → $CODE"

# ---------------------------------------------------------------------------
echo ""
echo "--- 3. Login (valid credentials) ---"
rm -f "$COOKIES"
CODE=$(curl -s -c "$COOKIES" -b "$COOKIES" \
  -X POST "$BASE/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=Admin123!pass" \
  -o /dev/null -w "%{http_code}")
[ "$CODE" = "302" ] && pass "POST /login → 302 redirect" || fail "POST /login → $CODE (expected 302)"

DASH=$(curl -s -c "$COOKIES" -b "$COOKIES" "$BASE/")
[[ "$DASH" == *"logout"* ]] && pass "dashboard shows logout (session active)" \
  || fail "dashboard missing logout — session may not have been set"

# ---------------------------------------------------------------------------
echo ""
echo "--- 4. Admin endpoint (authenticated) ---"
CODE=$(curl -s -c "$COOKIES" -b "$COOKIES" \
  -X POST "$BASE/admin/site-snippets" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "site_title=SilverStoneLab" \
  -o /dev/null -w "%{http_code}")
[ "$CODE" = "302" ] && pass "POST /admin/site-snippets (authed) → 302" \
  || fail "POST /admin/site-snippets (authed) → $CODE"

# ---------------------------------------------------------------------------
echo ""
echo "--- 5. Logout ---"
CODE=$(curl -s -c "$COOKIES" -b "$COOKIES" \
  -X POST "$BASE/logout" -o /dev/null -w "%{http_code}")
[ "$CODE" = "302" ] && pass "POST /logout → 302" || fail "POST /logout → $CODE"

# ---------------------------------------------------------------------------
echo ""
echo "--- 6. Admin endpoint (unauthenticated, after logout) ---"
CODE=$(curl -s -c "$COOKIES" -b "$COOKIES" \
  -X POST "$BASE/admin/site-snippets" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "site_title=Test" \
  -o /dev/null -w "%{http_code}")
[ "$CODE" = "403" ] && pass "POST /admin/site-snippets (unauthed) → 403" \
  || fail "POST /admin/site-snippets (unauthed) → $CODE (expected 403)"

# ---------------------------------------------------------------------------
echo ""
if [ $FAIL -eq 0 ]; then
  echo "All checks passed."
else
  echo "Some checks FAILED. Server log: $LOG"
  tail -20 "$LOG"
  exit 1
fi
