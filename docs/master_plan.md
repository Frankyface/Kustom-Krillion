# Master plan — Kustom-Krillion

## Confirmed specification (2026-11-04)
User's words: "a full proper standalone version of this game on that repo … the
same features (rooms, custom questions, and stuff from Game Show Central). Let
me be able to switch names and tiers. Push to Kustom Krillion."

Source: Game-Show-Central `games/krillion` @ 9c9d5ec (spec there:
`docs/20-krillion-spec.md`). Everything it does must work standalone:

- **Deep Dive** mode (everyone answers at once, rated-list matching, judge's
  review, Add to this question, reveal common → rare, depth board, result).
- **Puffer Party** mode (pass the puffer, shrinking clock, hearts, meter,
  elimination, last one floating, optional round cap).
- **Rooms:** host opens a PeerJS room; phones join by link/code; reconnect and
  reload survive; host-typed seats when no phones.
- **Custom questions:** prompt editor, Download JSON / Use in game, Import
  judged answers, load a file, `?game=URL`, `data.js` offline fallback,
  library sets (Kids' night, Pop culture).
- Undo, game lobby (Keep / Start over), sounds, keyboard shortcuts, saves.
- **New:** host can switch the game name/tagline and every tier name
  (presets + free text) on the setup screen and in the editor; saved and
  exported. Default brand is original ("Deep Cut", depth-zone tiers); old
  Game-Show-Central files (tier ids prawn…krillion) still load.
- **Delivery:** pushed to github.com/Frankyface/Kustom-Krillion `main`,
  GitHub Pages serving the repo root.

Exclusions: global answer database, accounts, daily puzzle, reverse mode,
adding/removing tiers from the UI (count stays as in the file; 2–6 via JSON).

## Architecture
Static site at repo root. `index.html` = host + phone page. `shared/` = the
GSC room transport (`room-*.js`), `bridge.js` SDK (standalone mode),
`library.js`, `icons.js`, theme CSS. Pure core in
`js/kr-content|select|core.js`, tested with `node:test`; glue in
`js/kr-app|view|party|room|phone|editor|clock|sound.js`.

## Stages
| Stage | Features | Overview |
|---|---|---|
| S1 Port | F001 standalone port | [staging/s1-port/overview.md](../staging/s1-port/overview.md) |
| S2 Branding | F002 switchable name & tiers | [staging/s2-branding/overview.md](../staging/s2-branding/overview.md) |
| S3 Delivery | F003 docs, push, Pages | [staging/s3-delivery/overview.md](../staging/s3-delivery/overview.md) |

## Project acceptance
1. All unit tests pass; loopback harness passes.
2. Real-browser play: a full Deep Dive game (host-typed and phone players),
   a Puffer round with a pop, editor round-trip, library set load, reload
   mid-prompt keeps state.
3. Name/tier switching works and persists; the default UI shows no "Krillion".
4. The Pages URL loads the game; a phone link resolves.
5. Independent review approved.

## Agent Team & Delivery Strategy
See [agent_plan.md](agent_plan.md).

## Token Usage — Entire Project
See [token_usage.md](token_usage.md).
