# CLAUDE.md

Context for Claude Code when working in this repo. Edit freely — add what saves you from re-explaining things, delete what gets stale.

---

## Project Overview

> *What is this project, who is it for, and what does it do at a high level?*

**Example:** Portable Node.js + Fastify homelab dashboard template backed by SQLite. Provides a login-protected admin UI to manage cards (LAN/WAN services, devices, contacts, media) and inventory rows. Designed to run locally or in Docker.

---

## Tech Stack

> *Languages, frameworks, libraries, and runtimes.*

- **Runtime:** Node.js (ES modules — `"type": "module"`)
- **Server:** Fastify 5.x
- **Templating:** Nunjucks via `@fastify/view`
- **DB:** SQLite via `better-sqlite3` (Postgres/MariaDB planned)
- **Auth:** Argon2 password hashing, signed cookie sessions via `@fastify/cookie`
- **Container:** Docker / docker-compose

---

## Repo Layout

> *Where the important code lives. Skip generated/vendor dirs.*

```
src/            # app source (server, routes, views, public assets)
scripts/        # migrate, seed, admin tooling, docker helpers
data/           # runtime SQLite DB (gitignored)
reference/      # frozen Lab HTML for visual diffing
docker/         # Dockerfile, docker-compose.yml, docker-entrypoint.sh
env/            # .env.example, .env.postgres.example, .env.mariadb.example
```

---

## Common Commands

> *Day-to-day npm scripts and shell helpers.*

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start with auto-reload |
| `npm start` | Start without watch |
| `npm run migrate` | Apply schema migrations |
| `npm run seed` | Seed empty DB |
| `npm run seed:lab` | Reset cards + inventory to Lab snapshot (users untouched) |
| `npm run create-admin -- <user> <pass>` | Create admin user |
| `npm run reset-admin-password -- <user> <pass>` | Reset admin password |
| `npm run check-env` | Pre-build environment check |
| `npm run docker:build` / `docker:start` / `docker:stop` / `docker:status` | Docker lifecycle |

---

## Coding Conventions

> *Style choices and patterns to follow. Add ones that come up repeatedly.*

**Example:**
- ES modules only (no `require`)
- Async/await over raw promises
- Route handlers go in `src/routes/`, render via Nunjucks templates in `src/views/`
- Static assets in `src/public/`
- Card tag classes: `.tag.lan`, `.tag.wan`, `.tag.service`, `.tag.device`, `.tag.folder`, `.tag.template`

---

## Architecture Notes

> *Non-obvious design decisions, data flow, or invariants worth knowing.*

**Examples to fill in:**
- All dashboard sections render from `card_containers` rows ordered by `display_order`.
- Each container has a `layout`: `tiles`, `rail`, or `gallery`.
- `Add Card` does not POST immediately — it opens an inline draft form; `Save new card` commits.
- Site copy is edited inline on the dashboard, not in a separate editor.

---

## Environment

> *Env vars, secrets, and how to configure for local vs. prod.*

- Copy `env/.env.example` → `.env` (at repo root) for local dev
- `DB_CLIENT=sqlite` + `SQLITE_PATH=./data/app.db` for default
- `SESSION_SECURE=0` for HTTP, `1` when behind TLS
- `ALLOW_DEFAULT_ADMIN=1` enables the default `admin / Admin123!pass` seed in production (dev does this automatically)

---

## Testing

> *How to run tests, what's covered, what isn't.*

**Example (fill in when you add tests):**
- Test runner: *(none yet)*
- Manual smoke test: `npm run dev`, log in, edit a card, reload, confirm persistence

---

## Deployment

> *How this gets shipped — Docker, a VPS, a PaaS, etc.*

- `docker compose up --build` for local container
- App listens on container port `3000`; host port mapped via `.env` `PORT`
- Image uses `npm ci` and `NODE_ENV=production`

---

## Known Quirks / Gotchas

> *Things that have bitten you before so they don't bite again.*

**Examples to fill in:**
- `seed:lab` wipes cards + inventory but never users — safe to re-run
- Passwords with `!` or `$` need single quotes in npm script args
- `docker/docker-entrypoint.sh` must remain executable (`chmod +x`)

---

## Useful Prompts

> *Stock prompts you reuse. Helps Claude give consistent answers.*

**Examples:**
- "Add a new card layout type called `<name>` — wire it through `card_containers.layout`, the admin dropdown, the renderer, and CSS."
- "Add a migration that …" *(Claude should follow the pattern in `scripts/migrate.js`.)*
- "Run `npm run seed:lab`, then explain any rows that look off."

---

## References

> *Links to docs, dashboards, issues, related repos.*

- Repo: https://github.com/SilverStoneSecure/Lab
- Fastify docs: https://fastify.dev/docs/latest/
- better-sqlite3: https://github.com/WiseLibs/better-sqlite3
- Nunjucks: https://mozilla.github.io/nunjucks/

---

## Design Reference

> *Visual/UX inspiration to pull from when iterating the UI.*

**`reference/silverstonesecure-landing-ref.html`** — Chad's static landing page artifact.
Features Chad liked (pick from when styling):

- **Glow system** — `--g1/g2/g3-green/cyan/amber` CSS vars: inner blur + outer bloom at a fixed 2.6× ratio. More refined than the current card shadows.
- **Per-category pop engine** — cards set `--pop-scale`, `--pop-lift`, `--pop-glow` as CSS custom properties; a single `:hover` rule inherits all three. WAN pops more than LAN.
- **Animated pulse dots** — `service-dot` / `status-dot` with a 2.4s ease-in-out infinite pulse (opacity 1 → 0.45). Same dot reused in the status bar and on card titles.
- **Node info grid** — 3-column `node-card` tiles with `node-row` key/value rows and a colored title border per category (green/cyan/amber). Good pattern for a hardware/stack summary block.
- **Link cards** — `link-card` with a left-to-right `linear-gradient` overlay that fades in on hover. Cleaner than plain border-color hover.
- **Section labels** — `::before { content: '// ' }` in CSS, no inline markup needed.

---

## TODO / Ideas

> *Running list of "things I'd like Claude's help with later."*

- [ ] Remote DB adapter (Postgres, MariaDB)
- [ ] Test suite
- [ ] *(add your own)*
