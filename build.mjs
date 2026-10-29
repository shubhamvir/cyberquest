// Builds both targets from one source:
//   public/index.html (+ sw.js, manifest) for Netlify, and dist/cyberquest-artifact.html as a single-file build.
// Also generates netlify/lib/cqc.mjs and netlify/lib/bank.mjs so the scores function can
// re-check Monthly Challenge runs against the same question set and answers.
// The build fails if any question is missing a proper explanation or has duplicate options.
import fs from "node:fs";
import path from "node:path";
const root = path.dirname(new URL(import.meta.url).pathname);
const rd = (p) => fs.readFileSync(path.join(root, p), "utf8");
const jsIn = (dir) => (fs.existsSync(path.join(root, dir)) ? fs.readdirSync(path.join(root, dir)).filter((f) => f.endsWith(".js")).sort() : []);

const cqcSrc = rd("src/challenge.js");
// QX entries add junior-level questions to existing modules; they are merged into QB with a "j" tag.
const MERGE = `(function () { var ix = {}; QB.forEach(function (m) { ix[m.id] = m; }); QX.forEach(function (x) { var m = ix[x.m]; if (!m) throw new Error("QX: unknown module " + x.m); x.q.forEach(function (q) { m.q.push(q.length === 4 ? q.concat(["j"]) : q); }); }); QX.length = 0; })();`;
const data = "var QB = [];\nvar QX = [];\nvar CASES = [];\nvar LEARN = [];\n" + jsIn("data").map((f) => rd("data/" + f)).join("\n") + "\n" + MERGE;
const packs = "var QB_PACKS = [];\n" + jsIn("data/packs").map((f) => rd("data/packs/" + f)).join("\n");

