// Deep Cut — phone view: place, total, gap, rated list, and a 40-player run through the core.
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const K = require("../js/kr-core.js");
const T0 = 1000000;

function game() {
  const prompts = [];
  for (let i = 0; i < 40; i += 1) {
    prompts.push({ text: `Name thing ${i}`, category: "Misc", answers: [
      { text: `Alpha${i}`, tier: "shallows" }, { text: `Bravo${i}`, tier: "shallows", aliases: [`Bee${i}`] },
      { text: `Charlie${i}`, tier: "reef" }, { text: `Delta${i}`, tier: "twilight" },
      { text: `Echo${i}`, tier: "midnight" }, { text: `Zulu${i}`, tier: "abyss" }] });
  }
  return { title: "Phone view", settings: { promptsPerGame: 7 }, prompts };
}
const players = (n) => Array.from({ length: n }, (_, i) => ({ pid: `p${i + 1}`, name: `Player ${i + 1}` }));
const start = (n, mode) => K.reduce(K.createState(game(), { players: players(n), mode }), { type: "start" });

/** Everyone answers, the judge rules off-list ones twilight, walk the reveal to the depth board. */
function playPrompt(s, answers) {
  s = K.reduce(s, { type: "openPrompt", now: T0 });
  Object.keys(answers).forEach((pid) => { s = K.reduce(s, { type: "answer", pid, text: answers[pid] }); });
  s = K.reduce(s, { type: "closePrompt" });
  K.reviewQueue(s).forEach((g) => { s = K.reduce(s, { type: "review", group: g.id, tier: "twilight" }); });
  while (s.phase === "reveal") s = K.reduce(s, { type: "revealNext" });
  return s;
}

test("ordinals", () => {
  assert.deepEqual([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 40].map(K.ordinal),
    ["1st", "2nd", "3rd", "4th", "11th", "12th", "13th", "21st", "22nd", "23rd", "40th"]);
});

test("Deep Dive phone: place, total and gap on the reveal and depth screens; ties shown as =", () => {
  const s = playPrompt(start(5, "deepDive"), { p1: "Zulu0", p2: "Echo0", p3: "Alpha0", p4: "Bravo0", p5: "Bee0" });
  assert.equal(s.phase, "depth");
  const v1 = K.phoneView(s, "p1", T0);
  assert.equal(v1.screen, "reveal");
  assert.equal(v1.standing.place, "1st of 5");
  assert.equal(v1.standing.line, "You’re in the lead");
  assert.equal(v1.standing.points, 100);
  assert.equal(v1.standing.depth, 1000);
  assert.deepEqual(v1.standing.top.map((t) => t.name), ["Player 1", "Player 2", "Player 3"]);
  const v2 = K.phoneView(s, "p2", T0);
  assert.equal(v2.standing.place, "2nd of 5");
  assert.equal(v2.standing.gap.points, 15);
  assert.match(v2.standing.line, /^150 m \(15 points\) behind/);
  ["p3", "p4", "p5"].forEach((pid) => {
    const v = K.phoneView(s, pid, T0).standing;
    assert.equal(v.place, "=3rd of 5");
    assert.equal(v.gap.points, 75);
  });
});

test("tied for the lead", () => {
  const s = playPrompt(start(3, "deepDive"), { p1: "Zulu0", p2: "Zulu0", p3: "Alpha0" });
  assert.equal(K.phoneView(s, "p1", T0).standing.place, "=1st of 3");
  assert.equal(K.phoneView(s, "p1", T0).standing.line, "Tied for the lead");
  assert.equal(K.phoneView(s, "p3", T0).standing.place, "3rd of 3");
});

test("the next intro screen keeps the standing; nothing before anyone scored", () => {
  let s = start(3, "deepDive");
  assert.equal(K.phoneView(s, "p1", T0).standing, undefined);
  s = playPrompt(s, { p1: "Zulu0", p2: "Alpha0", p3: "Alpha0" });
  s = K.reduce(s, { type: "nextPrompt" });
  const v = K.phoneView(s, "p2", T0);
  assert.equal(v.screen, "wait");
  assert.equal(v.standing.place, "=2nd of 3");
  assert.equal(v.rated, undefined);
});

test("rated list: only after the prompt is banked, grouped by tier rarest last, own answer marked", () => {
  let s = K.reduce(start(4, "deepDive"), { type: "openPrompt", now: T0 });
  ["Zqmine", "Bee0", "Delta0", "Zqmine"].forEach((t, i) => {
    s = K.reduce(s, { type: "answer", pid: `p${i + 1}`, text: t });
  });
  s = K.reduce(s, { type: "closePrompt" });
  s = K.reduce(s, { type: "review", group: "zqmine", tier: "midnight" });
  while (s.phase === "reveal") {
    assert.ok(!("rated" in K.phoneView(s, "p1", T0)), "no list while revealing");
    s = K.reduce(s, { type: "revealNext" });
  }
  const v = K.phoneView(s, "p1", T0);
  assert.deepEqual(v.rated.tiers.map((t) => t.name), ["Shallows", "Reef", "Twilight", "Midnight", "Abyss"]);
  const mid = v.rated.tiers.find((t) => t.name === "Midnight").entries;
  assert.deepEqual(mid.map((e) => e.text), ["Echo0", "Zqmine"]);
  assert.deepEqual(mid[1], { text: "Zqmine", mine: true, judged: true });
  const shallows = K.phoneView(s, "p2", T0).rated.tiers.find((t) => t.name === "Shallows").entries;
  assert.deepEqual(shallows, [{ text: "Alpha0" }, { text: "Bravo0", mine: true }]);
  assert.ok(JSON.stringify(v.rated).length < 2000);
});

