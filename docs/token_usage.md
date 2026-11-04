# Token usage ledger

Tracking started 2026-11-04 (this session). The lead session has no per-request
token telemetry available: the app reports plan-quota percentages and context
fill only, and those are not token totals. Lead-session usage is therefore
**unknown** (not zero). Subagent totals are recorded when the completion notice
reports them; those come from separate subagent contexts and are not part of
any lead figure, so they are not double-counted.

## Records
| ID | Session / scope | Role / package | Source | Allocation | Input | Output | Recorded total | Coverage | State |
|---|---|---|---|---|---|---|---|---|---|
| R1 | lead, claude-opus-5-5 | PM, readback + F001 + docs + integration | none available | SHARED / F001 / F002 | unknown | unknown | unknown | unavailable | provisional |
| R2 | subagent, sonnet | implementer F002-P1 | task notification 2026-11-04 (subagent_tokens) | F002 | unknown | unknown | 222,731 | complete for that agent (split unknown) | reconciled |

| R3 | subagent, opus | reviewer, F001 + F002 @ 9c3ec1c | task notification (subagent_tokens) | UNALLOCATED (F001+F002 review, not split) | unknown | unknown | 144,834 | complete for that agent | reconciled |

## Summaries (rebuilt from records)
| Scope | Recorded total | Coverage |
|---|---|---|
| F001 | 0 recorded | lead share unknown; review in UNALLOCATED |
| F002 | 222,731 (R2 only; P2 fixes pending) | partial (lead share unknown; review in UNALLOCATED) |
| F003 | 0 recorded | lead share unknown |
| SHARED | 0 recorded | lead unknown |
| UNALLOCATED | 144,834 | complete for R3 |
| **Project** | **367,565 recorded** + unknown lead usage | partial |
