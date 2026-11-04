# F003 — Docs, push and Pages

- **ID:** F003 · **Owner:** PM
- **Previous:** staging/s2-branding/feature-F002.md · **Next:** none · **Depends on:** staging/s1-port/feature-F001.md, staging/s2-branding/feature-F002.md
- **Status:** verified done (PM accepted 2026-11-04)
- **Spec:** ready, rev 1

## Goal
Final README, push `main` to github.com/Frankyface/Kustom-Krillion, enable
GitHub Pages from `main` / root, confirm the live URL loads and a room link
resolves.

## Acceptance
1. `gh api repos/Frankyface/Kustom-Krillion/pages` shows the site built.
2. The live URL returns the game page (HTTP 200, correct title).
3. README matches the delivered behaviour.

## Evidence (2026-11-04)
- `git push -u origin main`: new branch main created on GitHub.
- `POST /repos/Frankyface/Kustom-Krillion/pages` (main, /); latest build
  status `built`.
- `curl https://frankyface.github.io/Kustom-Krillion/`: HTTP 200,
  `<title>Deep Cut</title>`.
- Live browser: opened room DDA9 from the deployed page; a second tab opened
  `…/?room=DDA9`, joined as "Dee", and the host roster listed "Dee". No console
  errors.

## Review
Delivery-only change (README, docs) after the approved code at 1350509. The
README was checked against the delivered behaviour by the PM (self-review of
docs, disclosed); no code changed after the independent review.

## Token usage
Lead share unknown (ledger R1).
