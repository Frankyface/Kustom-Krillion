# Agent plan

## Capabilities (observed 2026-11-04)
Claude Code desktop app; Agent tool with a per-agent `model` override (opus /
sonnet / haiku / fable). Lead session: claude-opus-5-5. Concurrency: one
implementer at a time, plus PM doc work on disjoint files.

## Roles
| Role | Model | Notes |
|---|---|---|
| PM / architect | claude-opus-5-5 (lead) | owns head, plan, integration, ledger, commits/push |
| Implementer | sonnet subagent (Sonnet 5.5) | F002-P1 |
| Escalation | opus subagent | only after two failed repair approaches |
| Independent reviewer | opus subagent, fresh context, read-only + checks | reviews the integrated state |

F001 (mechanical port: copy + path fixes) was done by the PM directly because
it was a handful of commands. It is PM-authored, so the independent reviewer
covers it like any other package.

## Packages
| ID | Feature | Owner | Files | Depends on |
|---|---|---|---|---|
| F001-P1 | port | PM | imported files, tests/shared | — |
| F002-P1 | name & tiers | Sonnet implementer | js/*, index.html, css/*, prompts.json, data.js, sets/, tests/, README.md | F001-P1 |
| F003-P1 | delivery | PM | docs, README polish, push, Pages | F001, F002 |

Integration order: F001 → F002 → browser verification → review → F003.

## Review standards
Behaviour matches `docs/master_plan.md`; house rules in `AGENTS.md`; no
innerHTML-family APIs; phone messages validated; no phone receives other
players' answers or the rated list before reveal; legacy files load; no
regression in the 127 baseline tests; plain-English errors; 320px phone layout.

## Routing lessons
(none yet)
