/* ============================================================
   Deep Cut — in-page prompt editor
   Build or tweak a prompt file: settings, a prompt list, and for
   the selected prompt a rated-answer table (answer · aliases ·
   tier). Download it as prompts.json, download it ready for the
   repo's set library, fold the judge's "Add to this question"
   answers back in (Import judged answers), or load it straight
   into the session. The draft auto-saves under its own key.
   Everything is built with createElement/textContent.
   ============================================================ */

"use strict";

const KR_DRAFT_KEY = `kk-draft-v1${window.KrApp && window.KrApp.storeSuffix ? window.KrApp.storeSuffix() : ""}`;

let krDraft = null;
let krEdIndex = 0;

/* ============ Draft plumbing ============ */

const krCopy = (v) => JSON.parse(JSON.stringify(v));

function krBlankPrompt() {
  return { text: "Name a …", category: "", answers: [] };
}

function krBlankDraft() {
  const d = window.KrCore.DEFAULT_SETTINGS;
  return {
    title: "My prompts",
    settings: { mode: d.mode, promptSeconds: d.promptSeconds, promptsPerGame: d.promptsPerGame,
      brand: Object.assign({}, window.KrCore.DEFAULT_BRAND),
      tiers: window.KrCore.TIERS.map((t) => Object.assign({}, t)), puffer: Object.assign({}, d.puffer) },
    prompts: [krBlankPrompt()],
  };
}

function krSaveDraft() {
  try {
    localStorage.setItem(KR_DRAFT_KEY, JSON.stringify(krDraft));
  } catch (err) {
    console.warn("Could not save the editor draft:", err);
    krEditorMessage("This browser can’t auto-save the draft. Use Download JSON to keep your work.");
  }
}

