/* ============================================================
   Deep Cut — the diver (glue)
   The little creature that sinks down the reef: an original
   inline SVG krill (built with createElementNS, never markup) or
   the host's uploaded picture (only ever as <img src>, and only
   after KrCore.cleanIcon has accepted the data URL). Also the
   reef's depth-zone bands and milestone ruler, the bubbles, the
   phone's depth gauge, and the setup screen's "Diver icon" picker.

   Motion honours prefers-reduced-motion: with it set, no bubbles
   are made and the CSS draws every diver straight at its depth.
   ============================================================ */

"use strict";

const KrDiver = (function () {
  const SVG = "http://www.w3.org/2000/svg";
  const ICON_SIDE = 96;              // the uploaded picture is shrunk to fit 96 × 96
  const ICON_BYTES = 40 * 1024;      // …and must then be 40 KB or less
  const FILE_BYTES = 8 * 1024 * 1024;
  const TYPES = /^image\/(png|jpeg|webp|gif)$/;
  const SINK_MS = 1500;
  const reduceQuery = typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

  function motionOK() {
    return !(reduceQuery && reduceQuery.matches);
  }

  /* ============ The default krill ============ */

  function svgNode(tag, attrs) {
    const node = document.createElementNS(SVG, tag);
    Object.keys(attrs).forEach((k) => node.setAttribute(k, attrs[k]));
    return node;
  }

  const KRILL_PARTS = [
    ["path", { d: "M9 13 C6 9 4 6 1 4", class: "kr-krill-feeler" }],
    ["path", { d: "M9 15 C5 14 3 13 0 13", class: "kr-krill-feeler" }],
    ["path", { d: "M16 19 L14 25 M20 20 L19 26 M24 20 L24 26 M28 19 L29 25", class: "kr-krill-legs" }],
    ["path", { d: "M40 15 L47 9 L45.5 15.5 L47 22 Z", class: "kr-krill-tail" }],
    ["path", { d: "M8 15.5 C8 9 16 6 25 6.5 C33 7 38.5 10.5 41.5 15 C38 17.5 33 19.5 26 19.8 C18 20.2 12 20 8 15.5 Z",
      class: "kr-krill-body" }],
    ["path", { d: "M20 8 C21.5 12 21.5 16 20 19.8 M26 7 C27.5 11 27.5 16 26 19.6 M32 8.5 C33.3 12 33.3 15.5 32 18.6",
      class: "kr-krill-bands" }],
    ["circle", { cx: "13.2", cy: "12.6", r: "2.3", class: "kr-krill-eye" }],
    ["circle", { cx: "12.6", cy: "11.9", r: "0.75", class: "kr-krill-glint" }],
  ];

  /** The original krill, drawn on a 48 × 30 grid, head left. */
  function krill() {
    const svg = svgNode("svg", { viewBox: "0 0 48 30", class: "kr-krill", focusable: "false", "aria-hidden": "true" });
    KRILL_PARTS.forEach(([tag, attrs]) => svg.appendChild(svgNode(tag, attrs)));
    return svg;
  }

  /**
   * A diver: <span.kr-diver><span.kr-diver-body>(svg | img)</span></span>.
   * The outer span sways, the body bobs; bubbles rise from the outer span.
   */
  function make(icon, extraClass) {
    const diver = el("span", `kr-diver${extraClass ? ` ${extraClass}` : ""}`);
    diver.setAttribute("aria-hidden", "true");
    const body = el("span", "kr-diver-body");
    const clean = window.KrCore.cleanIcon(icon);
    if (clean) {
      const img = el("img", "kr-diver-img");
      img.alt = "";
      img.decoding = "async";
      img.src = clean;
      body.appendChild(img);
    } else body.appendChild(krill());
    diver.appendChild(body);
    return diver;
  }

  /* ============ Motion ============ */

  /** A few bubbles rising off a diver, removed once they have risen. */
  function bubbles(diver, count) {
    if (!diver || !motionOK()) return;
    const n = count || 3;
    for (let i = 0; i < n; i += 1) {
      const b = el("span", "kr-bubble");
      b.style.setProperty("--i", String(i));
      b.style.setProperty("--x", `${(i % 2 ? 1 : -1) * (3 + i * 3)}px`);
      diver.appendChild(b);
      window.setTimeout(() => b.remove(), 1700 + i * 220);
    }
  }

  /** Sway on the way down, then settle with a small bob. */
  function sink(diver) {
    if (!diver || !motionOK()) return;
    diver.classList.remove("is-sinking", "is-settled");
    void diver.offsetWidth;          // restart the animation if it is already running
    diver.classList.add("is-sinking");
    bubbles(diver, 3);
    window.clearTimeout(diver.krTimer);
    diver.krTimer = window.setTimeout(() => {
      diver.classList.remove("is-sinking");
      diver.classList.add("is-settled");
    }, SINK_MS);
  }

  /** A one-off flourish (the winner, a puffer pop): `kind` names the CSS animation. */
  function flourish(diver, kind) {
    if (!diver || !motionOK()) return;
    diver.classList.add(kind);
    bubbles(diver, 5);
  }

  /* ============ The reef's zones and ruler ============ */

  /** Solid depth-zone bands inside one lane's water (vertical) or bar (compact). */
  function paintZones(water, scale, compact) {
    let box = water.querySelector(".kr-zones");
    if (!box) {
      box = el("span", "kr-zones");
      box.setAttribute("aria-hidden", "true");
      water.insertBefore(box, water.firstChild);
    }
    const sig = `${compact ? "c" : "v"}${scale}`;
    if (box.dataset.sig === sig) return;
    box.dataset.sig = sig;
    box.replaceChildren();
    window.KrFlavour.zoneBands(scale).forEach((z) => {
      const band = el("span", `kr-zone kr-zone-${z.id}`);
      band.style.setProperty(compact ? "left" : "top", `${z.start}%`);
      band.style.setProperty(compact ? "width" : "height", `${z.size}%`);
      box.appendChild(band);
    });
  }

  /** The vertical ruler: 0 m, the zone milestones that fit, and the bottom of the scale. */
  function paintRuler(axis, scale) {
    const ruler = el("div", "kr-reef-ruler");
    axis.replaceChildren(ruler);
    const tall = ruler.clientHeight || 100;
    const marks = [{ at: 0, label: "0 m" }].concat(window.KrFlavour.milestones(scale))
      .concat([{ at: 100, label: `${window.KrView.numberText(scale)} m`, end: true }]);
    let last = -Infinity;
    marks.forEach((m, i) => {
      const px = (m.at / 100) * tall;
      const roomBelow = m.end || ((100 - m.at) / 100) * tall >= 16;
      if (i > 0 && (px - last < 16 || !roomBelow)) return;
      const mark = el("span", `kr-ruler-mark${m.end ? " is-end" : ""}${m.metres ? " is-zone" : ""}`, m.label);
      mark.style.top = `${m.at}%`;
      ruler.appendChild(mark);
      last = px;
    });
    // The marks are positioned absolutely, so the ruler takes the width of the widest one itself.
    ruler.style.width = `${Math.ceil(Math.max(0, ...[...ruler.children].map((n) => n.offsetWidth)))}px`;
  }

  /** The compact reef's one-line key: the bar's full depth and the zone lines inside it. */
  function rulerText(scale) {
    const lines = window.KrFlavour.milestones(scale).map((m) => `${window.KrView.numberText(m.metres)} m (${m.mark})`);
    const full = `Full bar = ${window.KrView.numberText(scale)} m`;
    return lines.length ? `${full} · dashed lines at ${lines.join(", ")}` : full;
  }

  /* ============ The phone's depth gauge ============ */

  let gaugeShown = null;    // the depth the phone's gauge last drew, so a re-render does not re-sink

  /** Five equal zone bands with the diver at this depth; it sinks from the last depth drawn. */
  function gauge(metres, icon) {
    const F = window.KrFlavour;
    const box = el("div", "kr-gauge");
    box.setAttribute("aria-hidden", "true");
    F.ZONES.forEach((z) => box.appendChild(el("span", `kr-gauge-band kr-zone-${z.id}`)));
    const diver = make(icon, "kr-gauge-diver");
    const from = gaugeShown === null ? metres : gaugeShown;
    diver.style.top = `${F.gaugePosition(from)}%`;
    box.appendChild(diver);
    if (from !== metres && motionOK()) {
      // Once the card is on the page: flush the old position, then move, so the transition runs.
      window.setTimeout(() => {
        void diver.offsetWidth;
        diver.style.top = `${F.gaugePosition(metres)}%`;
        sink(diver);
      }, 30);
    } else diver.style.top = `${F.gaugePosition(metres)}%`;
    gaugeShown = metres;
    return box;
  }

  /* ============ The host's own picture ============ */

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("decode"));
      img.src = url;
    });
  }

  /** The smallest usable encoding of the canvas: PNG, or WebP where the browser can write it. */
  function encode(canvas) {
    const tries = [canvas.toDataURL("image/png"), canvas.toDataURL("image/webp", 0.9)]
      .filter((u) => /^data:image\/(png|webp);base64,/.test(u));   // a browser without WebP hands back PNG
    tries.sort((a, b) => a.length - b.length);
    return tries[0] || "";
  }

  const bytesOf = (dataUrl) => Math.floor(((dataUrl.length - dataUrl.indexOf(",") - 1) * 3) / 4);

  /** Read a picked file into a ≤ 96 × 96 data URL of ≤ 40 KB, or throw a plain-English Error. */
  async function readIcon(file) {
    if (!file) throw new Error("No picture was chosen.");
    if (!TYPES.test(file.type)) throw new Error("That file isn’t a PNG, JPEG, WebP or GIF picture.");
    if (file.size > FILE_BYTES) throw new Error("That picture is over 8 MB. Pick a smaller one.");
    const url = URL.createObjectURL(file);
    let img;
    try {
      img = await loadImage(url);
    } catch (err) {
      throw new Error("That picture couldn’t be opened — it may be damaged or not really an image.");
    } finally {
      URL.revokeObjectURL(url);
    }
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h) throw new Error("That picture has no size, so it can’t be used.");
    const k = Math.min(1, ICON_SIDE / Math.max(w, h));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(w * k));
    canvas.height = Math.max(1, Math.round(h * k));
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    const out = encode(canvas);
    if (!out) throw new Error("That picture couldn’t be converted. Try a PNG or a JPEG.");
    if (bytesOf(out) > ICON_BYTES) {
      throw new Error("Even shrunk to 96 × 96 that picture is over 40 KB. Try a simpler one with fewer colours.");
    }
    if (!window.KrCore.cleanIcon(out)) throw new Error("That picture couldn’t be converted. Try a PNG or a JPEG.");
    return out;
  }

  function iconMessage(text, bad) {
    const node = $("kr-icon-msg");
    if (!node) return;
    node.textContent = text;
    node.classList.toggle("kr-warn-text", !!bad);
  }

  function onIconFile(event) {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (!file) return;
    iconMessage("Shrinking your picture…", false);
    readIcon(file).then((icon) => {
      window.KrApp.setIcon(icon);
      iconMessage(`Your picture dives for everyone (${Math.ceil(bytesOf(icon) / 1024)} KB).`, false);
    }).catch((err) => iconMessage(err.message, true));
  }

  function wireSetup() {
    const input = $("kr-icon-file");
    if (!input || input.dataset.wired) return;
    input.dataset.wired = "1";
    input.addEventListener("change", onIconFile);
    $("btn-icon-upload").addEventListener("click", () => input.click());
    $("btn-icon-default").addEventListener("click", () => {
      window.KrApp.setIcon("");
      iconMessage("The krill is back on duty.", false);
    });
  }

  /** Repaint a diver slot only when the icon changes (so it never flickers on re-render). */
  function paintSlot(node, icon, extraClass) {
    if (!node) return false;
    const sig = icon ? `i${icon.length}:${icon.slice(-24)}` : "krill";
    if (node.dataset.sig === sig) return false;
    node.dataset.sig = sig;
    node.replaceChildren(make(icon, extraClass));
    return true;
  }

  function paintSetup(state) {
    const icon = window.KrCore.brandOfSettings(state.setup.settings).icon || "";
    paintSlot($("kr-icon-preview"), icon, "kr-diver-preview");
    const reset = $("btn-icon-default");
    if (reset) reset.disabled = !icon;
  }

  return {
    make, krill, sink, bubbles, flourish, motionOK, paintZones, paintRuler, rulerText, gauge, paintSlot,
    readIcon, wireSetup, paintSetup, ICON_SIDE, ICON_BYTES,
  };
})();

window.KrDiver = KrDiver;