// ---- validate content (same rules the app applies to live packs) ----
const CQC = new Function(cqcSrc + "\nreturn CQC;")();
const env = new Function("CQC", data + "\n" + packs + "\nreturn { QB, QB_PACKS, STAR, CASES, LEARN };")(CQC);
const problems = [];
const okStr = (v) => typeof v === "string" && v.trim().length > 0 && v.length < 600;
const QI = {};
for (const m of env.QB) {
  m.q.forEach((q, i) => {
    const [t, a, w, e, lvl] = q;
    if (q.length > 5 || (q.length === 5 && lvl !== "j")) problems.push(`${m.id}#${i}: bad level tag`);
    if (![t, a, e].every(okStr) || !Array.isArray(w) || w.length !== 3 || !w.every(okStr)) problems.push(`${m.id}#${i}: malformed`);
    else if (new Set([a, ...w]).size !== 4) problems.push(`${m.id}#${i}: duplicate options`);
    if (!okStr(e) || e.trim().length < 40) problems.push(`${m.id}#${i}: explanation missing or too short`);
    const id = CQC.qid(m.id, t);
    if (QI[id]) problems.push(`${m.id}#${i}: duplicate question`);
    QI[id] = { m: m.id, a, j: lvl === "j" };
  });
}
const modIds = new Set(env.QB.map((m) => m.id));
const packIds = {};
for (const p of env.QB_PACKS) {
  if (!/^\d{4}-\d{2}$/.test(p.month || "") || !Array.isArray(p.questions)) { problems.push(`pack ${p.month}: malformed`); continue; }
  p.questions.forEach((x, i) => {
    const where = `pack ${p.month}#${i}`;
    if (!modIds.has(x.m) || x.m === "starq") return problems.push(`${where}: unknown module ${x.m}`);
    if (![x.q, x.a, x.e].every(okStr) || !Array.isArray(x.w) || x.w.length !== 3 || !x.w.every(okStr)) return problems.push(`${where}: malformed`);
    if (new Set([x.a, ...x.w]).size !== 4) return problems.push(`${where}: duplicate options`);
    if (x.e.trim().length < 40) return problems.push(`${where}: explanation too short`);
    if (x.lvl !== undefined && x.lvl !== "j" && x.lvl !== "a") return problems.push(`${where}: lvl must be "j" or "a"`);
    const id = CQC.qid(x.m, x.q);
    if (QI[id]) return problems.push(`${where}: duplicates an existing question`);
    QI[id] = { m: x.m, a: x.a, j: x.lvl === "j" };
    (packIds[p.month] = packIds[p.month] || []).push(id);
  });
}
// Case files: every step needs 4 distinct options, exactly one best move (grade 2) and an explanation for each.
const caseIds = new Set();
for (const c of env.CASES) {
  const w = `case ${c.id}`;
  if (!/^[a-z0-9-]{2,30}$/.test(c.id || "") || caseIds.has(c.id)) problems.push(`${w}: bad or duplicate id`);
  caseIds.add(c.id);
  if (!modIds.has(c.m)) problems.push(`${w}: unknown module ${c.m}`);
  if (![c.title, c.area, c.role, c.brief, c.help, c.tell].every(okStr)) problems.push(`${w}: missing text`);
  if (!Array.isArray(c.lessons) || c.lessons.length < 2 || !c.lessons.every(okStr)) problems.push(`${w}: needs lessons`);
  if (!Array.isArray(c.steps) || c.steps.length < 3) { problems.push(`${w}: needs at least 3 steps`); continue; }
  c.steps.forEach((st, i) => {
    if (![st.ev, st.ask].every(okStr) || (st.log && (!Array.isArray(st.log) || !st.log.every(okStr)))) problems.push(`${w}#${i}: malformed step`);
    if (!Array.isArray(st.o) || st.o.length !== 4) return problems.push(`${w}#${i}: needs 4 options`);
    if (st.o.filter((o) => o[0] === 2).length !== 1) problems.push(`${w}#${i}: needs exactly one best option`);
    if (new Set(st.o.map((o) => o[1])).size !== 4) problems.push(`${w}#${i}: duplicate options`);
    st.o.forEach((o, k) => { if (![0, 1, 2].includes(o[0]) || !okStr(o[1]) || !okStr(o[2]) || o[2].trim().length < 40) problems.push(`${w}#${i}.${k}: option needs a grade, text and explanation`); });
  });
}
// Learn sheets: known block types, valid module, non-empty text, icons resolve later in the app.
const LBT = new Set(["split", "lead", "steps", "table", "list", "callout", "grid", "flow", "note", "timeline"]);
const learnIds = new Set();
function checkBlocks(blocks, w) {
  if (!Array.isArray(blocks)) return problems.push(`${w}: blocks must be an array`);
  for (const b of blocks) {
    if (!b || !LBT.has(b.t)) { problems.push(`${w}: bad block ${b && b.t}`); continue; }
    if (b.t === "split") { if (!Array.isArray(b.cols) || !b.cols.length) problems.push(`${w}: split needs cols`); else b.cols.forEach((c) => checkBlocks(c.blocks, w + ">" + (c.title || "col"))); }
    if (b.t === "table" && (!Array.isArray(b.head) || !Array.isArray(b.rows) || b.rows.some((r) => r.length !== b.head.length))) problems.push(`${w}: table rows must match head width`);
    if ((b.t === "list" || b.t === "steps") && (!Array.isArray(b.items) || !b.items.length)) problems.push(`${w}: ${b.t} needs items`);
    if (b.t === "grid" && (!Array.isArray(b.items) || b.items.some((i) => !okStr(i.name) || !okStr(i.text)))) problems.push(`${w}: grid items need name and text`);
    if (b.t === "flow" && (!Array.isArray(b.items) || b.items.some((i) => !Array.isArray(i) || i.length < 2))) problems.push(`${w}: flow items need [icon,title,sub?]`);
    if (b.t === "timeline" && (!Array.isArray(b.items) || b.items.some((i) => i.length < 3))) problems.push(`${w}: timeline items need [when,title,text]`);
  }
}
for (const sheet of env.LEARN) {
  const w = `learn ${sheet.id}`;
  if (!/^[a-z0-9-]{2,40}$/.test(sheet.id || "") || learnIds.has(sheet.id)) problems.push(`${w}: bad or duplicate id`);
  learnIds.add(sheet.id);
  if (!modIds.has(sheet.m)) problems.push(`${w}: unknown module ${sheet.m}`);
  if (!["fund", "defend", "respond", "offense", "cloudid", "toolkit", "grc", "ics"].includes(sheet.track)) problems.push(`${w}: unknown track ${sheet.track}`);
  if (![sheet.title, sheet.sub, sheet.c].every(okStr)) problems.push(`${w}: missing text`);
  checkBlocks(sheet.blocks, w);
}
if (problems.length) { console.error("Content problems:\n" + problems.join("\n")); process.exit(1); }

