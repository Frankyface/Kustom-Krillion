# Decisions

- **D1 (2026-11-04) Layout:** the game sits at the repo root (Pages serves `/`),
  shared code in `shared/`. Internal names (`kr-` prefixes, `KrCore`, the
  `GSC*` SDK, `data-gsc-game`, storage keys) are kept to avoid churn and keep
  the code diffable against Game-Show-Central.
- **D2 Original default branding:** default name "Deep Cut", tiers Shallows →
  Abyss. The mechanic is inspired by krillion.io (credited in the README); the
  shipped defaults don't reuse its name or tier names. The host can rename
  anything.
- **D3 Legacy tier ids:** files using prawn/schooler/rare/deepcut/krillion map
  to the new ids, so Game-Show-Central files load unchanged.
- **D4 Tier count is not editable in the UI:** renaming and points only;
  changing the count would orphan answer ratings. 2–6 tiers stay possible via
  JSON.
- **D5 Shared tests:** hub-only tests (virtual peer, registry, shell) not
  imported; bridge, library, icons, room transport and prototype-guard tests
  kept.
