# Session Preferences & Analysis

Generated: 2026-05-25
Last reviewed: 2026-05-26

## Observed Preferences
- Preferred service port: 3001 (requested change from 3000).
- Wants environment checks before changes.
- Always leave a link to running services when setup is complete.
- Prefer command-line over GUI and small copy-paste-friendly commands.
- Confirm success at each step before proceeding.
- Direct, concise answers; minimal explanation unless requested.
- Prefer using the helper script `skills/btr/btr.sh` for startup validation.
- Preserve running services and do not stop the app or Docker without explicit confirmation.
- Confirm homepage availability locally with `curl -I http://localhost:3001` after startup.
- Document daily work in `daily_summary.md` with a new dated section.
- Commit and push session artifact updates to git after review.
- Only expose WAN access after router/firewall port forwarding is configured for `3001/tcp`.

## Related files
- `myPreferences.md` (project root)
- `/home/chad/.vscode-server/data/User/prompts/myPreferences.md` (user prompts store)

## Suggested automations (from session notes)
- `ssh-setup` — automate keypair and `ssh-copy-id`.
- `vscode-remote` — automate Remote-SSH extension install & connect.
- `claude-credentials-transfer` — securely transfer credentials via scp.
- `credential-rotation` — detect leaked tokens and guide rotation.
- `btr` — build/test/run helper to verify env, start the app, and confirm homepage availability.