// ---- pages ----
const shell = rd("src/shell.html");
const app = rd("src/app.js");
const build = Date.now().toString(36);
const safe = (js) => js.replace(/<\/(script)/gi, "<\\/$1").replace(/<!--/g, "<\\!--");
const make = (mode) => shell.replace("__MODE__", mode).replace("/*__CQC__*/", () => safe(cqcSrc)).replace("/*__DATA__*/", () => safe(data + "\n" + packs)).replace("/*__APP__*/", () => safe(app));

const head = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="Cybersecurity MCQ drills, a monthly 50-question challenge with a scoreboard, spaced review and a STAR interview coach.">
<meta name="theme-color" content="#0F1A2B">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="CyberQuest">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:0}[hidden]{display:none!important}img{max-width:100%}</style>
</head>
<body>
`;
fs.writeFileSync(path.join(root, "public/index.html"), head + make("web") + "\n</body>\n</html>\n");
fs.writeFileSync(path.join(root, "public/sw.js"), rd("src/sw.js").replace("__BUILD__", build));
fs.copyFileSync(path.join(root, "src/manifest.webmanifest"), path.join(root, "public/manifest.webmanifest"));

// ---- server-side helpers for Netlify Functions ----
const lib = (f) => path.join(root, "netlify/lib", f);
const mods = {};
for (const m of env.QB) if (m.id !== "starq") mods[m.id] = { name: m.name, code: m.code, blurb: m.blurb };
fs.writeFileSync(lib("modules.mjs"), "// Generated by build.mjs. Module names used in reminder notifications.\nexport default " + JSON.stringify(mods, null, 1) + ";\n");
fs.writeFileSync(lib("cqc.mjs"), "// Generated by build.mjs from src/challenge.js. Do not edit here.\n" + cqcSrc + "\nexport default CQC;\n");
// The Monthly Challenge draws from junior-level questions only (core and this month's pack).
const bank = { modules: {}, packs: {}, answers: {} };
for (const m of env.QB) if (m.id !== "starq") bank.modules[m.id] = m.q.filter((q) => q[4] === "j").map((q) => CQC.qid(m.id, q[0]));
for (const [month, ids] of Object.entries(packIds)) bank.packs[month] = ids.filter((id) => QI[id].j);
for (const [id, v] of Object.entries(QI)) if (v.m !== "starq") bank.answers[id] = CQC.hashInt(v.a);
fs.writeFileSync(lib("bank.mjs"), "// Generated by build.mjs. Question ids and answer hashes for checking challenge runs.\nexport default " + JSON.stringify(bank) + ";\n");

// ---- single-file build page (no document skeleton) ----
fs.mkdirSync(path.join(root, "dist"), { recursive: true });
fs.writeFileSync(path.join(root, "dist/cyberquest-artifact.html"), make("artifact"));
const qn = env.QB.reduce((a, m) => a + m.q.length, 0);
const jn = env.QB.reduce((a, m) => a + (m.id === "starq" ? 0 : m.q.filter((q) => q[4] === "j").length), 0);
const pn = Object.values(packIds).reduce((a, l) => a + l.length, 0);
console.log(`built ${build}: ${env.QB.length} modules, ${qn} core questions (${jn} junior), ${pn} pack questions (${Object.keys(packIds).join(", ") || "none"}), ${env.STAR.prompts.length} STAR prompts, ${env.CASES.length} case files, ${env.LEARN.length} learn sheets`);
