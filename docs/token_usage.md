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
| R1 | lead, claude-opus-5-5 | PM, readback + F001 + docs | none available | SHARED / F001 | unknown | unknown | unknown | unavailable | provisional |

## Summaries (rebuilt from records)
| Scope | Recorded total | Coverage |
|---|---|---|
| F001 | unknown | unavailable |
| F002 | 0 recorded so far | partial (implementer pending) |
| F003 | unknown | unavailable |
| SHARED | unknown | unavailable |
| UNALLOCATED | 0 | — |
| **Project** | **unknown** (sum of recorded subagent totals shown once reported) | partial |
