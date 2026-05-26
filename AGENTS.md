# Agent guide — Portable Lab Template

This document orients coding agents and contributors to **portable-lab-template**: a Node.js homelab dashboard (Fastify + Nunjucks + SQLite) with login and admin CRUD for cards, inventory, and site copy.

## Stack

- **Runtime:** Node.js (ES modules: `"type": "module"` in `package.json`).
- **HTTP:** Fastify 5 with `@fastify/cookie`, `@fastify/formbody`, `@fastify/static`, `@fastify/view`.
- **Views:** Nunjucks under `src/views/` (`layouts/`, `pages/`, `partials/`).
- **Static files:** `src/public/` — HTTP prefix **`/public/`** (see `src/server.js`).
- **Database:** `better-sqlite3`, WAL mode; path from `SQLITE_PATH` (default `./data/app.db`). **`DB_CLIENT` must be `sqlite`** — other values throw until adapters exist (`src/db/client.js`).
- **Auth:** Argon2 password hashes; signed cookie **`lab_session`** (`src/auth/session.js`). Admin routes return **403 JSON** when not admin (`src/routes/admin.js`).

There is **no** ESLint, Prettier, or automated test script in `package.json`; validate changes by running the app and exercising flows manually.

## Repository layout

| Area | Role |
|------|------|
| `src/server.js` | App bootstrap: env, DB, plugins, route registration. |
| `src/config/env.js` | Environment parsing (`HOST`, `PORT`, `SESSION_SECRET`, SQLite path, etc.). |
| `src/routes/web.js` | Public pages: `/`, `/login`, `/logout`. |
| `src/routes/admin.js` | POST handlers under `/admin/*` (inventory, cards, snippets, containers). |
| `src/db/schema.js` | Base `CREATE TABLE` SQL for migrations. |
| `src/db/client.js` | SQLite singleton `getDb()`. |
| `src/db/siteContent.js` | Snippets, status lines, defaults. |
| `src/data/labSeed.mjs` | Lab snapshot data for cards + inventory (`seed` / `seed:lab`). |
| `src/views/` | Nunjucks templates; main dashboard `pages/index.njk`. |
| `src/public/styles.css` | Primary stylesheet (Lab-derived + admin extras). |
| `scripts/migrate.js` | Runs schema + incremental SQLite alterations/backfills; calls `ensureBootstrapAdmin`. |
| `scripts/seed.js`, `scripts/seed-lab.js` | Populate or reset card/inventory data. |
| `scripts/create-admin.js`, `scripts/reset-admin-password.js` | User management CLI. |
| `docker/docker-compose.yml`, `docker/Dockerfile`, `docker/docker-entrypoint.sh` | Container build and optional migrate/seed on start. |
| `reference/` | Reference HTML (`README.md` in repo root describes diffing vs Lab). |

Human-oriented setup and feature lists live in **`README.md`**.

## Commands

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies (`npm ci` in Docker). |
| `npm run dev` | `node --watch src/server.js` |
| `npm start` | `node src/server.js` |
| `npm run migrate` | Apply DB schema and migrations. |
| `npm run seed` | Seed cards + inventory **only if** tables are empty. |
| `npm run seed:lab` | Replace **cards + inventory** with Lab snapshot (users unchanged). |
| `npm run create-admin -- <user> <password>` | Create admin user. |
| `npm run reset-admin-password -- <user> <password>` | Reset password. |
| `npm run check-env` | Pre-flight for Docker tooling (`scripts/check-env.sh`). |
| `npm run docker:build` / `docker:start` / `docker:stop` / `docker:status` | Shell wrappers around Compose. |

Copy **`env/.env.example`** → **`.env`** (at repo root) before running. Docker maps host `PORT` to container port **3000**; inside the container `PORT` is fixed to `3000`.

## Environment variables (summary)

See **`env/.env.example`** for the canonical list. Important for agents:

- **`SESSION_SECRET`** — required for serious use; dev default in code is insecure.
- **`SESSION_SECURE`** — `1` when served over HTTPS; `0` for plain HTTP (local/Docker).
- **`NODE_ENV=production`** — default admin bootstrap is **disabled** unless **`ALLOW_DEFAULT_ADMIN=1`** (see `src/auth/bootstrapUser.js`). Prefer `create-admin` for production.
- **`BOOTSTRAP_ADMIN_USERNAME` / `BOOTSTRAP_ADMIN_PASSWORD`** — optional overrides when empty DB gets a default admin.
- **`RUN_MIGRATE_ON_START`**, **`RUN_SEED_ON_START`** — read by **`docker/docker-entrypoint.sh`** only, not by plain `npm start`.

## Patterns and conventions

- **Imports:** Use `.js` extensions on local imports (project style).
- **Database:** Use prepared statements via `fastify.db` / `getDb()`; keep schema changes in **`migrationSql`** and any follow-up steps in **`scripts/migrate.js`** for existing databases. **`card_containers`** drives every card section on the home page; **`layout`** is `tiles`, `rail`, or `gallery` (see `partials/card-table.njk`).
- **Admin API:** Form POSTs and redirects back to `/` or fragment URLs (e.g. site snippets). Respect **`ALLOWED_TAGS`** for cards and validation in `admin.js`.
- **UI:** Dashboard structure and styling intentionally mirror a “Lab” static site; large image trees under `src/public/images/` are assets — avoid unrelated churn there.
- **Site copy:** Dashboard **`site_snippets`** values are edited via **inline forms** on `/`; there is no separate “page text” admin table. **`SNIPPET_DEFAULTS`** in **`siteContent.js`** lists all keys.

## What to avoid

- Introducing a second DB backend without implementing **`src/db/client.js`** and migrating queries.
- Committing **`.env`**, **`data/*.db`**, or other secrets or local databases (check **`.gitignore`**).
- Assuming **`seed`** overwrites data — use **`seed:lab`** for a full card/inventory reset.

## Quick verification

After substantive changes:

01. When you report completed work, include a link block as the final part of your reply so it sits at the bottom of the chat window. Include the local workspace path, the GitHub repository URL when available, and the local HTTP testing URL `http://localhost:3000`.
02. `npm run migrate` (if schema/scripts touched).
03. `npm run dev` and load `http://localhost:<PORT>/`.
04. Log in as admin; confirm guest vs admin behavior and a representative admin POST.

For Docker: `docker compose -f docker/docker-compose.yml up --build` (or use the `npm run docker:*` wrappers), then check logs and healthcheck in `docker/docker-compose.yml`.

## GitHub sync and migration checklist

When preparing to delete a local clone and recreate the repo elsewhere, confirm remote state explicitly:

1. Check local branch and remote tracking:
   - `git status -sb`
   - `git branch -vv`
2. Confirm remotes:
   - `git remote -v`
3. Inspect remote branch heads:
   - `git ls-remote --heads origin`
4. Push current work:
   - `git push -u origin master`

If GitHub looks stale, verify which default branch UI is showing (`main` vs `master`). A successful push to `master` does not update `main` automatically.

If `main` must match `master`:

- First attempt non-destructive update:
  - `git push origin master:main`
- If rejected because histories diverged, fetch and inspect:
  - `git fetch origin`
  - `git log --oneline --left-right --graph origin/main...master`
- Only with explicit user approval, force-update `main`:
  - `git push --force-with-lease origin master:main`

Final verification before deleting local files:

- `git ls-remote --heads origin` shows expected commit at `refs/heads/main` (and/or `refs/heads/master`)
- Open GitHub and confirm latest commit hash/time on the intended default branch.
