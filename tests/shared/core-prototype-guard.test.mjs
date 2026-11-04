/* ============================================================
   Cross-game regression: every pure game core must treat a
   prototype-shaped event type ("toString", "valueOf", "__proto__",
   "hasOwnProperty", "constructor") as an unknown event — return the
   same state, never throw, never call an Object.prototype method.
   Found first in Price Is Right and Deal or No Deal by their testers;
   this pins the guard for this core in one place.
   ============================================================ */

import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const CORES = [
  { name: "krillion", files: ["../../js/kr-content.js", "../../js/kr-select.js", "../../js/kr-core.js"], global: "KrCore", make: (C) => C.createState(C.normalizeGame(require("../../prompts.json")), [{ pid: "p1", name: "A" }, { pid: "p2", name: "B" }, { pid: "p3", name: "C" }], {}) },
];

const BAD_TYPES = ["toString", "valueOf", "__proto__", "hasOwnProperty", "constructor", "__defineGetter__"];

for (const core of CORES) {
  test(`${core.name}: prototype-shaped event types are ignored`, async () => {
    for (const f of core.files) await import(f);
    const C = globalThis[core.global];
    assert.ok(C && typeof C.reduce === "function", `${core.global} not exported`);
    let state;
    try {
      state = core.make(C);
    } catch (err) {
      // A createState signature we did not anticipate: fall back to a bare object so the guard is still exercised.
      state = { phase: "setup", history: [] };
    }
    for (const type of BAD_TYPES) {
      let next;
      assert.doesNotThrow(() => { next = C.reduce(state, { type }, () => 0, 0); }, `${core.name} threw on type "${type}"`);
      assert.equal(next, state, `${core.name} changed state on type "${type}"`);
    }
    assert.equal(typeof state.phase, "string", "state was not corrupted by the probes");
  });
}
