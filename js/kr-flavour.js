/* ============================================================
   Deep Cut — flavour (PURE)
   The sea the game is set in: the real ocean's depth zones (the
   reef's bands and milestone lines, the phone's depth gauge) and
   the short lines of copy that react to a reveal or a depth board.
   Every line is picked by a caller-supplied seed, so a re-render
   never changes what the room is reading.

   No DOM, no timers, no randomness of its own.
   ============================================================ */

"use strict";

(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.KrFlavour = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  /** The ocean, top to bottom (metres). 10 m per point puts a strong game in the midnight zone. */
  const ZONES = Object.freeze([
    Object.freeze({ id: "sunlight", name: "Sunlight zone", from: 0, to: 200, mark: "" }),
    Object.freeze({ id: "twilight", name: "Twilight zone", from: 200, to: 1000, mark: "sunlight ends" }),
    Object.freeze({ id: "midnight", name: "Midnight zone", from: 1000, to: 4000, mark: "midnight" }),
    Object.freeze({ id: "abyss", name: "The abyss", from: 4000, to: 6000, mark: "the abyss" }),
    Object.freeze({ id: "trenches", name: "The trenches", from: 6000, to: 11000, mark: "the trenches" }),
  ]);

  const num = (n) => Number(n || 0).toLocaleString("en-US");
  const clampMetres = (m) => (typeof m === "number" && Number.isFinite(m) && m > 0 ? m : 0);

  /** The zone a depth sits in (the trenches go on for ever). */
  function zoneFor(metres) {
    const m = clampMetres(metres);
    return ZONES.find((z) => m < z.to) || ZONES[ZONES.length - 1];
  }

  /**
   * The zones visible on a reef `scale` metres deep, as percentages of the
   * scale: [{ id, name, start, size }]. The last band is cut off at the scale.
   */
  function zoneBands(scale) {
    const s = clampMetres(scale) || 1;
    return ZONES.filter((z) => z.from < s).map((z) => {
      const to = Math.min(z.to, s);
      return { id: z.id, name: z.name, start: round1((z.from / s) * 100), size: round1(((to - z.from) / s) * 100) };
    });
  }

  /** The zone boundaries above `scale`: [{ metres, at, mark, label }] — "1,000 m · midnight". */
  function milestones(scale) {
    const s = clampMetres(scale) || 1;
    return ZONES.filter((z) => z.from > 0 && z.from < s)
      .map((z) => ({ metres: z.from, at: round1((z.from / s) * 100), mark: z.mark, label: `${num(z.from)} m · ${z.mark}` }));
  }

  /**
   * Where a depth sits on a gauge whose five zones have equal height, 0–100.
   * The phone's gauge reads at a glance this way: the sunlit 200 m are not a sliver.
   */
  function gaugePosition(metres) {
    const m = clampMetres(metres);
    const i = ZONES.indexOf(zoneFor(m));
    const z = ZONES[i];
    const within = Math.min(1, (Math.min(m, z.to) - z.from) / (z.to - z.from));
    return round1(((i + within) / ZONES.length) * 100);
  }

  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  /* ============ Lines ============ */

  const REVEAL_LINES = Object.freeze({
    miss: ["That one sank without a trace.", "Sent back to the surface.", "No depth for that one. The sea shrugs.",
      "Lost at sea."],
    common: ["Paddling depth. Half the room said it too.", "Safe, sunny and very crowded.",
      "Ankle-deep, but it counts.", "Everyone’s first thought. Nothing wrong with that."],
    shallow: ["Off the beach and over the reef.", "A few fish looked up.", "Hair’s wet now.",
      "Past the snorkellers."],
    deep: ["The light is going. Good.", "Down where the fish make their own glow.", "Ears are popping.",
      "Few divers come this far."],
    rarest: ["Nobody else went down there.", "Pressure: enormous. Answer: superb.",
      "Something with a lantern on its head just nodded.", "The deepest cut of the round."],
  });

  const BOARD_LINES = Object.freeze({
    sunlight: ["Still in the sunlight. Plenty of ocean below.", "Shallow water so far. Hold your breath."],
    twilight: ["The leaders have reached the twilight zone.", "Past 200 m: the last of the sunlight is behind you."],
    midnight: ["Midnight zone: the light gave up a while ago.", "Past 1,000 m. From here the only light is your own."],
    abyss: ["The abyss. Cold, dark, and someone is winning.", "Past 4,000 m. The pressure suits them."],
    trenches: ["Into the trenches. The sea doesn’t go much deeper.", "Past 6,000 m. That’s trench country."],
  });

  const PHONE_LINES = Object.freeze({
    sunlight: "Sunlight zone — warm water, lots of company.",
    twilight: "Twilight zone — the light is fading.",
    midnight: "Midnight zone — no sunlight this deep.",
    abyss: "The abyss — near freezing, crushing pressure.",
    trenches: "The trenches — about as deep as the sea goes.",
  });

  function pick(list, seed) {
    const n = list.length;
    const i = Number.isFinite(seed) ? Math.abs(Math.floor(seed)) % n : 0;
    return list[i];
  }

  /** Where a tier sits: "common" (first), "rarest" (last), "shallow" or "deep" between; null is a miss. */
  function tierMood(index, count) {
    if (!Number.isInteger(index) || index < 0 || !Number.isInteger(count) || count < 1) return "miss";
    if (index === 0) return "common";
    if (index >= count - 1) return "rarest";
    return index / (count - 1) < 0.5 ? "shallow" : "deep";
  }

  /** A short line for a revealed answer of this mood. */
  function revealLine(mood, seed) {
    const list = Object.prototype.hasOwnProperty.call(REVEAL_LINES, mood) ? REVEAL_LINES[mood] : REVEAL_LINES.miss;
    return pick(list, seed);
  }

  /** A short line for the depth board, by the zone the leader has reached. */
  function boardLine(leaderMetres, seed) {
    return pick(BOARD_LINES[zoneFor(leaderMetres).id], seed);
  }

  /** The phone's line for its own depth. */
  function phoneLine(metres) {
    return PHONE_LINES[zoneFor(metres).id];
  }

  return {
    ZONES, REVEAL_LINES, BOARD_LINES, zoneFor, zoneBands, milestones, gaugePosition,
    tierMood, revealLine, boardLine, phoneLine,
  };
});
