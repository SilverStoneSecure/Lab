## Plan Review Findings

- **High — path/workspace mismatch risk:** The plan references absolute paths like [`/home/chad/ProjectsLocal/Lab/index.html`](/home/chad/ProjectsLocal/Lab/index.html), but your active workspace has been switching to “none.” If we start build without a confirmed target repo path, scaffolding could land in the wrong place.
- **High — auth/session persistence detail missing:** The plan says “session cookies,” but not whether session state is purely cookie-encrypted or DB-backed. For admin tooling, we should explicitly choose one (recommended: signed/encrypted cookie session, no DB session table unless revocation/audit is needed).
- **Medium — migration strategy underdefined:** It lists migrations/seeds but does not lock the migration tool and workflow (`npm run migrate`, idempotency, startup behavior in Docker).
- **Medium — remote DB templates need explicit non-goal boundary:** Current wording suggests full parity across SQLite/Postgres/MariaDB. Without boundary, implementation can sprawl. Should define: “SQLite is primary; Postgres/MariaDB templates are connection + schema-compatible examples, not full CI matrix in v1.”
- **Medium — bulk edit UX conflict handling not specified:** “Edit all rows at once” needs save semantics (save per-row vs save-all transaction vs optimistic updates). This affects route design and error handling.
- **Low — security hardening checklist omitted:** Missing concrete items like CSRF protection for form writes, secure cookie flags, rate-limit on login, and default admin bootstrap flow safeguards.

## Open Questions / Assumptions

- Assumption: we build in a new project folder and pull Lab style from `/home/chad/ProjectsLocal/Lab`.
- Assumption: SQLite is authoritative local mode, remote DB templates are optional examples.
- Assumption: admin edits use HTMX partial submits with per-row save (simpler v1) unless you want true “Save All” transactional behavior.

## Change Summary (What to tighten before build)

- Add a **“Prerequisites & Target Path”** section to the plan (first step: confirm exact project directory).
- Add a **“Session/Auth Decisions”** subsection (cookie strategy, CSRF, login rate limit, admin bootstrap).
- Add a **“Migration/Seed Contract”** subsection (tool choice, commands, when migrations run in Docker).
- Add a **“Bulk Edit Semantics”** subsection (per-row save vs save-all, validation, rollback behavior).
- Add a **“Scope Guardrails”** note: SQLite fully supported; remote DB templates are starter configs for portability.

If you want, I can update the plan file with these exact tightenings next, then you can greenlight implementation.

## Tightened Plan (Proposed Defaults)

### Prerequisites And Target Path
- Target project root: `/home/chad/ProjectsLocal/TemplateNodeJS`.
- Style/content source: `/home/chad/ProjectsLocal/Lab/index.html` and `/home/chad/ProjectsLocal/Lab/styles.css`.
- Build order: container/runtime first, then DB/auth, then editable admin UX, then deep comments pass.

### Session/Auth Decisions
- Session mode: encrypted/signed cookie session (no DB session table in v1).
- Password security: `argon2` hashing with configurable cost.
- Roles: `admin` and `viewer`; only `admin` can hit write routes.
- Baseline security controls:
  - CSRF token checks for write form submissions.
  - Secure cookie defaults (`HttpOnly`, `SameSite=Lax`, `Secure` in HTTPS).
  - Login rate limit on auth endpoints.
  - First admin bootstrap script (`create-admin`) with explicit one-time flow.

### Migration/Seed Contract
- Migration command: `npm run migrate` (idempotent, safe to rerun).
- Seed command: `npm run seed` (insert starter Lab-like cards/inventory if missing).
- Docker startup contract:
  - App starts only after successful migrations.
  - Seed runs manually (or optional first-run flag), not every boot.
- Backup contract:
  - SQLite backup/restore scripts target `./data/app.db`.

### Bulk Edit Semantics
- Inventory edit mode: one **Expand Edit** toggle reveals all editable rows.
- Save behavior (v1 default): per-row save via HTMX for simpler validation and error recovery.
- Optional later enhancement: `Save All` batch endpoint with transactional rollback.
- Validation behavior:
  - Required fields and format checks run server-side.
  - Row-level error messages render inline without full page reload.

### Scope Guardrails
- Full support target in v1: SQLite local mode.
- Remote DB templates (Postgres/MariaDB) are starter connection templates and compatible schema examples.
- Non-goal in v1: full multi-DB parity testing matrix/CI across every adapter.
