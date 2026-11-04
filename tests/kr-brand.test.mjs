// Deep Cut — tests for the game name, tier names, presets and legacy tier ids.
// Run from the repo root:  node --test

import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const K = require("../js/kr-core.js");

const LEGACY = ["prawn", "schooler", "rare", "deepcut", "krillion"];
const ZONES = ["shallows", "reef", "twilight", "midnight", "abyss"];

function legacyTiers() {
  return LEGACY.map((id, i) => ({ id, name: `Old ${id}`, points: (i + 1) * 10 }));
}

/** A 40-prompt file whose answers use `ids` (five tier ids, shallow to deep). */
function file(ids, settings) {
  const prompts = Array.from({ length: 40 }, (_, i) => ({
    text: `Name thing ${i}`,
    answers: ids.map((tier, n) => ({ text: `Answer${i}x${n}`, tier })),
  }));
  return { title: "T", settings, prompts };
}

const PLAYERS = [{ pid: "p1", name: "Ann" }, { pid: "p2", name: "Bo" }];

test("BR-1 defaults: Deep Cut, its tagline and the five depth zones", () => {
  const s = K.normalizeSettings({});
  assert.deepEqual(s.brand, { name: "Deep Cut", tagline: "The rarest answer wins." });
  assert.deepEqual(s.tiers.map((t) => t.id), ZONES);
  assert.deepEqual(s.tiers.map((t) => t.name), ["Shallows", "Reef", "Twilight", "Midnight", "Abyss"]);
  assert.deepEqual(s.tiers.map((t) => t.points), [10, 30, 60, 85, 100]);
  const g = K.normalizeGame(file(ZONES, {}));
  assert.equal(g.settings.brand.name, "Deep Cut");
  const untitled = file(ZONES, { brand: { name: "Trivia Tide" } });
  delete untitled.title;
  assert.equal(K.normalizeGame(untitled).title, "Trivia Tide — Game Night");
  assert.equal(K.normalizeGame(untitled).settings.brand.tagline, "The rarest answer wins.");
});

test("BR-2 brand validation: name 1–30, tagline 0–60, plain-English refusals", () => {
  const n = (brand) => K.normalizeSettings({ brand });
  assert.deepEqual(n({ name: "  Odd   One Out ", tagline: "" }), n({ name: "Odd One Out", tagline: "" }));
  assert.equal(n({ name: "Odd One Out", tagline: "" }).brand.tagline, "", "an empty tagline is allowed");
  assert.equal(n({ name: "x".repeat(30) }).brand.name.length, 30);
  assert.throws(() => n({ name: "" }), /needs a name/);
  assert.throws(() => n({ name: "   " }), /needs a name/);
  assert.throws(() => n({ name: "x".repeat(31) }), /name is longer than 30/);
  assert.throws(() => n({ tagline: "y".repeat(61) }), /tagline is longer than 60/);
  assert.throws(() => n({ name: 7 }), /has to be text/);
  assert.throws(() => n("Deep Cut"), /name has to be an object/);
  assert.equal(n({ name: "A\u0007B" }).brand.name, "A B", "control characters are cleaned");
});

test("BR-3 brandOfSettings never throws and never returns an empty name", () => {
  assert.equal(K.brandOfSettings(null).name, "Deep Cut");
  assert.equal(K.brandOfSettings({ brand: { name: "" } }).name, "Deep Cut");
  assert.equal(K.brandOfSettings({ brand: { name: "Quiz", tagline: "" } }).tagline, "");
  const s = K.createState(file(ZONES, { brand: { name: "Quiz" } }), { players: PLAYERS });
  assert.equal(K.brandOf(s).name, "Quiz");
});

test("BR-4 tier names: required, at most 24, no two alike (any case)", () => {
  const tiers = (names) => names.map((name, i) => ({ id: `t${i}`, name, points: (i + 1) * 10 }));
  assert.equal(K.normalizeTiers(tiers(["One", "Two"])).length, 2);
  assert.throws(() => K.normalizeTiers(tiers(["One", ""])), /Tier 2 needs a name/);
  assert.throws(() => K.normalizeTiers(tiers(["One", "x".repeat(25)])), /longer than 24/);
  assert.throws(() => K.normalizeTiers(tiers(["Reef", "reef"])), /both called “reef”/);
  // The setup screen holds half-typed names; only the strict pass refuses them.
  assert.equal(K.normalizeTiers(tiers(["One", ""]), true)[1].name, "");
  assert.equal(K.settingsProblem({ tiers: tiers(["One", ""]) }), "Tier 2 needs a name.");
  assert.equal(K.settingsProblem({}), "");
});

