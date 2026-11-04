/* ============================================================
   Deep Cut — Puffer Party rendering
   The ring of seats with the puffer at the holder, the shrinking
   clock in the middle, the used-answers list, the judge's live
   ruling on an off-list answer, hearts, meter and elimination.
   Reads the app state, writes the DOM through textContent only;
   every button calls back into window.KrApp.
   Hearts are drawn as CSS dots with the number in words beside
   them, so colour is never the only signal.
   ============================================================ */

"use strict";

const KrParty = (function () {
  const core = () => window.KrCore;
  const app = () => window.KrApp;

  const OVAL_MAX = 8;   // more seats than this and the oval's seats would touch

  /** Seat positions round an ellipse, the first seat at twelve o'clock. */
  function seatPosition(i, n) {
    const angle = (-90 + (360 * i) / n) * (Math.PI / 180);
    return { left: 50 + 36 * Math.cos(angle), top: 50 + 38 * Math.sin(angle) };
  }

  function heartsRow(hearts, max) {
    const row = el("span", "kr-hearts");
    row.setAttribute("aria-hidden", "true");
    for (let i = 0; i < max; i += 1) row.appendChild(el("span", `kr-heart${i < hearts ? " is-full" : ""}`));
    return row;
  }

  function renderRing(c) {
    const ring = $("kr-ring");
    [...ring.querySelectorAll(".kr-seat")].forEach((n) => n.remove());
    const seats = core().ring(c);
    // Many seats, or a narrow screen: a scrolling grid of small seats instead of the oval.
    const compact = window.KrView.isCompact(seats.length, OVAL_MAX);
    ring.classList.toggle("is-compact", compact);
    const max = c.game.settings.puffer.maxHearts;
    const need = c.game.settings.puffer.meterForHeart;
    seats.forEach((s, i) => {
      const seat = el("div", `kr-seat${s.holder ? " is-holder" : ""}${s.out ? " is-out" : ""}`);
      seat.dataset.pid = s.pid;
      seat.title = s.name;
      if (!compact) {
        const pos = seatPosition(i, seats.length);
        seat.style.left = `${pos.left}%`;
        seat.style.top = `${pos.top}%`;
      }
      seat.appendChild(el("span", "kr-seat-name", s.name));
      seat.appendChild(heartsRow(s.hearts, max));
      seat.appendChild(el("span", "kr-seat-status", s.out ? "out"
        : `${s.hearts} ${s.hearts === 1 ? "heart" : "hearts"} · ${s.meter}/${need}`));
      if (s.holder && !s.out) seat.appendChild(el("span", "kr-seat-status", "has the puffer"));
      seatDiver(c, s, seat);
      ring.appendChild(seat);
      if (compact && s.holder && seat.scrollIntoView) seat.scrollIntoView({ block: "nearest" });
    });
  }

  let lastPopKey = "";

  /** The holder carries the diver; the seat that just popped gets it with one gentle puff. */
  function seatDiver(c, s, seat) {
    const popped = c.phase === "popped" && c.puffer.popped === s.pid;
    if (!popped && !(s.holder && !s.out && c.phase !== "popped")) return;
    const diver = window.KrDiver.make(window.KrView.iconOf(window.KrApp.state()), "kr-seat-diver");
    seat.insertBefore(diver, seat.firstChild);
    if (!popped) return;
    const key = `${c.round}|${s.pid}|${c.history.length}`;
    if (key === lastPopKey) return;
    lastPopKey = key;
    window.KrDiver.flourish(diver, "is-pop");
  }

  function renderPending(c) {
    const pending = c.puffer.pending;
    show($("kr-pending"), !!pending && c.phase === "puffer");
    if (!pending) return;
    setText("kr-pending-text", `“${pending.text}” is not on the list. Your ruling:`);
    window.KrView.tierButtons($("kr-pending-tiers"), core().tiersOf(c), undefined,
      (tier) => app().dispatch({ type: "pufferJudge", tier }));
  }

  function renderUsed(c) {
    const list = $("kr-used");
    list.replaceChildren();
    c.puffer.used.forEach((u) => {
      const li = el("li", "kr-used-item");
      li.appendChild(el("span", "kr-used-text", u.text));
      li.appendChild(el("span", "kr-badge", window.KrView.tierName(c, u.tier)));
      if (!u.onList) li.appendChild(window.KrView.rememberButton(c, u.key, u.text));
      list.appendChild(li);
    });
    if (!c.puffer.used.length) list.appendChild(el("li", "kr-hint", "Nothing yet."));
    setText("kr-used-count", c.puffer.used.length ? String(c.puffer.used.length) : "");
  }

  function holderLine(c) {
    const name = core().nameOf(c, c.puffer.holder);
    if (c.phase === "pufferReady") return `${name} starts. Read the prompt, then start the clock.`;
    if (c.phase === "popped") return `${core().nameOf(c, c.puffer.popped)} popped.`;
    return `${name} has the puffer`;
  }

  function render(state) {
    const c = state.core;
    const floating = core().alive(c).length;
    const cap = c.game.settings.puffer.roundCap;
    setText("kr-pround", `Round ${c.round}${cap ? ` of ${cap}` : ""} · ${floating} still floating`
      + `${c.puffer.category ? ` · ${c.puffer.category}` : ""}`);
    setText("kr-ptext", c.puffer.text);
    setText("kr-pholder", holderLine(c));
    setText("kr-pnotice", c.puffer.notice ? c.puffer.notice.text : "");
    $("kr-pnotice").dataset.kind = c.puffer.notice ? c.puffer.notice.kind : "";
    renderRing(c);
    renderPending(c);
    renderUsed(c);
    const live = c.phase === "puffer";
    show($("btn-pstart"), c.phase === "pufferReady");
    show($("btn-pnext"), c.phase === "popped");
    show($("btn-pop"), live);
    show($("btn-ppause"), live);
    show($("kr-ptype-form"), live);
    const paused = c.clock && !Number.isFinite(c.clock.deadline);
    $("btn-ppause").textContent = paused ? "Resume the clock" : "Pause the clock";
    $("btn-pundo").disabled = !c.history.length;
    if (!live) setText("kr-pclock", c.phase === "popped" ? "Pop" : String(c.game.settings.puffer.startSeconds));
  }

  return { render, seatPosition };
})();

window.KrParty = KrParty;
