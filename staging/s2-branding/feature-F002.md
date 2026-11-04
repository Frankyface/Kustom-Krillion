# F002 — Switchable name & tiers

- **ID:** F002 · **Owner:** Sonnet implementer (package F002-P1), PM integrates
- **Previous:** staging/s1-port/feature-F001.md · **Next:** staging/s3-delivery/feature-F003.md · **Depends on:** staging/s1-port/feature-F001.md
- **Status:** verified done (PM accepted 2026-11-04 at 1350509)
- **Spec:** ready, rev 1, PM decision 2026-11-04

## Goal and boundaries
- `settings.brand = { name ≤ 30, tagline ≤ 60 }`, default "Deep Cut" /
  "The rarest answer wins.".
- Default tier ids/names: shallows Shallows, reef Reef, twilight Twilight,
  midnight Midnight, abyss Abyss (points 10/30/60/85/100).
- Legacy ids prawn/schooler/rare/deepcut/krillion map to those ids.
- Setup "Name & tiers": name, tagline, tier names, presets (Depth zones,
  Rarity); validation messages block Start; persisted.
- Editor section for the same; Download JSON exports brand and tiers.
- Brand shown in title, toolbar, hero, splash, phones, result, messages.
- Excluded: adding/removing tiers in the UI (D4).

## Acceptance
1. Unit tests pass, including new brand/legacy/custom-id tests.
2. No user-facing "Krillion" left except the README credit.
3. Browser: rename name + a tier, reload → kept; phone header shows the name;
   preset switch; invalid name blocks Start with a message; editor export
   contains `settings.brand`.

## Evidence
- Implementer (Sonnet) report: unit tests 138/138 (11 new in
  `tests/kr-brand.test.mjs`); no innerHTML-family hits; largest file 673 lines.
- PM, 9c3ec1c: 138/138 rerun after the storage-key rename.
- PM browser check: renamed the game to "Kustom Krillion" and tier 5 to "One
  in a Million"; the preset switched to Custom; toolbar, hero and `<title>`
  updated; both edits survived a reload; the judge's buttons and reveal used
  the custom tier names; the phone header showed "Kustom Krillion" after
  joining.
- Observed for follow-up: the editor's "Name & tiers" starts from the file
  ("Deep Cut") rather than the host's setup edits; the answer-table tier
  dropdown truncates ("Shallov").

## Review
State: approved (independent: opus subagent, fresh context, authored no code).
Review log:
1. 9c3ec1c — changes required: B1 editor naming ignored after setup edits;
   N1 stale name error; N2 setup names not exported; N3 hub path in library
   message; suggestions S1–S3. Harness 65/65, unit 138/138.
2. fe8cdcc — approved; new non-blocking R1 (stale save note), R2 (note
   wording with different tier ids), suggestion S-a. Unit 141/141.
3. 1350509 — approved, no new findings. Unit 141/141.
PM acceptance: 2026-11-04, checks passing, blocking findings resolved.

## Token usage
Recorded when the implementer reports.
