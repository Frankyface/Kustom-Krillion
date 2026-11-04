# F001 — Standalone port

- **ID:** F001 · **Owner:** PM (claude-opus-5-5)
- **Previous:** none · **Next:** staging/s2-branding/feature-F002.md · **Depends on:** none
- **Status:** awaiting verification
- **Spec:** ready, rev 1, PM decision 2026-11-04

## Goal and boundaries
Copy Game-Show-Central `games/krillion` @ 9c9d5ec to the repo root with the
shared files it loads (`room-protocol/net/host/player.js`, `bridge.js`,
`library.js`, `icons.js`, `theme.css`, `theme-components.css`), fix paths, and
carry over the shared unit tests that cover those files. No behaviour change.
Hub-only pieces (virtual peer, registry, lobby shell) are excluded.

## Package F001-P1
Files: everything imported; `tests/shared/*`. Contract: unchanged game
behaviour; `bridge.js` runs in standalone mode (no `?embed`).

## Acceptance
1. `node --test "tests/**/*.test.mjs"` passes.
2. `tests/harness.html` loopback suite passes when served from the root.
3. Opening `/` standalone: setup, host-only Deep Dive, Puffer, room open with a
   phone tab joining, editor, library load, reload mid-prompt.

## Evidence
- 2026-11-04, b90cae2: unit tests 127/127 pass.
- Harness and browser checks: pending (run after F002 integrates, on the
  integrated state).

## Review
State: pending.

## Token usage
See ledger R1 (unknown).
