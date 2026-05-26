---
name: session-shutdown
description: Draft skill to safely shut down or pause a work session and persist session artifacts for later analysis.
target: local
---

## Purpose
Collect recent session notes, identify potential automations/skills, persist analysis and preferences to the server, and optionally stop app-level services gracefully.

## Behavior (draft)
- Inspect `daily_summary/` files for recent session notes and suggested skills.
- Create or update `dailySummary.md` in the project root with a concise project overview and date header.
- Create `session_preferences.md` summarizing observed user preferences.
- Save findings to the repository and commit changes to git.
- Optionally: run safe shutdown procedures (stop app, stop docker-compose) only after explicit confirmation.

## Safety
- Requires explicit confirmation before stopping services or shutting down the host.

## Next steps
- Implement an executable script to perform the app stop and log collection.
- Add automated tests and a small CLI wrapper to preview actions before applying them.
