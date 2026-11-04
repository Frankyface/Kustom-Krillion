# Stage S4 — Round 2

Features (default order):
1. F004 40 players (caps 40; layouts; 40-phone stress test) — A2 layouts, A1 stress test
2. F005 Phone score and place between rounds — A1
3. F006 Phone rated list after reveal; phone page scrolls — A1
4. F007 Mobile hosting (responsive host screens) — A2
5. F008 Sinking animation + host-uploaded icon — design implementer (after A1/A2)
6. F009 Charm pass — design implementer (after A1/A2)

Previous: staging/s3-delivery/feature-F003.md. Packages A1 and A2 run in
parallel on disjoint files; F008/F009 follow once both integrate.

Stage acceptance: tests + harness + new 40-phone stress page pass; every host
screen has no horizontal scroll at 320–430 px; 40-player screens readable at
1280×720; phones show place/total and the rated list only after reveal; the
uploaded icon sinks with each player's depth; independent review approved;
pushed and live.

Status: all six verified done (PM accepted 2026-11-04 at 78c517b + stress fix).

## Evidence
- Unit 157/157; harness 66/66 and stress 36/36 at 40 phones (1440×900), stress
  also 36/36 at 3 and 4 phones.
- 40 phones: largest phone message 1,894 bytes; phones update ≤ 201 ms per
  host action; no answer or rated-list leak before reveal.
- Reviewer's scripted full games: 0 spilling cards and no page scroll at
  1280×720 / 1280×640 for 3, 10, 40 players; no horizontal scroll at 320, 375,
  768; ruler labels never overlap; icon upload, validation (svg, javascript:,
  injection, oversize refused) and phone delivery verified.

## Review log (independent opus reviewer; implementers: sonnet A1, A2; opus B)
1. e8e9a75 — changes required: B1 reveal cards overflowed rows; N1 ruler
   overlap + short reef; N2 popped seat label; N3 icon too big for phones;
   N4 mid-game icon message; S1 result list; S2 stress N.
2. 78c517b — approved; one test-only gap (stress N = 4 tie expectation), fixed
   by the PM in tests/stress.html and re-run (36/36 at N = 4 and 40). PM-authored
   test fix, self-checked.
