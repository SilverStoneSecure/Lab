---
name: btr
description: Build, Test, Run helper for the Portable Lab app.
target: local
---

## Purpose
Provide a short local skill for validating the Portable Lab app environment, preparing dependencies, launching the app on port `3001`, and confirming the homepage is reachable.

## Behavior
- Verify the runtime tools `node`, `npm`, and `git` are available.
- Run `npm run check-env` by default to confirm repo health.
- Install dependencies when `node_modules` is missing.
- Start the app on `PORT=3001` if it is not already running.
- Confirm the homepage responds at `http://localhost:3001`.
- Document the helper script path and external-access expectations.

## Usage
- Run from the repository root:
  ```bash
  ./skills/btr/btr.sh
  ```
- Skip the environment preflight for a faster launch:
  ```bash
  SKIP_CHECK=1 ./skills/btr/btr.sh
  ```

## Helper script
- `skills/btr/btr.sh` performs the same workflow:
  - runs `npm run check-env` unless `SKIP_CHECK=1`
  - installs `node_modules` if missing
  - checks whether port `3001` is already in use
  - starts the app and writes logs to `/tmp/btr_app.log`

## Notes
- This repo has no separate build phase beyond dependency installation.
- The app listens on port `3001` by default.
- For WAN/external access, route or firewall port `3001/tcp` to this host.
