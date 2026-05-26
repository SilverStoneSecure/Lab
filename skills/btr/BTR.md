---
name: btr
description: Build, Test, Run skill for the Portable Lab app.
target: local
---

## Purpose
Provide a reusable local skill to verify the development environment, build or prepare the project if needed, start the app, and open the homepage for manual inspection.

## Behavior
- Check runtime tools: `node`, `npm`, `git`.
- Verify required files and the SQLite database path.
- Install dependencies if missing or if `node_modules` is not present.
- Start the app in the foreground or background when needed.
- Confirm the homepage is reachable at `http://localhost:3001`.
- provide an external link for testing 
## Usage
- Run this skill when you want a fast health check before editing or deploying.
- It should not stop or remove local services without explicit permission.

## Quick runnable helper
A small helper script is available at `skills/btr/btr.sh` that runs `npm run check-env`, installs dependencies if missing, checks port availability, and starts the app on `PORT=3001` (if not already running).

## Notes
- This repo is a Node.js app with no separate build step beyond dependency installation.
- The app listens on port `3001` by default.
