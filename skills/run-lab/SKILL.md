---
name: run-lab
description: Run, start, launch, screenshot, test, verify, smoke-test the Lab homelab dashboard app (Fastify/SQLite web server). Use when asked to start the app, confirm a change works, or validate the login/admin flows.
---

This is a Fastify 5 + SQLite web server (`src/server.js`). The driver is `smoke.sh` — it launches the server in the background, runs `curl`-based checks against the homepage, login, session, admin, and logout endpoints, then stops the server.

**Port note:** Port 3000 is taken on this machine by Rocket.Chat. Always run the Lab app on a free port (3099 is the default in this skill).

## Prerequisites

```bash
node --version   # needs ≥ 18
npm ci           # if node_modules is missing
```

The `.env` file (copy from `.env.example`) must exist with at minimum:

```
NODE_ENV=development
PORT=3099
DB_CLIENT=sqlite
SQLITE_PATH=./data/app.db
SESSION_SECRET=any-long-string
SESSION_SECURE=0
```

The SQLite DB at `./data/app.db` must have been seeded. If starting fresh:

```bash
npm run migrate
npm run seed:lab
npm run create-admin -- admin Admin123!pass
```

## Run (agent path — smoke driver)

```bash
bash .claude/skills/run-lab/smoke.sh [PORT]
```

Defaults to port 3099. Runs 6 checks:
1. `GET /` → 200, title = "SilverStoneLab"
2. `GET /login` → 200
3. `POST /login` (admin / Admin123!pass) → 302, session cookie set
4. `POST /admin/site-snippets` (authenticated) → 302
5. `POST /logout` → 302
6. `POST /admin/site-snippets` (after logout) → 403

Exit 0 = all pass. Exit 1 = failures reported + server log tail printed.

Server stdout/stderr goes to `/tmp/lab-server-<PORT>.log`.

## Run (human / dev path)

```bash
PORT=3099 npm run dev
# open http://localhost:3099 in a browser
```

`npm run dev` uses `--watch` for auto-reload. Ctrl-C to stop. Useless headless.

## Test a specific route or admin mutation

```bash
# Start the server in the background
PORT=3099 NODE_ENV=development node src/server.js >/tmp/lab.log 2>&1 &

# Login and store cookies
curl -s -c /tmp/lab-c.txt -b /tmp/lab-c.txt \
  -X POST http://localhost:3099/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=Admin123!pass" -o /dev/null -w "%{http_code}"
# → 302

# Hit any admin endpoint
curl -s -c /tmp/lab-c.txt -b /tmp/lab-c.txt \
  -X POST http://localhost:3099/admin/site-snippets \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "site_title=MyLab" -o /dev/null -w "%{http_code}"
# → 302

# Stop
kill %1
```

## Gotchas

- **Port 3000 is Rocket.Chat** on this host. `EADDRINUSE` on port 3000 = use 3099 (or any free port). Always pass `PORT=` explicitly.
- **`ALLOW_DEFAULT_ADMIN=1` is not needed in development** — `NODE_ENV=development` makes the seed admin (`admin / Admin123!pass`) available automatically via `ensureBootstrapAdmin`.
- **Passwords with `!` in npm args need single quotes:** `npm run create-admin -- admin 'Admin123!pass'`. In env files or scripts, no quoting issue.
- **Cookie jar is stateful.** If a previous test left a session in `/tmp/lab-c.txt`, later tests will appear authenticated. The smoke driver always starts with `rm -f $COOKIES`.
- **WAL mode:** `data/app.db` uses WAL (`app.db-shm`, `app.db-wal`). Do not delete only the main file — delete all three or none.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `EADDRINUSE: address already in use 0.0.0.0:3000` | Use `PORT=3099` (Rocket.Chat owns 3000) |
| `403` on admin POST when you expect `302` | Cookie jar has no session — re-run login step |
| `Cannot find module 'better-sqlite3'` | `npm ci` |
| Server exits immediately | Check `/tmp/lab-server-3099.log` — likely a missing `.env` or DB path |
| `seed:lab` overwrites data | Intentional — it resets cards + inventory but never users |
