/* ============================================================
   Deep Cut — WebAudio cues
   Synthesised, no audio files, nothing plays before a user
   gesture. The preference is shared with the rest of the hub
   under localStorage key `kk-sound` (architecture 00 §10).

   The palette is underwater: a sonar ping when an answer lands,
   a run of bubbles for each reveal (lower ones for the deeper
   tiers), a long fall and a far-off ping for the deepest tier,
   a sonar sweep for the depth board, a dull thud for a miss and a sharp
   pop when the puffer goes off.
   ============================================================ */

"use strict";

(function (root) {
  const KEY = "kk-sound";
  let ctx = null;
  let enabled = true;

  try {
    enabled = root.localStorage.getItem(KEY) !== "off";
  } catch (err) {
    console.warn("Sound preference unavailable:", err);
  }

  function audio() {
    if (!enabled) return null;
    const Ctor = root.AudioContext || root.webkitAudioContext;
    if (!Ctor) return null;
    if (!ctx) {
      try { ctx = new Ctor(); } catch (err) { console.warn("No audio:", err); return null; }
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }

  function tone(freq, duration, options) {
    const c = audio();
    if (!c) return;
    const o = options || {};
    const osc = c.createOscillator();
    const gain = c.createGain();
    const t0 = c.currentTime + (o.delay || 0);
    osc.type = o.type || "sine";
    osc.frequency.setValueAtTime(freq, t0);
    if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(o.slideTo, t0 + duration);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(o.volume === undefined ? 0.16 : o.volume, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }

  function noise(duration, freq, volume) {
    const c = audio();
    if (!c) return;
    const frames = Math.max(1, Math.floor(c.sampleRate * duration));
    const buffer = c.createBuffer(1, frames, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    const src = c.createBufferSource();
    src.buffer = buffer;
    const filter = c.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = freq;
    const gain = c.createGain();
    gain.gain.value = volume;
    src.connect(filter).connect(gain).connect(c.destination);
    src.start();
  }

  const CUES = {
    ping() { tone(1320, 0.5, { volume: 0.12 }); tone(1320, 0.4, { volume: 0.04, delay: 0.22 }); },
    dive() { tone(330, 0.6, { type: "triangle", slideTo: 165, volume: 0.12 }); },
    close() { tone(660, 0.12, { type: "triangle", volume: 0.1 }); tone(440, 0.2, { type: "triangle", volume: 0.1, delay: 0.1 }); },
    // Three small bubbles, each a quick upward chirp, rising a little in pitch.
    bubble() { [380, 520, 660].forEach((f, i) => tone(f, 0.12, { slideTo: f * 2.1, volume: 0.08, delay: i * 0.075 })); },
    // A deeper tier: slower, lower bubbles with a soft hum underneath.
    deep() {
      [260, 340].forEach((f, i) => tone(f, 0.18, { slideTo: f * 1.9, volume: 0.08, delay: i * 0.11 }));
      tone(110, 0.7, { volume: 0.06, delay: 0.05 });
    },
    // The rarest tier: a long fall into the dark, a sub-bass swell and one far-off sonar answer.
    abyss() {
      tone(196, 1.6, { slideTo: 41, volume: 0.13 });
      tone(98, 1.4, { type: "triangle", slideTo: 36, volume: 0.09, delay: 0.1 });
      tone(1175, 0.9, { volume: 0.05, delay: 0.75 });
      tone(1175, 0.7, { volume: 0.02, delay: 1.1 });
    },
    // The depth board: a soft sonar sweep and its echo.
    sonar() { tone(990, 0.6, { slideTo: 940, volume: 0.07 }); tone(990, 0.5, { slideTo: 940, volume: 0.025, delay: 0.38 }); },
    miss() { tone(140, 0.3, { type: "square", slideTo: 90, volume: 0.07 }); },
    pass() { tone(700, 0.08, { type: "triangle", volume: 0.1 }); tone(1050, 0.12, { type: "triangle", volume: 0.1, delay: 0.07 }); },
    heart() { [523, 659, 784].forEach((f, i) => tone(f, 0.18, { type: "triangle", volume: 0.1, delay: i * 0.08 })); },
    pop() { noise(0.25, 900, 0.35); tone(180, 0.25, { type: "square", slideTo: 60, volume: 0.1 }); },
    tick() { tone(1000, 0.05, { type: "square", volume: 0.05 }); },
    fanfare() { [392, 523, 659, 784].forEach((f, i) => tone(f, 0.34, { type: "triangle", volume: 0.12, delay: i * 0.13 })); },
  };

  const has = (key) => Object.prototype.hasOwnProperty.call(CUES, key);

  root.KrSound = {
    play(name) {
      if (!enabled || !has(name)) return;
      try { CUES[name](); } catch (err) { console.warn("Sound cue failed:", err); }
    },
    enabled: () => enabled,
    toggle() {
      enabled = !enabled;
      try { root.localStorage.setItem(KEY, enabled ? "on" : "off"); } catch (err) {
        console.warn("Could not save the sound preference:", err);
      }
      if (enabled) CUES.bubble();
      return enabled;
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
