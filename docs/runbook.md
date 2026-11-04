# Runbook

## Automatic loop
```text
WHILE project acceptance (docs/master_plan.md) is not satisfied:
    reconcile handoff.md with git status and running agents
    if every feature is verified and PM-accepted: final integration checks,
        project-level independent review, push, finish
    pick the active or next eligible feature (staging/*/feature-*.md)
    PM marks the package spec ready and dispatches the implementer
    implementer runs checks and fixes ordinary failures
    escalate after two distinct failed approaches (opus subagent owns the fix)
    integrate; run checks on the integrated state
    independent review (author ≠ reviewer); route findings; re-review
    PM accepts only with passing checks and an approved review
    record evidence, decisions, usage; write handoff.md last; commit checkpoint
```
Retries: never rerun an unchanged failure; after recovery, at most three more
approaches without new evidence, then record a blocker and do independent work.

## PM-led orchestration (summary of the confirmed prompt §4a)
- Strongest model for PM and hard recovery; efficient model for implementation;
  strong independent reviewer. Record actual models in agent_plan.md.
- Packages state outcome, exclusions, files owned, contracts, acceptance and
  checks. Workers return changed paths, results, open issues; they cannot
  weaken criteria or change shared contracts.
- One writer per file set. PM alone owns handoff, agent plan, statuses, ledger.
- A reviewer that authors a fix cannot certify it.

## Checks
- Unit: `node --test "tests/**/*.test.mjs"`
- Loopback: serve the root, open `tests/harness.html`, run all (KR-I1…I6).
- Browser: open `/`; host-only Deep Dive, Puffer round, editor, library; phone
  flow via a second tab on the room link.
- Hygiene: grep for innerHTML-family APIs; `wc -l js/*.js` < 800.

## Sync and resume
Use `new_session_prompt.md`. Commit scoped checkpoints on `main`; push after
verified checkpoints and at delivery.

## Accounting
Single ledger `docs/token_usage.md`. Record only real telemetry; unknown is not
zero; never add a child agent's usage on top of a parent total that includes
it; project total = feature totals + SHARED + UNALLOCATED.
