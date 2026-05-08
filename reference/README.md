# Lab reference snapshot

- `lab-index.html` — copy of your SilverStone `Lab/index.html` at import time, kept so you can diff the live Nunjucks page against the static Lab HTML.
- Canonical structured clone used at runtime lives in [`../src/data/labSeed.mjs`](../src/data/labSeed.mjs) (cards + inventory). Run `npm run seed:lab` to reload that snapshot into SQLite.