test("Puffer phone: hearts, meter, floating, standing between rounds; list only after the round", () => {
  let s = start(6, "puffer");
  assert.equal(K.phoneView(s, "p2", T0).standing, undefined, "no standing before round 1");
  s = K.reduce(s, { type: "pufferStart", now: T0 });
  s = K.reduce(s, { type: "pufferAnswer", pid: "p1", text: "Zulu0", now: T0 });
  s = K.reduce(s, { type: "pufferAnswer", pid: "p2", text: "Alpha0", now: T0 });
  assert.ok(!("rated" in K.phoneView(s, "p1", T0)));
  s = K.reduce(s, { type: "pufferPop", now: T0 });
  assert.equal(s.phase, "popped");
  const v1 = K.phoneView(s, "p1", T0);
  assert.equal(v1.standing.hearts, 3);
  assert.equal(v1.standing.meter, 4);
  assert.equal(v1.standing.floating, 6);
  assert.equal(v1.standing.place, "1st of 6");
  assert.equal(K.phoneView(s, "p3", T0).standing.place, "6th of 6");
  assert.equal(v1.rated.tiers.find((t) => t.name === "Abyss").entries[0].mine, true);
  s = K.reduce(s, { type: "nextRound" });
  const v2 = K.phoneView(s, "p1", T0);
  assert.equal(v2.standing.place, "1st of 6");
  assert.ok(!("rated" in v2));
});

test("Puffer eliminated players rank by order out, after everyone floating", () => {
  let s = start(3, "puffer");
  s = { ...s, players: s.players.map((p) => ({ ...p, hearts: 1 })) };
  s = K.reduce(s, { type: "pufferStart", now: T0 });
  s = K.reduce(s, { type: "pufferPop", now: T0 });
  const v = K.phoneView(s, "p1", T0);
  assert.equal(v.screen, "out");
  assert.equal(v.standing.place, "3rd of 3");
  assert.equal(v.standing.floating, 2);
  assert.equal(v.standing.out, true);
});

test("40 players, 7 prompts through the core: scoring, standings, payload size", () => {
  let s = start(40, "deepDive");
  const expected = Object.fromEntries(s.players.map((p) => [p.pid, 0]));
  const words = ["Alpha", "Bee", "Charlie", "Delta", "Echo", "Zulu"];
  const points = [10, 10, 30, 60, 85, 100];
  let biggest = 0;
  for (let r = 0; r < 7; r += 1) {
    const idx = s.dive.index;
    s = K.reduce(s, { type: "openPrompt", now: T0 });
    s.players.forEach((p, i) => {
      if (r === 0 && i === 0) return;                           // p1 sends nothing on the first prompt
      const k = (i * 7 + r * 3) % 44;
      if (k >= 39) { s = K.reduce(s, { type: "answer", pid: p.pid, text: `Qq${k % 2}x${r}` }); expected[p.pid] += 60; return; }
      s = K.reduce(s, { type: "answer", pid: p.pid, text: `${words[k % 6]}${idx}` });
      expected[p.pid] += points[k % 6];
    });
    s = K.reduce(s, { type: "closePrompt" });
    K.reviewQueue(s).forEach((g) => { s = K.reduce(s, { type: "review", group: g.id, tier: "twilight" }); });
    while (s.phase === "reveal") s = K.reduce(s, { type: "revealNext" });
    assert.equal(s.phase, "depth");
    const board = K.depthBoard(s);
    assert.equal(board.length, 40);
    for (let i = 1; i < 40; i += 1) assert.ok(board[i - 1].score >= board[i].score);
    s.players.forEach((p) => assert.equal(p.score, expected[p.pid], `${p.pid} after prompt ${r + 1}`));
    s.players.forEach((p) => {
      const view = K.phoneView(s, p.pid, T0);
      const row = board.find((b) => b.pid === p.pid);
      assert.equal(view.standing.rank, row.rank);
      assert.equal(view.standing.points, row.score);
      assert.match(view.standing.place, /of 40$/);
      biggest = Math.max(biggest, JSON.stringify(view).length);
    });
    if (r < 6) s = K.reduce(s, { type: "nextPrompt" });
  }
  assert.ok(biggest < 4000, `largest payload ${biggest} bytes`);
  s = K.reduce(s, { type: "nextPrompt" });
  assert.equal(s.phase, "result");
  assert.ok(s.winners.length >= 1);
  assert.ok(s.winners.every((pid) => K.depthBoard(s).find((b) => b.pid === pid).rank === 1));
});