test("BR-5 presets rename only: ids and points stay", () => {
  const base = K.TIERS.map((t) => Object.assign({}, t));
  const rarity = K.applyPreset(base, "rarity");
  assert.deepEqual(rarity.map((t) => t.name), ["Common", "Uncommon", "Rare", "Epic", "Legendary"]);
  assert.deepEqual(rarity.map((t) => t.id), ZONES);
  assert.deepEqual(rarity.map((t) => t.points), [10, 30, 60, 85, 100]);
  assert.equal(K.presetOf(rarity), "rarity");
  assert.equal(K.presetOf(base), "zones");
  assert.equal(K.presetOf(rarity.map((t, i) => (i === 2 ? Object.assign({}, t, { name: "Mine" }) : t))), "custom");
  const three = K.applyPreset(base.slice(0, 3).map((t, i) => Object.assign({}, t, { points: (i + 1) * 5 })), "rarity");
  assert.deepEqual(three.map((t) => t.name), ["Common", "Rare", "Legendary"]);
  assert.equal(K.presetOf(three), "rarity");
  assert.deepEqual(K.applyPreset(base, "nope"), base);
  assert.equal(new Set(K.applyPreset(base.concat([{ id: "six", name: "Six", points: 200 }]), "rarity")
    .map((t) => t.name)).size, 6);
});

test("BR-6 legacy ids: a GSC-format file with prawn…krillion loads as the zone tiers", () => {
  const raw = file(LEGACY, { tiers: legacyTiers() });
  const g = K.normalizeGame(raw);
  assert.deepEqual(g.settings.tiers.map((t) => t.id), ZONES);
  assert.deepEqual(g.settings.tiers.map((t) => t.name), LEGACY.map((id) => `Old ${id}`), "the file's names are kept");
  assert.deepEqual(g.prompts[0].answers.map((a) => a.tier), ZONES);
  // Answers match to the right new tiers and score the right points.
  const hit = K.matchAnswer(g.prompts[3], "answer3x3");
  assert.equal(hit.tier, "midnight");
  assert.equal(K.pointsFor(K.createState(raw, { players: PLAYERS }), "abyss"), 50);
  assert.equal(raw.settings.tiers[0].id, "prawn", "the caller's object is not mutated");
  assert.equal(raw.prompts[0].answers[4].tier, "krillion");
});

test("BR-7 legacy ids without a tier list, and the shipped-style default names", () => {
  const g = K.normalizeGame(file(LEGACY, {}));
  assert.deepEqual(g.settings.tiers.map((t) => t.name), ["Shallows", "Reef", "Twilight", "Midnight", "Abyss"]);
  assert.deepEqual(g.prompts[1].answers.map((a) => a.tier), ZONES);
  assert.doesNotThrow(() => K.validateGame(file(LEGACY, {})));
  assert.deepEqual(K.settingsOf(file(LEGACY, { tiers: legacyTiers() })).tiers.map((t) => t.id), ZONES);
});

test("BR-8 custom tier ids are untouched, even ones that merely look old", () => {
  const custom = ["bronze", "silver", "gold", "platinum", "diamond"].map((id, i) => ({ id, name: id, points: (i + 1) * 10 }));
  const g = K.normalizeGame(file(custom.map((t) => t.id), { tiers: custom }));
  assert.deepEqual(g.settings.tiers.map((t) => t.id), custom.map((t) => t.id));
  assert.deepEqual(g.prompts[0].answers.map((a) => a.tier), custom.map((t) => t.id));
  // A mixed list is the author's own: "rare" stays "rare".
  const mixed = [{ id: "prawn", name: "A", points: 1 }, { id: "gold", name: "B", points: 2 }, { id: "rare", name: "C", points: 3 }];
  const m = K.normalizeGame(file(["prawn", "gold", "rare", "gold", "rare"], { tiers: mixed }));
  assert.deepEqual(m.settings.tiers.map((t) => t.id), ["prawn", "gold", "rare"]);
  assert.deepEqual(m.prompts[0].answers.map((a) => a.tier), ["prawn", "gold", "rare", "gold", "rare"]);
  // A file that already uses the zone ids is not touched either.
  assert.equal(K.upgradeGame(file(ZONES, {})).prompts[0].answers[0].tier, "shallows");
});

test("BR-9 applyLearned keeps working on a legacy file", () => {
  const raw = file(LEGACY, { tiers: legacyTiers() });
  const out = K.applyLearned(raw, [{ prompt: "Name thing 0", text: "Zebra", tier: "abyss" }]);
  assert.equal(out.prompts[0].answers.length, 6);
  assert.equal(out.prompts[0].answers[5].tier, "abyss");
  assert.doesNotThrow(() => K.validateGame(out));
});

test("BR-10 phones are told the game's name, in every view", () => {
  let s = K.createState(file(ZONES, { brand: { name: "Trivia Tide" } }), { players: PLAYERS });
  s = K.reduce(s, { type: "start" });
  assert.equal(K.phoneView(s, "p1", 0).brand, "Trivia Tide");
  s = K.reduce(s, { type: "openPrompt", now: 0 });
  assert.equal(K.phoneView(s, "p1", 0).brand, "Trivia Tide");
  assert.equal(K.phoneView(s, "ghost", 0).brand, "Trivia Tide");
  assert.equal(K.phoneView(null, "p1", 0).brand, "Deep Cut");
});

