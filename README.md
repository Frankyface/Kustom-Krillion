# Deep Cut

A party game about giving the rarest answer that is still right. Everyone gets the same prompt —
"Name a chemical element", "Name a dog breed" — and each answer is graded from **Shallows** (the
answer everybody gives) down to **Abyss** (the one nobody else would think of).
The deeper your answers, the deeper you dive. The game's name and the tier names are yours to
change — see [Name and tiers](#name-and-tiers).

Inspired by **Krillion** ([krillion.io](https://krillion.io)), which grades rarity against a global
database of real players' answers. This is an original, standalone adaptation (first built for
[Game Show Central](https://github.com/Frankyface/Game-Show-Central)) and is not affiliated with
Krillion.

## Play

- **Online:** https://frankyface.github.io/Kustom-Krillion/ — open it on the screen you share,
  press **Open room (phones)**, and players open the link or type the room code.
- **Locally:** this is a static site with no build step. From the repo root run
  `python -m http.server 8620` and open http://localhost:8620/. Phones need to reach the same
  address (use your computer's LAN IP), or play host-only by typing answers.
- Rooms use PeerJS's free public broker (loaded from cdnjs only when a room opens), so phones and
  host need an internet connection for rooms; host-only play works offline.

## How rarity works here

A static website can't keep a global answer database, so **every prompt ships with a rated answer
list** written with the question. Each listed answer carries a tier and, optionally, aliases
(other spellings: "Wolfram" for Tungsten, "NYC" for New York):

| Tier (id) | Points (default) | Puffer meter |
|---|---|---|
| Shallows (`shallows`) | 10 | 0 |
| Reef (`reef`) | 30 | 1 |
| Twilight (`twilight`) | 60 | 2 |
| Midnight (`midnight`) | 85 | 3 |
| Abyss (`abyss`) | 100 | 4 |

An answer is normalised (case, spacing, accents, a leading "the/a/an", punctuation, simple plurals)
and matched against the list and its aliases. A match takes the listed tier on the spot. **Anything
not on the list goes to the judge** — the host — who rates it with a tier or rules it **Not valid**
(0 points, shown with a black square). The host can press **Add to this question** so the answer
and its tier are remembered for the rest of the session; the editor's **Import judged answers**
folds those into a file you can download, so a question set gets better every time you play it.

Two players who give the same answer both get its tier. Depth is 10 m per point.

## Modes

**Deep Dive** (default). Everyone answers the same prompt within 30 seconds (they may change their
answer until the clock ends; it closes early once everybody has answered). Answers stay hidden
until the round closes. The host rules the off-list answers, then reveals from the misses through
the shallowest tier down to the deepest, so the rarest land last while the depth markers sink. Seven
prompts; deepest diver wins, ties stay ties.

**Puffer Party.** Players sit in a ring. The holder must give a valid answer that hasn't been used
this round before the clock pops. On-list answers pass at once; the host rules off-list ones live
(a tier passes the puffer, Not valid keeps it with the clock running). Every pass shortens the clock
(12 s down to 3 s). A pop costs the holder a heart (start with 3, at most 4) and starts a new prompt
with the next player. Meter points by tier (first tier 0 up to the last tier 4); 10 meter points buy a heart, up to the maximum. Out at 0 hearts; the last
one floating wins. An optional round cap ends the game on hearts.

## Hosting

- Open the site and press **Open room (phones)**; players open the link
  shown. Or play with no phones at all — add players by name and type their answers (tick **Hide
  what I type** while screen-sharing).
- **Game lobby** (toolbar) returns to setup: **Keep this game** shows a **Resume** button; **Start
  over** clears the game but keeps the players, prompts and settings.
- **Undo** steps back one decision (clock time included). Keys: `C` close the answers, `R` reveal,
  `U` undo.
- The saved game is scoped to its room: when a new room opens, phone players from a saved game
  become host-typed seats so a new phone can't inherit someone's depth.

## Content

`prompts.json` holds 100 prompts across 13 categories, each with 10–25 rated answers covering all
five tiers. `js/data.js` is the same file for offline use. The library (`sets/`) adds **Kids' night**
and **Pop culture** (40 prompts each). Load your own with **Load prompts (.json)** or `?game=URL`.

```json
{
  "title": "Deep Cut — Game Night",
  "settings": { "mode": "deepDive", "promptSeconds": 30, "promptsPerGame": 7,
    "brand": { "name": "Deep Cut", "tagline": "The rarest answer wins." },
    "tiers": [ { "id": "shallows", "name": "Shallows", "points": 10 }, "…" ],
    "puffer": { "hearts": 3, "maxHearts": 4, "startSeconds": 12, "floorSeconds": 3,
                "stepSeconds": 1, "meterForHeart": 10, "roundCap": 0 } },
  "prompts": [ { "text": "Name a chemical element", "category": "Science",
    "answers": [ { "text": "Tungsten", "tier": "midnight", "aliases": ["Wolfram"] } ] } ]
}
```

| Field | Rules |
|---|---|
| `prompts` | at least 40; `text` ≤ 120; `category` ≤ 30 (optional) |
| `prompts[].answers` | 5–60 answers spanning at least 3 tiers; `text` ≤ 40; `tier` is a listed tier id; `aliases` ≤ 8; no two answers (aliases included) may normalise to the same key |
| `settings.brand` | optional; `name` 1–30 characters, `tagline` 0–60 (a missing part falls back to "Deep Cut" / "The rarest answer wins.") |
| `settings.tiers` | optional; 2–6 tiers, unique lower-case ids, unique non-empty names ≤ 24, strictly increasing points |
| `settings.puffer` | optional; hearts ≤ most hearts ≤ 9; shortest clock ≤ starting clock |

**Writing a good list:** rate by how often a room of ordinary players would say it, not by how
clever it is. The first three things everyone says go in the first tier (Shallows by default); real but
specialist answers go in the fourth (Midnight); save the last tier (Abyss) for answers that are
correct and genuinely obscure.

## Name and tiers

On the setup screen, **Name & tiers** (before Start) edits the game's name, its tagline and every
tier's name and points. **Tier names** is a preset picker — **Depth zones** (Shallows · Reef ·
Twilight · Midnight · Abyss) or **Rarity** (Common · Uncommon · Rare · Epic · Legendary); a preset
changes names only, never ids or points. An empty or over-long name, or two tiers with the same
name, shows a message and blocks Start. Edits are saved with the setup, survive a reload and are
kept by **Start over**. Loading a file with different tier ids takes that file's tiers; loading
one with the same ids but different names adopts the file's names unless you edited names here.

In the **Editor**, the **Name & tiers** section sets the same things for the file you are writing;
**Download JSON** writes them to `settings.brand` and `settings.tiers`. The answer table's tier
dropdown shows the current tier names.

**Older files.** Files written for the earlier version of this game use the tier ids `prawn`,
`schooler`, `rare`, `deepcut`, `krillion`. They still load: when a file's tier list is absent or
uses only those ids, they are read as `shallows`, `reef`, `twilight`, `midnight`, `abyss` (in the
settings and on every answer). Files with their own tier ids are left alone.

**Editor:** prompts down the left, the selected prompt's rated-answer table on the right
(answer · aliases · tier), plus the name and tier fields. **Download JSON**, **Use in game**, **Import judged answers**, and
**Download for the library**, which downloads the file and prints the manifest entry to paste into
`sets/index.json` (static hosting can't write files, so you commit both).

## Phones

Phones show the game's name, the prompt, a field and a countdown; "Sent ✓ — you can change it" until the clock ends;
then their own tier, points and depth. In Puffer Party the holder gets the field and the shrinking
clock, everyone else sees whose turn it is and the used answers. A phone never receives another
player's answer before it is revealed, and never the rated list.

## Layout and tests

```
index.html            host + phone page
css/kr.css            host screens        css/kr-phone.css   phone screens
js/kr-content.js      content rules, normalisation, matching (pure)
js/kr-select.js       selectors: groups, review queue, reveal order, depth, phone views (pure)
js/kr-core.js         the reducer; KrCore re-exports the two files above (pure)
js/kr-app.js          host state, persistence, setup, actions
js/kr-view.js         setup / Deep Dive / result rendering
js/kr-party.js        Puffer Party rendering
js/kr-clock.js        reads the core's deadline; reports expiry
js/kr-room.js         GSC.host glue        js/kr-phone.js     phone controller
js/kr-editor.js       editor               js/kr-sound.js     WebAudio cues
shared/               room transport (room-*.js), GSC SDK (bridge.js), library, icons, theme
tests/kr-core.test.mjs   node --test (KR-U1 … KR-U10)   tests/kr-brand.test.mjs (name, tiers, legacy ids)
tests/harness.html       loopback harness with five phones (KR-I1 … KR-I6)
tests/shared/            tests for the shared room, bridge, library and icon code
```

`node --test "tests/**/*.test.mjs"` (Node 21+) runs the unit tests. Serve the repo root
(`python -m http.server 8620`) and open `/tests/harness.html` for the loopback suite.

## Known issues

- Saves live in this browser's localStorage under `kk-*` keys (separate from Game Show Central's,
  which shares the github.io origin).
- Undoing an **Add to this question** removes it from the game in progress, but the answer stays in
  the session's prompt file (and the editor's import list) until you reload the prompts.
- In the editor at narrow window widths (about 800 px), the tier picker in the answer table is
  cut short ("Shallov…"). It is still usable; widen the window to read it in full.
