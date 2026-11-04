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
| R2 | subagent, sonnet | implementer F002-P1 | task notification 2026-11-04 (subagent_tokens) | F002 | unknown | unknown | 222,731 | complete for that agent (split unknown) | superseded by R4 |
| R4 | subagent, sonnet (resumed, same counter as R2) | implementer F002-P1 + P2 | task notification, cumulative 240,430 | F002 | unknown | unknown | 240,430 | complete for that agent | superseded by R6 |
| R3 | subagent, opus | reviewer, F001 + F002 @ 9c3ec1c | task notification (subagent_tokens) | UNALLOCATED (F001+F002 review, not split) | unknown | unknown | 144,834 | complete for that agent | superseded by R5 |
| R5 | subagent, opus (resumed, same counter as R3) | reviewer, 3 rounds | task notification, cumulative 164,501 | UNALLOCATED | unknown | unknown | 164,501 | complete for that agent | reconciled |
| R6 | subagent, sonnet (resumed, same counter as R2/R4) | implementer F002-P1–P3 | task notification, cumulative 250,889 | F002 | unknown | unknown | 250,889 | complete for that agent | reconciled |
| R7 | subagent, sonnet | implementer A1 (F005, F006, F004 stress) | task notification (subagent_tokens) | UNALLOCATED (F004+F005+F006, not split) | unknown | unknown | 189,104 | complete for that agent | reconciled |
| R8 | subagent, sonnet | implementer A2 (F007, F004 layouts) | task notification (subagent_tokens) | UNALLOCATED (F004+F007, not split) | unknown | unknown | 226,658 | complete for that agent | reconciled |

## Summaries (rebuilt from records)
| Scope | Recorded total | Coverage |
|---|---|---|
| F001 | 0 recorded | lead share unknown; review in UNALLOCATED |
| F002 | 250,889 (R6) | partial (lead share unknown; review in UNALLOCATED) |
| F003 | 0 recorded | lead share unknown |
| SHARED | 0 recorded | lead unknown |
| UNALLOCATED | 580,263 (R5 + R7 + R8) | complete for those agents; round-2 features not split |
| **Project** | **831,152 recorded** + unknown lead usage | partial |