test("BR-11 the shipped files carry the new defaults and no old ids", () => {
  const fs = require("node:fs");
  const read = (f) => fs.readFileSync(path.join(here, "..", f), "utf8");
  ["prompts.json", "sets/kids-night.json", "sets/pop-culture.json", "tests/fixtures/harness-game.json"].forEach((f) => {
    assert.ok(!/"tier"\s*:\s*"(prawn|schooler|rare|deepcut|krillion)"/.test(read(f)), `${f} still uses an old tier id`);
  });
  assert.equal(JSON.parse(read("prompts.json")).settings.brand.name, "Deep Cut");
  assert.equal(JSON.parse(read("prompts.json")).title, "Deep Cut — Game Night");
});

test("BR-12 withNaming: names come from the setup when tier ids match, never otherwise", () => {
  const setup = K.normalizeSettings({ brand: { name: "Trivia Tide", tagline: "Dive" },
    tiers: K.applyPreset(K.TIERS, "rarity") });
  const g = K.withNaming(file(ZONES, { brand: { name: "Old" } }), setup);
  assert.equal(g.settings.brand.name, "Trivia Tide");
  assert.deepEqual(g.settings.tiers.map((t) => t.name), ["Common", "Uncommon", "Rare", "Epic", "Legendary"]);
  assert.deepEqual(g.settings.tiers.map((t) => t.points), [10, 30, 60, 85, 100], "points follow the file");
  const own = K.withNaming(file(LEGACY, { tiers: legacyTiers() }), setup);
  assert.equal(own.settings.brand.name, "Trivia Tide");
  assert.deepEqual(own.settings.tiers.map((t) => t.id), ZONES, "legacy ids are read as zones first");
  const custom = ["a", "b", "c", "d", "e"].map((id, i) => ({ id, name: id, points: i + 1 }));
  const kept = K.withNaming(file(["a", "b", "c", "d", "e"], { tiers: custom }), setup);
  assert.deepEqual(kept.settings.tiers.map((t) => t.name), ["a", "b", "c", "d", "e"], "other ids: tier names untouched");
  assert.equal(kept.settings.brand.name, "Trivia Tide", "other ids: the brand still syncs");
  assert.equal(kept.settings.brand.tagline, "Dive");
  assert.equal(file(ZONES, {}).settings.brand, undefined, "the input is not mutated");
});

test("BR-13 namingNote: said only when the file's naming differs from the host's", () => {
  const mine = K.normalizeSettings({ brand: { name: "Trivia Tide" } });
  const same = K.normalizeSettings({ brand: { name: "Trivia Tide" } });
  assert.equal(K.namingNote(same, mine), "");
  const other = K.normalizeSettings({ brand: { name: "Quiz Reef" } });
  assert.equal(K.namingNote(other, mine), "Kept your game name and tier names. This file calls itself “Quiz Reef”.");
  const renamed = K.normalizeSettings({ brand: { name: "Trivia Tide" }, tiers: K.applyPreset(K.TIERS, "rarity") });
  assert.match(K.namingNote(renamed, mine), /Kept your game name/);
  const custom = K.normalizeSettings({ tiers: [{ id: "a", name: "A", points: 1 }, { id: "b", name: "B", points: 2 }] });
  assert.equal(K.namingNote(custom, K.normalizeSettings({ brand: { name: "Deep Cut" } })), "", "different ids: the file's tiers are adopted, nothing kept");
  const otherIds = K.normalizeSettings({ brand: { name: "Quiz Reef" },
    tiers: [{ id: "a", name: "A", points: 1 }, { id: "b", name: "B", points: 2 }] });
  assert.equal(K.namingNote(otherIds, mine), "Kept your game name. This file calls itself “Quiz Reef”.",
    "different ids and brand: only the game name was kept");
});

test("BR-14 applyLearned maps legacy ids on learned items too", () => {
  const out = K.applyLearned(file(ZONES, {}), [{ prompt: "Name thing 0", text: "Zebra", tier: "krillion" },
    { prompt: "Name thing 1", text: "Yak", tier: "prawn" }, { prompt: "Name thing 2", text: "Nope", tier: "bogus" }]);
  assert.equal(out.prompts[0].answers[5].tier, "abyss");
  assert.equal(out.prompts[1].answers[5].tier, "shallows");
  assert.equal(out.prompts[2].answers.length, 5);
  const custom = ["a", "b", "c", "d", "e"].map((id, i) => ({ id, name: id, points: i + 1 }));
  assert.equal(K.applyLearned(file(["a", "b", "c", "d", "e"], { tiers: custom }),
    [{ prompt: "Name thing 0", text: "Zed", tier: "rare" }]).prompts[0].answers.length, 5);
});
