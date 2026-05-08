---
name: pushtogit
description: Verifies git remote state and pushes local branches safely before repository migration. Use when the user asks to push to GitHub, verify branch freshness, or prepare to delete and recreate a local clone.
disable-model-invocation: true
---

# Push To Git

## Goal
Ensure latest local commits are present on the intended GitHub branch (`main` or `master`) before local cleanup or migration.

## Workflow

1. Check local state:
   - `git status -sb`
   - `git branch -vv`
   - `git log --oneline -5`

2. Check remote setup:
   - `git remote -v`
   - `git ls-remote --heads origin`

3. Push current branch:
   - `git push -u origin master`

4. If GitHub UI appears stale:
   - Compare `main` and `master` heads via `git ls-remote --heads origin`.
   - Attempt non-destructive sync: `git push origin master:main`

5. If rejected (non-fast-forward):
   - `git fetch origin`
   - `git log --oneline --left-right --graph origin/main...master`
   - Ask for explicit approval before force push.
   - If approved: `git push --force-with-lease origin master:main`

6. Final verification:
   - `git ls-remote --heads origin`
   - Confirm expected commit hash exists on target branch.

## Safety Rules
- Never force-push without explicit user approval.
- Prefer `--force-with-lease` over `--force`.
- Call out `main` vs `master` mismatch before destructive actions.
