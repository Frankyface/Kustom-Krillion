# Kustom-Krillion — agent instructions

Read `handoff.md`, then its active feature.

**Mode:** confirmed automatic project run (user confirmed 2026-11-04). Scope:
[docs/master_plan.md](docs/master_plan.md). Run checks and repairs yourself; no
routine approval gates. Pushing to `Frankyface/Kustom-Krillion` `main` and
GitHub Pages are in scope.

## What this is
A standalone, static (GitHub Pages, no build) rare-answer party game, ported
from Game-Show-Central `games/krillion` @ 9c9d5ec. The host screen runs the
game; phones join a PeerJS room. Default brand "Deep Cut"; the host can switch
the name and tier names.

## Hard rules
- No build step, no npm deps, no framework. PeerJS 1.5.5 (cdnjs, SRI) is the
  only runtime CDN dependency; Google Fonts allowed.
- `textContent` only — no `innerHTML`, `insertAdjacentHTML`, `outerHTML =`,
  `document.write`, `eval`, `new Function`.
- Pure immutable UMD core (`js/kr-content.js`, `js/kr-select.js`,
  `js/kr-core.js`); DOM, timers and transport live in glue files.
- Host is authoritative; validate every phone message. Everything works with
  no phones (host types answers).
- Files < 800 lines, functions < ~50 lines. Plain-English UI errors.
- One serialisable state object in localStorage.
- Scratch files go in `.scratch/` (git-ignored), never elsewhere.

## Commands
```bash
node --test "tests/**/*.test.mjs"        # all unit tests (Node 21+)
python -m http.server 8620               # serve the repo root
# then open http://localhost:8620/ (game) and /tests/harness.html (loopback)
```

## Links
- Procedures: [docs/runbook.md](docs/runbook.md)
- Agents & routing: [docs/agent_plan.md](docs/agent_plan.md)
- Token accounting: [docs/token_usage.md](docs/token_usage.md) (rules in runbook §Accounting)
- Decisions: [docs/decisions.md](docs/decisions.md)
