# Portable Lab Template

Node.js + Fastify homelab dashboard template with SQLite, login, and admin editing.

For agents and contributors (stack, repo layout, npm scripts, env, conventions): **[`AGENTS.md`](AGENTS.md)**.

## Lab look and data parity

- **Visual source:** [`src/public/styles.css`](src/public/styles.css) is the full [`Lab/styles.css`](/home/chad/ProjectsLocal/Lab/styles.css) copy, plus extra rules for tag types `service`, `device`, `folder`, `template`, `div.card` admin blocks, and toolbar forms.
- **Page structure:** [`src/views/pages/index.njk`](src/views/pages/index.njk) mirrors [`Lab/index.html`](/home/chad/ProjectsLocal/Lab/index.html): `bg-grid` / `glow`, header + status box, `quick-nav`, sections **On the LAN**, **Device inventory**, **From the internet**, **About**, **Admin contacts**, **Media** (folders + gallery), **Notes**, and footer. Static copy matches Lab; **cards** and **inventory rows** come from SQLite.
- **Reference file:** [`reference/lab-index.html`](reference/lab-index.html) is a frozen copy of the Lab `index.html` for side-by-side diffing.
- **Structured import:** [`src/data/labSeed.mjs`](src/data/labSeed.mjs) holds the same card and inventory data as Lab (URLs, copy, gallery image paths). Gallery assets live under [`src/public/images/`](src/public/images/) (SVG placeholders copied from Lab).
- **Reload Lab snapshot:** `npm run seed:lab` wipes **only** `cards` and `inventory_rows` (users untouched) and reinserts the Lab snapshot. First install with an empty DB: `npm run migrate` then `npm run seed` (seed uses the same snapshot when tables are empty).

### Card tags (dropdown + CSS)

Editable cards use a tag dropdown: **LAN**, **WAN**, **Service**, **Device**, **Folder**, **Template**. Classes map to `.tag.lan`, `.tag.wan`, `.tag.service`, `.tag.device`, `.tag.folder`, `.tag.template` for distinct colors.

### Add Card behaviour

**Add Card** does not POST immediately: it turns on **Expand Edit** (if needed) and opens the **New card** draft form at the top. **Save new card** submits once; each existing card still uses **Save** per card.

## Current admin features

- Login/logout with signed cookie session.
- Inventory CRUD (pill `ok` / `q` / none, caption for `q`, notes suffix; Lab-style **Notes** column). Click **Host** to edit inline; **Save row** on the right; **Add row** at the bottom.
- **Devices** category (empty by default after `seed:lab`): its own table above LAN links; **Add card** at the bottom opens one new expanded row.
- **Card containers:** All dashboard card sections (devices, LAN, WAN, contacts, media folders, gallery, etc.) come from **`card_containers`** rows ordered by **display order**. Each container has a **layout**: **tiles** (standard grid), **rail** (horizontal strip with scroll arrows), or **gallery** (image-focused grid). Toggle **Shown**, reorder, duplicate, or pick layout in **Page content → Card containers**.
- **Site copy:** Snippets are edited **inline** on the dashboard (hero, WAN strip, About, Notes, etc.), not from a separate bulk editor. **Card containers** are configured at the bottom of the page when signed in as admin.
- Cards CRUD by section (tables): **title** is a link (guests: goes to URL; admins: opens that row’s editor). **Add card** at the bottom of each table opens a single new expanded row. Tag dropdown, image URL, “open in new tab” where applicable.

## Quick start (when Node is installed locally)

1. Copy env:
   - `cp .env.example .env`
2. Install deps:
   - `npm install`
3. Run migrations and seed:
   - `npm run migrate`
   - `npm run seed` (empty DB only) **or** `npm run seed:lab` anytime to reset cards + inventory to the Lab snapshot
4. First admin user (pick one):
   - **Default (development):** after `migrate` or first `npm start`, if `users` is empty the app creates **`admin` / `Admin123!pass`** (same as the hints on `/login`). In `NODE_ENV=production`, set **`ALLOW_DEFAULT_ADMIN=1`** once for that behavior, or use the command below instead.
   - **Explicit:** `npm run create-admin -- admin YourPasswordHere` (or `npm run reset-admin-password -- admin NewPassword` if the user already exists).
5. Start:
   - `npm run dev`
6. Open:
   - `http://localhost:3000`

## Pre-build check (Docker / tooling)

From repo root:

- `./scripts/check-env.sh`
- or `npm run check-env`

Verifies: `docker` group, `docker ps`, `node`/`npm`/`docker`/`git`, required files, `package-lock.json`, executable `docker-entrypoint.sh`, and warns if `.env` is missing.

### Convenience scripts

| Script | Purpose |
|--------|--------|
| `./scripts/build.sh` | Runs `check-env` then `docker compose build` |
| `./scripts/start.sh` | `docker compose up -d`, shows port + logs hint |
| `./scripts/stop.sh` | `docker compose down` |
| `./scripts/status.sh` | `docker compose ps`, health hint, last logs |

NPM equivalents: `npm run docker:build`, `docker:start`, `docker:stop`, `docker:status`.

## Docker Compose

1. Copy env:
   - `cp .env.example .env`
2. Build and run:
   - `docker compose up --build`
3. First time only (optional): seed — set `RUN_SEED_ON_START=1` in `.env` for one boot, or run `docker compose exec app npm run seed` / `docker compose exec app npm run seed:lab` to reload the Lab card + inventory snapshot
4. Create or fix admin inside container:
   - New user: `docker compose exec app npm run create-admin -- admin 'YourPassword'` (use **single quotes** if the password contains `!` or `$`)
   - User already exists / “invalid” login: `docker compose exec app npm run reset-admin-password -- admin 'YourPassword'`
5. Open:
   - `http://localhost:3000` (or `http://<server-ip>:3000`)

Compose maps host port from `.env` `PORT` to container port `3000`. Inside the container the app always listens on `3000`.

| Variable | Default in Compose | Meaning |
|----------|-------------------|---------|
| `RUN_MIGRATE_ON_START` | `1` | Run `npm run migrate` before start |
| `RUN_SEED_ON_START` | `0` | Run `npm run seed` before start (usually once) |
| `SESSION_SECURE` | `0` | `0` = login works over HTTP; set `1` when TLS terminates in front of the app |

Image uses `npm ci` and `NODE_ENV=production`. Entrypoint: `docker-entrypoint.sh`.

## DB Modes

- Default local: `DB_CLIENT=sqlite` and `SQLITE_PATH=./data/app.db`
- Remote templates:
  - `.env.postgres.example`
  - `.env.mariadb.example`

Current implementation supports SQLite runtime. Remote DB adapter files are planned next.
