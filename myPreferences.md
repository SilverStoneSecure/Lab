---
name: My Preferences
description: Personal setup preferences for the Lab project.
target: vscode
---

 
 - Always recheck the environment before making changes.
 - Always leave a link to the running service when the setup is complete.
 
 - Prefer the helper script `skills/btr/btr.sh` for environment validation and app startup.
 - Preserve running services and do not shut down the app or Docker without explicit confirmation.
 - Confirm homepage availability locally with `curl -I http://localhost:3001` after startup.
 - Document today's work in `daily_summary.md` with a new dated section and concise session notes.
 - Commit and push session artifact updates to git after completing the review.
 - Only expose WAN access after router/firewall port forwarding is configured for `3001/tcp`.