function krLoadDraft() {
  try {
    const raw = localStorage.getItem(KR_DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (!draft || !Array.isArray(draft.prompts) || !draft.prompts.length) return null;
    if (!draft.settings || typeof draft.settings !== "object") draft.settings = krBlankDraft().settings;
    return window.KrCore.upgradeGame(draft);
  } catch (err) {
    console.warn("Ignoring a corrupt editor draft:", err);
    return null;
  }
}

function krEditorMessage(message) {
  const node = $("kr-editor-msg");
  if (!node) return;
  node.textContent = message || "";
  show(node, !!message);
}

/** The draft's tiers as typed (names may be half-edited); the defaults when the file has none. */
function krEdTiers() {
  try {
    return window.KrCore.normalizeSettings(krDraft.settings, { lenient: true }).tiers;
  } catch (err) {
    return window.KrCore.settingsOf(krDraft).tiers;
  }
}

/** Make sure the draft carries an explicit brand and tier list, so Download JSON exports them. */
function krEnsureNaming() {
  const s = krDraft.settings;
  try {
    const lenient = window.KrCore.normalizeSettings(s, { lenient: true });
    s.brand = lenient.brand;
    s.tiers = lenient.tiers;
  } catch (err) {
    if (!s.brand || typeof s.brand !== "object") s.brand = Object.assign({}, window.KrCore.DEFAULT_BRAND);
    s.tiers = window.KrCore.settingsOf(krDraft).tiers;
  }
}

function krCurrent() {
  if (krEdIndex >= krDraft.prompts.length) krEdIndex = krDraft.prompts.length - 1;
  if (krEdIndex < 0) krEdIndex = 0;
  return krDraft.prompts[krEdIndex];
}

/** One prompt checked on its own, so the list can flag the bad ones. */
function krPromptProblem(p) {
  try {
    return window.KrCore.promptProblem(p, krDraft.settings);
  } catch (err) {
    return err.message;
  }
}

/** A text edit: persist and re-check, but never repaint the field the caret is in. */
function krTouchDraft() {
  krSaveDraft();
  krRenderList();
  krRenderWarnings();
}

/* ============ Rendering ============ */

function krRenderSettings() {
  const s = krDraft.settings;
  $("kr-ed-title").value = krDraft.title || "";
  $("kr-ed-mode").value = s.mode === "puffer" ? "puffer" : "deepDive";
  $("kr-ed-seconds").value = String(s.promptSeconds || 30);
  $("kr-ed-prompts").value = String(s.promptsPerGame || 7);
  krRenderNaming();
}

function krNumberField(label, value, onChange) {
  const input = el("input", "kr-field");
  input.type = "number";
  input.min = "0";
  input.max = "10000";
  input.value = String(value);
  input.setAttribute("aria-label", label);
  input.addEventListener("change", () => onChange(Number(input.value)));
  return input;
}

/** Game name, tagline, and a name + points field per tier. */
function krRenderNaming() {
  krEnsureNaming();
  const s = krDraft.settings;
  $("kr-ed-brand-name").value = s.brand.name || "";
  $("kr-ed-brand-tagline").value = s.brand.tagline || "";
  const box = $("kr-ed-tiers");
  box.replaceChildren();
  s.tiers.forEach((t, i) => {
    const row = el("div", "kr-tier-row");
    const name = el("input", "kr-field");
    name.type = "text";
    name.maxLength = window.KrCore.TIER_NAME_MAX;
    name.value = t.name || "";
    name.setAttribute("aria-label", `Name of tier ${i + 1}`);
    name.addEventListener("input", () => { t.name = name.value; krTouchDraft(); krRenderPrompt(); });
    row.appendChild(name);
    row.appendChild(krNumberField(`Points for tier ${i + 1}`, t.points, (n) => { t.points = n; krTouchDraft(); }));
    box.appendChild(row);
  });
}

function krRenderList() {
  const list = $("kr-ed-list");
  list.replaceChildren();
  krDraft.prompts.forEach((p, i) => {
    const li = el("li");
    const b = el("button", krPromptProblem(p) ? "kr-ed-bad" : "", `${i + 1}. ${p.text || "(no text)"} — ${(p.answers || []).length}`);
    b.type = "button";
    b.setAttribute("aria-current", String(i === krEdIndex));
    b.addEventListener("click", () => { krEdIndex = i; krRenderEditor(); });
    li.appendChild(b);
    list.appendChild(li);
  });
  setText("kr-ed-count", String(krDraft.prompts.length));
}

function krTierSelect(entry) {
  const select = el("select", "kr-field");
  select.setAttribute("aria-label", "Tier");
  krEdTiers().forEach((t) => {
    const o = el("option", null, t.name || t.id);
    o.value = t.id;
    select.appendChild(o);
  });
  select.value = entry.tier || krEdTiers()[0].id;
  if (!entry.tier) entry.tier = select.value;
  select.addEventListener("change", () => { entry.tier = select.value; krTouchDraft(); });
  return select;
}

function krAnswerRow(entry, i, prompt) {
  const tr = el("tr");
  const text = el("input", "kr-field");
  text.maxLength = 40;
  text.value = entry.text || "";
  text.setAttribute("aria-label", `Answer ${i + 1}`);
  text.addEventListener("input", () => { entry.text = text.value; krTouchDraft(); });
  const aliases = el("input", "kr-field");
  aliases.value = (entry.aliases || []).join(", ");
  aliases.setAttribute("aria-label", `Aliases for answer ${i + 1}`);
  aliases.addEventListener("input", () => {
    const list = aliases.value.split(",").map((a) => a.trim()).filter(Boolean);
    if (list.length) entry.aliases = list;
    else delete entry.aliases;
    krTouchDraft();
  });
  const rm = el("button", "kr-btn kr-btn-quiet kr-btn-sm", "Remove");
  rm.type = "button";
  rm.setAttribute("aria-label", `Remove answer ${i + 1}`);
  rm.addEventListener("click", () => { prompt.answers.splice(i, 1); krSaveDraft(); krRenderEditor(); });
  [text, aliases, krTierSelect(entry), rm].forEach((node) => {
    const td = el("td");
    td.appendChild(node);
    tr.appendChild(td);
  });
  return tr;
}

function krRenderPrompt() {
  const p = krCurrent();
  if (!Array.isArray(p.answers)) p.answers = [];
  $("kr-ed-text").value = p.text || "";
  $("kr-ed-category").value = p.category || "";
  const body = $("kr-ed-answers");
  body.replaceChildren();
  p.answers.forEach((entry, i) => body.appendChild(krAnswerRow(entry, i, p)));
  setText("kr-ed-answer-count", String(p.answers.length));
  $("btn-ed-del-prompt").disabled = krDraft.prompts.length <= 1;
}

function krRenderWarnings() {
  const node = $("kr-editor-warn");
  const here = krPromptProblem(krCurrent());
  try {
    window.KrCore.validateGame(krDraft);
    const warnings = window.KrCore.warningsFor(krDraft);
    node.textContent = warnings.length ? warnings.join(" ") : "This file is ready to play.";
    krEditorMessage("");
  } catch (err) {
    node.textContent = here ? `${here}` : "";
    krEditorMessage(`Not playable yet: ${err.message}`);
  }
}

function krRenderEditor() {
  if (!krDraft) return;
  krRenderSettings();
  krRenderList();
  krRenderPrompt();
  krRenderWarnings();
}

/* ============ Downloads ============ */

function krDownloadJson(name) {
  const blob = new Blob([JSON.stringify(krDraft, null, 1)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function krCheckedDraft() {
  try {
    window.KrCore.validateGame(krDraft);
    return true;
  } catch (err) {
    krEditorMessage(`Fix this before downloading: ${err.message}`);
    return false;
  }
}

function krSlug(title) {
  const slug = String(title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  return `${slug || "my-set"}.json`;
}

/** docs/19 §2: static hosting cannot write files — a download plus the exact manifest line. */
function krEditorLibrary() {
  if (!krCheckedDraft()) return;
  const file = krSlug(krDraft.title);
  krDownloadJson(file);
  const entry = {
    file, name: window.KrCore.cleanText(krDraft.title, 60) || "My set",
    description: "Describe this set in a sentence.", by: "you",
    counts: { prompts: krDraft.prompts.length,
      "rated answers": krDraft.prompts.reduce((n, p) => n + p.answers.length, 0) },
  };
  $("kr-editor-manifest").textContent = [
    `1. Save the download as  sets/${file}`,
    "2. Add this entry to the list in  sets/index.json :", "",
    JSON.stringify(entry, null, 2), "",
    "3. Commit both files. The set then shows up in the picker on the setup screen.",
  ].join("\n");
  show($("kr-editor-manifest"), true);
  krEditorMessage("");
}

/** Every "Add to this question" the judge made this session, folded into the draft. */
function krEditorImport() {
  const app = window.KrApp.state();
  const learned = (app.learnedLog || []).concat(app.core ? app.core.learned : [])
    .concat(app.resumable ? app.resumable.learned : []);
  if (!learned.length) {
    krEditorMessage("");
    $("kr-editor-warn").textContent = "No judged answers yet. In a game, rule an off-list answer and press “Add to this question”.";
    return;
  }
  const before = krDraft.prompts.reduce((n, p) => n + (p.answers || []).length, 0);
  krDraft = window.KrCore.applyLearned(krDraft, learned);
  const added = krDraft.prompts.reduce((n, p) => n + (p.answers || []).length, 0) - before;
  krSaveDraft();
  krRenderEditor();
  $("kr-editor-warn").textContent = added
    ? `Imported ${added} judged ${added === 1 ? "answer" : "answers"} into their prompts.`
    : "Those judged answers are already on their prompts.";
}

/* ============ Actions ============ */

function krEditorUse() {
  try {
    window.KrApp.useEditorGame(krCopy(krDraft));
    krCloseEditor();
  } catch (err) {
    krEditorMessage(`This file can’t be used yet: ${err.message}`);
  }
}

function krStartingDraft() {
  const app = window.KrApp.state();
  if (app.game) return krCopy(app.game);
  if (globalThis.KR_DEFAULT_GAME) return krCopy(globalThis.KR_DEFAULT_GAME);
  return krBlankDraft();
}

let krSyncedNaming = "";

/**
 * Keep the editor and the setup screen showing the same names. A fresh draft is
 * seeded from the setup; an existing one is overwritten only when the setup's
 * naming changed since the editor last looked (so editor edits survive a reopen).
 */
function krSyncNaming(fresh) {
  const setup = window.KrApp.state().setup;
  const sig = JSON.stringify([setup.settings.brand, setup.settings.tiers.map((t) => [t.id, t.name])]);
  if (fresh || (setup.namesTouched && sig !== krSyncedNaming)) {
    krDraft = window.KrCore.withNaming(krDraft, setup.settings);
    krSaveDraft();
  }
  krSyncedNaming = sig;
}

function krOpenEditor() {
  let built = false;
  if (!krDraft) {
    const saved = krLoadDraft();
    built = !saved;
    krDraft = saved || krStartingDraft();
  }
  krSyncNaming(built);
  window.KrApp.set({ editorOpen: true });
  krRenderEditor();
}

function krCloseEditor() {
  window.KrApp.set({ editorOpen: false });
}

function krWireEditorFields() {
  $("kr-ed-title").addEventListener("input", (e) => { krDraft.title = e.target.value; krTouchDraft(); });
  $("kr-ed-mode").addEventListener("change", (e) => { krDraft.settings.mode = e.target.value; krTouchDraft(); });
  [["kr-ed-seconds", "promptSeconds"], ["kr-ed-prompts", "promptsPerGame"]].forEach(([id, key]) => {
    $(id).addEventListener("change", (e) => { krDraft.settings[key] = Number(e.target.value); krTouchDraft(); });
  });
  $("kr-ed-brand-name").addEventListener("input", (e) => { krDraft.settings.brand.name = e.target.value; krTouchDraft(); });
  $("kr-ed-brand-tagline").addEventListener("input", (e) => { krDraft.settings.brand.tagline = e.target.value; krTouchDraft(); });
  $("kr-ed-text").addEventListener("input", (e) => { krCurrent().text = e.target.value; krTouchDraft(); });
  $("kr-ed-category").addEventListener("input", (e) => { krCurrent().category = e.target.value; krTouchDraft(); });
  $("btn-ed-add-answer").addEventListener("click", () => {
    krCurrent().answers.push({ text: "", tier: krEdTiers()[0].id });
    krSaveDraft();
    krRenderEditor();
    const rows = $("kr-ed-answers").querySelectorAll("tr");
    if (rows.length) rows[rows.length - 1].querySelector("input").focus();
  });
  $("btn-ed-add-prompt").addEventListener("click", () => {
    krDraft.prompts.splice(krEdIndex + 1, 0, krBlankPrompt());
    krEdIndex += 1;
    krSaveDraft();
    krRenderEditor();
  });
  $("btn-ed-del-prompt").addEventListener("click", () => {
    if (krDraft.prompts.length <= 1) return;
    krDraft.prompts.splice(krEdIndex, 1);
    krSaveDraft();
    krRenderEditor();
  });
}

function krWireEditor() {
  $("btn-editor").addEventListener("click", krOpenEditor);
  $("btn-editor-close").addEventListener("click", krCloseEditor);
  $("btn-editor-download").addEventListener("click", () => {
    if (krCheckedDraft()) { krDownloadJson("prompts.json"); krEditorMessage(""); }
  });
  $("btn-editor-library").addEventListener("click", krEditorLibrary);
  $("btn-editor-import").addEventListener("click", krEditorImport);
  $("btn-editor-use").addEventListener("click", krEditorUse);
  $("btn-editor-reset").addEventListener("click", () => {
    krDraft = krCopy(globalThis.KR_DEFAULT_GAME || krBlankDraft());
    krEdIndex = 0;
    krSaveDraft();
    krRenderEditor();
  });
  $("btn-editor-blank").addEventListener("click", () => {
    krDraft = krBlankDraft();
    krEdIndex = 0;
    krSaveDraft();
    krRenderEditor();
  });
  krWireEditorFields();
}

if (!(window.GSC && window.GSC.mode && window.GSC.mode.endsWith("-player"))) {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", krWireEditor);
  else krWireEditor();
}

window.KrEditor = {
  open: krOpenEditor,
  close: krCloseEditor,
  draft: () => krDraft,
  select: (i) => { krEdIndex = i; krRenderEditor(); },
  setDraft: (draft) => { krDraft = draft; krEdIndex = 0; krSaveDraft(); krRenderEditor(); },
  slug: krSlug,
  DRAFT_KEY: KR_DRAFT_KEY,
};
