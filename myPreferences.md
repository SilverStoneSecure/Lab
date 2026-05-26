---
name: My Preferences
description: Personal setup preferences for the Lab project.
target: vscode
---

 - Always use port `3001` when setting up a service on `silverstone` if possible.
 - Always recheck the environment before making changes.
 - Always leave a link to the running service when the setup is complete.
 - If port `3001` is already in use, report that clearly and do not override it without permission.
 - Prefer the helper script `skills/btr/btr.sh` for environment validation and app startup.
 - Preserve running services and do not shut down the app or Docker without explicit confirmation.
 - Confirm homepage availability locally with `curl -I http://localhost:3001` after startup.
 - Document today's work in `daily_summary.md` with a new dated section and concise session notes.
 - Commit and push session artifact updates to git after completing the review.
 - Only expose WAN access after router/firewall port forwarding is configured for `3001/tcp`.
