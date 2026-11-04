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
- **D6 Naming contract (rev 2, after review B1):** the setup's naming (brand +
  tier names) is the single source of truth. The editor opens seeded with it;
  the editor's "Use in game" writes its naming back to setup. A loaded file or
  set keeps the host's names once the host has edited them, with an on-screen
  note naming what the file calls itself; otherwise the file's naming is used.
- **D7 Storage keys:** `kk-*` instead of `gsc-kr-*`, because GitHub Pages
  serves Game-Show-Central from the same origin. Old GSC saves are
  intentionally not migrated.
- **D8 Tier-name strictness:** tier names must be unique case-insensitively. A
  rare GSC file whose names differ only by case is refused with a message.
- **D9 Diver icon (round 2):** `settings.brand.icon` is a validated image data
  URL (png/jpeg/webp/gif, ≤ 60 000 chars in files; uploads capped at 22 KB / 30 000 chars so phones always get it), rendered only through `<img src>`.
  Once the host uses the icon picker, files and the editor don't replace it.
  Phones get it once per connection via `{t:"icon"}` when ≤ 30 000 chars
  (transport cap 32 KB); otherwise phones show the default krill. A change
  applies from the next game. GIFs become a still frame.
- **D10 Puffer standings:** ranked by hearts, then meter; eliminated players
  below everyone floating, by order out (also used on the result screen).
- **D5 Shared tests:** hub-only tests (virtual peer, registry, shell) not
  imported; bridge, library, icons, room transport and prototype-guard tests
  kept.
