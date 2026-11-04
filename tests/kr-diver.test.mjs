// Deep Cut — tests for the host's diver icon (content validation) and the pure flavour helpers.
// Run from the repo root:  node --test

import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const K = require("../js/kr-core.js");
const F = require("../js/kr-flavour.js");

const PNG = `data:image/png;base64,${"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="}`;

function file(brand) {
  const prompts = Array.from({ length: 40 }, (_, i) => ({
    text: `Name thing ${i}`,
    answers: ["shallows", "reef", "twilight", "midnight", "abyss"].map((tier, n) => ({ text: `A${i}x${n}`, tier })),
  }));
  return { title: "T", settings: { brand }, prompts };
}

test("IC-1 cleanIcon accepts small base64 png / jpeg / webp / gif data URLs only", () => {
  assert.equal(K.cleanIcon(PNG), PNG);
  ["jpeg", "webp", "gif"].forEach((t) => {
    const url = `data:image/${t};base64,${"QUJD".repeat(10)}`;
    assert.equal(K.cleanIcon(url), url, t);
  });
  [
    "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4AAAAAAAAAAAAAAAAAAAAA",   // SVG can carry script: refused
    "data:text/html;base64,PGgxPmhpPC9oMT4AAAAAAAAAAAAAAAAAAAAAAAAA",
    "javascript:alert(1)//data:image/png;base64,AAAA",
    "https://example.com/icon.png",
    `data:image/png,${"A".repeat(40)}`,                                    // not base64
    `data:image/png;base64,${"A".repeat(40)}"><script>`,                  // markup smuggled after the data
    `data:image/PNG;base64,${"A".repeat(40)}`,
    `data:image/png;base64,${"A".repeat(60000)}`,                          // over 60 000 characters
    "", null, undefined, 42, {}, ["data:image/png;base64,AAAA"],
  ].forEach((bad) => assert.equal(K.cleanIcon(bad), "", String(bad).slice(0, 40)));
});

test("IC-2 the icon rides in settings.brand; a bad one is dropped (never thrown) and warned about", () => {
  assert.equal(K.normalizeSettings({ brand: { name: "Reef Night", icon: PNG } }).brand.icon, PNG);
  const bad = K.normalizeSettings({ brand: { name: "Reef Night", icon: "data:image/svg+xml;base64,AAAA" } });
  assert.deepEqual(bad.brand, { name: "Reef Night", tagline: "The rarest answer wins." });
  assert.doesNotThrow(() => K.validateGame(file({ name: "Reef Night", icon: "nonsense" })));
  assert.match(K.iconProblem(file({ name: "Reef Night", icon: "nonsense" })), /left out/);
  assert.equal(K.iconProblem(file({ name: "Reef Night", icon: PNG })), "");
  assert.equal(K.iconProblem(file({ name: "Reef Night" })), "");
  assert.ok(K.warningsFor(file({ name: "Reef Night", icon: 7 })).some((w) => /diver icon/.test(w)));
  assert.equal(K.normalizeGame(file({ name: "Reef Night", icon: PNG })).settings.brand.icon, PNG);
});

test("IC-3 brandOf carries the icon into a running game; withIcon never mutates", () => {
  const s = K.createState(file({ name: "Reef Night", icon: PNG }), { players: [{ pid: "p1", name: "A" }, { pid: "p2", name: "B" }] });
  assert.equal(K.brandOf(s).icon, PNG);
  assert.equal(K.brandOfSettings({ brand: { name: "X", icon: "bad" } }).icon, undefined);
  const before = { name: "X", tagline: "" };
  const after = K.withIcon(before, PNG);
  assert.deepEqual(before, { name: "X", tagline: "" });
  assert.equal(after.icon, PNG);
  assert.equal(K.withIcon(before, "").icon, undefined);
  // The phone view never carries the icon (it is sent once per connection, apart from views).
  assert.equal(JSON.stringify(K.phoneView(s, "p1", 0)).indexOf("data:image"), -1);
});

test("FL-1 zones follow the real ocean and the trenches go on for ever", () => {
  assert.equal(F.zoneFor(0).id, "sunlight");
  assert.equal(F.zoneFor(199).id, "sunlight");
  assert.equal(F.zoneFor(200).id, "twilight");
  assert.equal(F.zoneFor(1000).id, "midnight");
  assert.equal(F.zoneFor(4500).id, "abyss");
  assert.equal(F.zoneFor(50000).id, "trenches");
  assert.equal(F.zoneFor(-5).id, "sunlight");
  assert.equal(F.zoneFor(NaN).id, "sunlight");
});

test("FL-2 zone bands and milestones are clipped to the reef's scale", () => {
  assert.deepEqual(F.zoneBands(500).map((b) => [b.id, b.start, b.size]), [["sunlight", 0, 40], ["twilight", 40, 60]]);
  const deep = F.zoneBands(7000);
  assert.equal(deep.length, 5);
  assert.equal(Math.round(deep.reduce((n, b) => n + b.size, 0)), 100);
  assert.deepEqual(F.milestones(500).map((m) => m.label), ["200 m · sunlight ends"]);
  assert.deepEqual(F.milestones(4000).map((m) => m.metres), [200, 1000]);
  assert.equal(F.milestones(7000)[1].label, "1,000 m · midnight");
});

test("FL-3 the phone gauge gives each zone an equal share and never leaves 0–100", () => {
  assert.equal(F.gaugePosition(0), 0);
  assert.equal(F.gaugePosition(200), 20);
  assert.equal(F.gaugePosition(600), 30);
  assert.equal(F.gaugePosition(1000), 40);
  assert.equal(F.gaugePosition(999999), 100);
  assert.equal(F.gaugePosition("deep"), 0);
});

test("FL-4 lines: moods by tier position, a seed picks the same line every time", () => {
  assert.equal(F.tierMood(0, 5), "common");
  assert.equal(F.tierMood(1, 5), "shallow");
  assert.equal(F.tierMood(3, 5), "deep");
  assert.equal(F.tierMood(4, 5), "rarest");
  assert.equal(F.tierMood(1, 2), "rarest");
  assert.equal(F.tierMood(-1, 5), "miss");
  assert.equal(F.revealLine("rarest", 3), F.revealLine("rarest", 3));
  assert.notEqual(F.revealLine("rarest", 0), F.revealLine("rarest", 1));
  assert.ok(F.REVEAL_LINES.miss.indexOf(F.revealLine("nonsense", 2)) >= 0);
  assert.match(F.boardLine(1500, 0), /midnight|1,000/i);
  assert.match(F.phoneLine(4200), /abyss/i);
  const emoji = /\p{Extended_Pictographic}/u;
  const all = Object.values(F.REVEAL_LINES).flat().concat(Object.values(F.BOARD_LINES).flat());
  assert.ok(all.every((line) => !emoji.test(line) && line.length <= 70), "short lines, no emoji");
});

test("FL-5 rulerFit keeps labels apart, honouring how each one hangs off its line", () => {
  const marks = [{ at: 0, label: "0 m" }, { at: 20, label: "200 m" }, { at: 100, label: "1,000 m" }];
  const overlaps = (kept, tall, h) => {
    const box = (m) => {
      const i = marks.indexOf(m);
      const px = (m.at / 100) * tall;
      return i === 0 ? [px, px + h] : (i === marks.length - 1 ? [px - h, px] : [px - h / 2, px + h / 2]);
    };
    return kept.some((a, i) => kept.some((b, j) => i < j && box(a)[1] > box(b)[0] && box(b)[1] > box(a)[0]));
  };
  // 100 px: "200 m" centred at 20 px would overlap "0 m" hanging from 0 to 18 px, so it is dropped.
  assert.deepEqual(F.rulerFit(marks, 100, 18).map((m) => m.label), ["0 m", "1,000 m"]);
  // 300 px: it sits at 51–69 px, clear of both ends.
  assert.deepEqual(F.rulerFit(marks, 300, 18).map((m) => m.label), ["0 m", "200 m", "1,000 m"]);
  // 30 px: the two ends can't both fit; the bottom of the scale wins.
  assert.deepEqual(F.rulerFit(marks, 30, 18).map((m) => m.label), ["1,000 m"]);
  for (let tall = 10; tall <= 600; tall += 7) {
    assert.equal(overlaps(F.rulerFit(marks, tall, 18), tall, 18), false, `overlap at ${tall} px`);
  }
  const deep = [{ at: 0 }, ...F.milestones(7000), { at: 100 }];
  assert.ok(F.rulerFit(deep, 46, 18).length <= 2, "a 46 px ruler holds two labels at most");
  assert.deepEqual(F.rulerFit([], 100, 18), []);
  assert.deepEqual(F.rulerFit(marks, 0, 18), []);
});
