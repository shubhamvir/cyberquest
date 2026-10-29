(function () {
"use strict";
const MODE = window.CQ_MODE === "artifact" ? "artifact" : "web";
const DAY = 864e5, HOUR = 36e5, MIN = 6e4;
const INTERVALS = [10 * MIN, DAY, 3 * DAY, 7 * DAY, 16 * DAY, 35 * DAY];
const DAILY_GOAL = 3;
const GROUP_ORDER = ["Foundations", "Defend & Detect", "Respond & Recover", "Offense & AppSec", "Cloud & Automation", "GRC · ISO 27001", "GRC · NIST", "GRC · GDPR", "GRC · SOC 2", "Risk & Compliance", "Specialist", "Career"];
const TITLES = ["Intern", "SOC Analyst I", "SOC Analyst II", "Security Analyst", "Senior Analyst", "Security Engineer", "GRC Lead", "Security Architect", "Head of Security", "CISO"];
const LEVELS = { junior: "Junior", mixed: "Mixed", advanced: "Advanced" };
const LEVEL_HELP = { junior: "Entry level, 0-2 years: core concepts, tools and day-to-day tasks.", mixed: "Every question in the bank, junior and advanced together.", advanced: "Senior-style questions: control numbers, edge cases, deeper scenarios." };
const MAX_FOCUS = 8;

// ---------- data index ----------
const MODULES = QB.slice().sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group));
const MOD = {}; const QI = {};
MODULES.forEach(m => { MOD[m.id] = m; m.packIds = []; m.ids = m.q.map(q => { const id = CQC.qid(m.id, q[0]); QI[id] = { m, q, j: q[4] === "j" }; return id; }); m.baseIds = m.ids.slice(); });
let TOTAL_Q = Object.keys(QI).length;

// Monthly question packs: bundled at build time (QB_PACKS) and, in the hosted single-file build, added live from the shared "packs" collection.
const PACKS = {};
const okStr = v => typeof v === "string" && v.trim().length > 0 && v.length < 600;
function addPack(p) {
  if (!p || !/^\d{4}-\d{2}$/.test(p.month || "") || !Array.isArray(p.questions)) return 0;
  const rec = PACKS[p.month] || (PACKS[p.month] = { month: p.month, title: okStr(p.title) ? p.title : CQC.monthLabel(p.month) + " pack", ids: [] });
  let n = 0;
  p.questions.forEach(x => {
    const m = x && MOD[x.m]; if (!m || m.id === "starq") return;
    if (![x.q, x.a, x.e].every(okStr) || x.e.trim().length < 40 || !Array.isArray(x.w) || x.w.length !== 3 || !x.w.every(okStr) || new Set([x.a].concat(x.w)).size !== 4) return;
    const id = CQC.qid(m.id, x.q); if (QI[id]) return;
    const q = [x.q, x.a, x.w, x.e];
    QI[id] = { m, q, j: x.lvl === "j", pack: p.month, tag: x.tag === "news" ? "news" : "", src: typeof x.src === "string" && /^https:\/\//.test(x.src) ? x.src : "" };
    m.q.push(q); m.ids.push(id); m.packIds.push(id); rec.ids.push(id); n++;
  });
  TOTAL_Q = Object.keys(QI).length;
  return n;
}
(typeof QB_PACKS !== "undefined" ? QB_PACKS : []).forEach(addPack);
// Case files: investigation scenarios (data/14-cases-*.js).
const CASE_LIST = typeof CASES !== "undefined" ? CASES : [];
const CASE = {}; CASE_LIST.forEach(c => { CASE[c.id] = c; });
function latestPack() { const ks = Object.keys(PACKS).filter(k => PACKS[k].ids.length && k <= CQC.monthKey()).sort(); return ks.length ? PACKS[ks[ks.length - 1]] : null; }
// Live connections (hosted build only): db handle, viewer id, and a promise that settles once live packs are loaded.
const LIVE = { db: null, uid: null };
let packsDone; LIVE.packsReady = new Promise(r => { packsDone = r; });
if (MODE === "web") packsDone();

// ---------- state ----------
// Web: each account has its own progress (server copy plus a cache on this device); guests keep
// progress on this device only. hosted build: progress lives in the viewer's own db subtree.
function freshState() {
  return { v: 1, created: Date.now(), updatedAt: 0, xp: 0, streak: { count: 0, best: 0, last: "" }, daily: { date: "", drills: 0 },
    q: {}, mod: {}, history: [], star: {}, cases: {}, learn: {}, settings: { perDrill: 10, timer: 0, playerName: "", level: "junior", focus: [] }, push: {}, runs: [] };
}
const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { } };
const lsDel = k => { try { localStorage.removeItem(k); } catch (e) { } };
const K = { legacy: "cyberquest.v1", guest: "cyberquest.guest", last: "cyberquest.last", mode: "cyberquest.mode", acct: uid => "cyberquest.u." + uid };
function normalise(st) {
  const out = Object.assign(freshState(), st || {});
  out.settings = Object.assign(freshState().settings, out.settings || {});
  if (!LEVELS[out.settings.level]) out.settings.level = "junior";
  if (!Array.isArray(out.settings.focus)) out.settings.focus = [];
  out.push = out.push || {}; delete out.sync; delete out.owner;
  if (!out.cases || typeof out.cases !== "object") out.cases = {};
  if (!out.learn || typeof out.learn !== "object") out.learn = {};
  return out;
}
function loadLocal(key) { const raw = lsGet(key); if (!raw) return freshState(); try { return normalise(JSON.parse(raw)); } catch (e) { return freshState(); } }
let LS_KEY = MODE === "artifact" ? K.legacy : K.guest;
let S = MODE === "artifact" ? loadLocal(LS_KEY) : freshState();

// Signed-in account (web). user: {uid, username, displayName}. expired: the server no longer accepts the session.
const ACC = { user: null, expired: false, invite: false, checked: false, offline: false };
const ART = { name: "" }; // hosted-build viewer's display name, when the page may read it
function displayName() { return MODE === "web" ? (ACC.user ? ACC.user.displayName : "Guest") : (ART.name || "Player"); }
function initialsOf(n) { const p = String(n || "").trim().split(/\s+/).filter(Boolean); if (!p.length) return "CQ"; return (p.length > 1 ? p[0][0] + p[p.length - 1][0] : p[0].slice(0, 2)).toUpperCase(); }

const store = { remote: null, writing: false, pending: false, timer: null, kind: "local" };
function save(immediate) {
  S.updatedAt = Date.now();
  lsSet(LS_KEY, JSON.stringify(S));
  clearTimeout(store.timer);
  store.timer = setTimeout(flushRemote, immediate ? 50 : 1500);
}
function compact(st) {
  const out = JSON.parse(JSON.stringify(st));
  if (out.history.length > 150) out.history = out.history.slice(-150);
  return out;
}
async function flushRemote() {
  if (!store.remote) return;
  if (store.writing) { store.pending = true; return; }
  store.writing = true;
  try { await store.remote.write(compact(S)); } catch (e) { console.warn("sync write failed", e && (e.code || e.message)); }
  store.writing = false;
  if (store.pending) { store.pending = false; flushRemote(); }
}
function adopt(remote) {
  if (remote && remote.v === 1 && (remote.updatedAt || 0) > (S.updatedAt || 0)) {
    S = normalise(remote);
    lsSet(LS_KEY, JSON.stringify(S));
    render(); return true;
  }
  return false;
}
async function initRemote() {
  if (MODE !== "artifact") return;
  if (!window.claude || !window.claude.use) { packsDone(); return; }
  try {
    const [db, user] = await Promise.all([window.claude.use("db"), window.claude.use("user")]);
    if (user) { try { const me = await user.me(); if (me && me.name) { ART.name = me.name; if (!S.settings.playerName) S.settings.playerName = me.name.slice(0, 24); renderSoft(); } } catch (e) { } }
    if (!db) { packsDone(); return; }
    LIVE.db = db; loadLivePacks();
    const uid = user ? await user.id() : null; LIVE.uid = uid; loadBoard(false);
    if (!uid) { render(); return; }
    const ref = db.doc("data/users/" + uid + "/progress");
    store.remote = { write: (d) => ref.set(d) }; store.kind = "account";
    const snap = await ref.get();
    const remote = snap.exists ? snap.data() : null;
    if (!adopt(remote) && S.updatedAt) flushRemote();
    render();
  } catch (e) { console.warn("db unavailable", e && e.code); packsDone(); }
}

// ---------- accounts (web) ----------
async function api(path, opts) {
  const o = Object.assign({ credentials: "same-origin", headers: {} }, opts || {});
  if (o.body && typeof o.body !== "string") { o.body = JSON.stringify(o.body); o.headers["content-type"] = "application/json"; }
  const r = await fetch(path, o);
  let j = {}; try { j = await r.json(); } catch (e) { }
  return { ok: r.ok, status: r.status, data: j };
}
function rememberAccount(u) { lsSet(K.last, JSON.stringify({ uid: u.uid, username: u.username, displayName: u.displayName })); }
function readLast() { try { const v = JSON.parse(lsGet(K.last) || "null"); return v && typeof v.uid === "string" && v.uid ? v : null; } catch (e) { return null; } }
const accountRemote = () => ({
  write: async (d) => {
    const r = await api("/api/me/progress", { method: "PUT", body: d });
    if (r.status === 409) { const g = await api("/api/me/progress"); if (g.ok && !g.data.empty) { S.updatedAt = 0; adopt(g.data); } return; }
    if (r.status === 401) { sessionEnded(); return; }
    if (!r.ok) throw new Error("HTTP " + r.status);
  }
});
function useAccount(u) {
  ACC.user = { uid: u.uid, username: u.username, displayName: u.displayName }; ACC.expired = false;
  LS_KEY = K.acct(u.uid); S = loadLocal(LS_KEY);
  rememberAccount(u); lsDel(K.mode);
  store.remote = accountRemote(); store.kind = "account";
}
function useGuest(remember) {
  ACC.user = null; LS_KEY = K.guest; S = loadLocal(LS_KEY);
  store.remote = null; store.kind = "local";
  if (remember) lsSet(K.mode, "guest");
}
function guestProgress() { const g = loadLocal(K.guest); return { st: g, n: Object.keys(g.q || {}).length }; }
// Pull the account's saved progress. If the account is brand new and this device has guest
// progress, offer to bring it over instead of silently mixing two people's data.
async function pullAccount(offerImport) {
  if (!ACC.user) return;
  let r;
  try { r = await api("/api/me/progress"); } catch (e) { ACC.offline = true; return; }
  ACC.offline = false;
  if (r.status === 401) { sessionEnded(); return; }
  if (!r.ok) return;
  const remote = r.data && !r.data.empty ? r.data : null;
  const g = guestProgress();
  if (!remote && offerImport && g.n > 0 && Object.keys(S.q).length === 0) { VIEW = { screen: "import", n: g.n, xp: g.st.xp || 0, next: VIEW }; render(); return; }
  if (!adopt(remote) && S.updatedAt && (!remote || (S.updatedAt > (remote.updatedAt || 0)))) flushRemote();
}
function sessionEnded() {
  if (!ACC.user || ACC.expired) return;
  ACC.expired = true; store.remote = null; toast("You've been signed out. Sign in again to keep saving to your account.");
  renderSoft();
}
let PENDING_ROUTE = { search: location.search, hash: location.hash };
async function afterSignIn(user, recovery, fresh) {
  useAccount(user);
  if (recovery) { VIEW = { screen: "recovery", code: recovery, fresh }; render(); return; }
  continueAfterAuth();
}
async function continueAfterAuth() {
  const then = AUTH_NEXT; AUTH_NEXT = null;
  VIEW = then === "cresult" && SESSION && SESSION.run ? { screen: "cresult" } : { screen: "home" };
  render(); window.scrollTo(0, 0);
  await pullAccount(true);
  if (VIEW.screen === "home" && PENDING_ROUTE) route();
  loadBoard(true);
}
let AUTH_NEXT = null;
function goAuth(tab, next) { AUTH_NEXT = next || null; VIEW = { screen: "auth", tab: tab || "signin" }; render(); window.scrollTo(0, 0); }
async function signOut() {
  if (S.push.enabled) { try { const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.getSubscription(); if (sub) { await api("/api/subscribe", { method: "DELETE", body: { endpoint: sub.endpoint } }); await sub.unsubscribe(); } } catch (e) { } }
  clearTimeout(store.timer); if (store.remote && !ACC.expired) { try { await flushRemote(); } catch (e) { } }
  try { await api("/api/auth/logout", { method: "POST", body: {} }); } catch (e) { }
  if (ACC.user) lsDel(K.acct(ACC.user.uid));
  lsDel(K.last); lsDel(K.mode);
  ACC.user = null; ACC.expired = false; store.remote = null; store.kind = "local"; SESSION = null; S = freshState(); LS_KEY = K.guest;
  BOARD.at = 0; VIEW = { screen: "auth", tab: "signin" }; render(); window.scrollTo(0, 0); toast("Signed out. Progress on this device was cleared.");
}
async function submitAuth(form) {
  const kind = form.dataset.form; const f = new FormData(form); const v = k => String(f.get(k) || "");
  const err = form.querySelector(".formerr"); const btn = form.querySelector('button[type="submit"]');
  const show = (msg, field) => { err.textContent = msg; err.hidden = !msg; if (field) { const el = form.querySelector('[name="' + field + '"]'); if (el) el.focus(); } };
  show("");
  if (kind === "signup" && v("password") !== v("password2")) { show("The two passwords don't match.", "password2"); return; }
  if ((kind === "reset" || kind === "password") && v("password") !== v("password2")) { show("The two new passwords don't match.", "password2"); return; }
  const body = kind === "signin" ? { username: v("username"), password: v("password") }
    : kind === "signup" ? { username: v("username"), displayName: v("displayName"), password: v("password"), invite: v("invite") }
    : kind === "reset" ? { username: v("username"), recovery: v("recovery"), password: v("password") }
    : kind === "password" ? { current: v("current"), password: v("password") }
    : kind === "profile" ? { displayName: v("displayName") }
    : kind === "delete" ? { password: v("password") } : null;
  if (!body) return;
  const path = "/api/auth/" + (kind === "signin" ? "login" : kind);
  const label = btn.textContent; btn.disabled = true; btn.textContent = "Please wait...";
  let r;
  try { r = await api(path, { method: "POST", body }); }
  catch (e) { btn.disabled = false; btn.textContent = label; show("Can't reach the server. Check your connection and try again."); return; }
  btn.disabled = false; btn.textContent = label;
  if (!r.ok) {
    if (r.status === 401 && (kind === "password" || kind === "profile" || kind === "delete") && !r.data.field) { sessionEnded(); }
    show(r.data.error || ("Something went wrong (" + r.status + ")."), r.data.field); return;
  }
  if (kind === "signin" || kind === "signup" || kind === "reset") { await afterSignIn(r.data.user, r.data.recovery, kind === "signup"); return; }
  if (kind === "profile") { ACC.user.displayName = r.data.user.displayName; rememberAccount(ACC.user); BOARD.at = 0; loadBoard(true); toast("Display name saved"); render(); return; }
  if (kind === "password") { form.reset(); toast("Password changed. Other devices were signed out."); return; }
  if (kind === "delete") { const uid = ACC.user.uid; lsDel(K.acct(uid)); lsDel(K.last); lsDel(K.mode); ACC.user = null; store.remote = null; S = freshState(); LS_KEY = K.guest; SESSION = null; VIEW = { screen: "auth", tab: "signup" }; render(); toast("Account deleted"); }
}
async function bootWeb() {
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => { });
  // Progress saved before accounts existed becomes this device's guest progress; it can be moved into an account later.
  const legacy = lsGet(K.legacy);
  if (legacy) { if (!lsGet(K.guest)) lsSet(K.guest, legacy); lsDel(K.legacy); }
  const last = readLast();
  if (last) { useAccount(last); route(); }
  else if (lsGet(K.mode) === "guest") { useGuest(false); route(); }
  else { VIEW = { screen: "loading" }; render(); }
  api("/api/auth/config").then(r => { if (r.ok) { ACC.invite = !!r.data.inviteRequired; if (VIEW.screen === "auth") renderSoft(); } }).catch(() => { });
  let me = null;
  try { me = await Promise.race([api("/api/auth/me"), new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 8000))]); }
  catch (e) { ACC.offline = true; }
  ACC.checked = true;
  if (me && me.ok) {
    const u = me.data.user;
    if (u) {
      if (!ACC.user || ACC.user.uid !== u.uid) { useAccount(u); route(); }
      else { ACC.user.displayName = u.displayName; rememberAccount(u); renderSoft(); }
      await pullAccount(true);
    } else if (ACC.user) {
      // Cookie gone or expired: show nothing from the old session until the player signs in again.
      lsDel(K.last); ACC.user = null; store.remote = null; S = freshState(); LS_KEY = K.guest; SESSION = null;
      VIEW = { screen: "auth", tab: "signin", note: "Your session ended. Sign in again to pick up where you left off." }; render();
    } else if (lsGet(K.mode) !== "guest") { VIEW = { screen: "auth", tab: "signin" }; render(); }
  } else if (!ACC.user && lsGet(K.mode) !== "guest") { VIEW = { screen: "auth", tab: "signin", note: "Can't reach the CyberQuest server right now. You can still play as a guest." }; render(); }
  loadBoard(false);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && ACC.user && !ACC.expired && !["quiz", "challenge"].includes(VIEW.screen)) pullAccount(false); });
}

// ---------- progress helpers ----------
const today = () => new Date().toLocaleDateString("en-CA");
function qs(id) { return S.q[id] || [0, 0, 0, 0, 0]; } // [box, seen, correct, due, last]
// Question level: "junior" (default) shows junior-tagged questions, "advanced" the rest, "mixed" everything.
function level() { return LEVELS[S.settings.level] ? S.settings.level : "junior"; }
function inLevel(id) { const l = level(); return l === "mixed" || (l === "junior") === !!QI[id].j; }
function poolIds(m) { const ids = m.ids.filter(inLevel); return ids.length ? ids : m.ids; }
function bankCount() { return MODULES.reduce((a, m) => a + (m.id === "starq" ? 0 : poolIds(m).length), 0); }
function focusSet() { return new Set((S.settings.focus || []).filter(id => MOD[id])); }
function modStats(m) {
  let seen = 0, mast = 0, due = 0, wrong = 0; const now = Date.now(); const ids = poolIds(m);
  ids.forEach(id => { const s = S.q[id]; if (s) { seen++; mast += Math.min(s[0], 4) / 4; if (s[3] <= now) due++; if (s[0] === 0) wrong++; } });
  return { seen, total: ids.length, mastery: mast / ids.length, due, wrong };
}
function levelFor(xp) { const lvl = Math.floor(Math.sqrt(xp / 60)) + 1; const cur = 60 * (lvl - 1) ** 2, nxt = 60 * lvl ** 2; return { lvl, title: TITLES[Math.min(lvl - 1, TITLES.length - 1)], pct: (xp - cur) / (nxt - cur), toNext: nxt - xp }; }
function accuracy() { let s = 0, c = 0; Object.values(S.q).forEach(v => { s += v[1]; c += v[2]; }); return s ? Math.round(100 * c / s) : 0; }
function answered() { let s = 0; Object.values(S.q).forEach(v => { s += v[1]; }); return s; }
function masteredCount() { return MODULES.filter(m => modStats(m).mastery >= 0.8).length; }
function dueTotal() { const now = Date.now(); return Object.entries(S.q).filter(([id, v]) => QI[id] && v[1] > 0 && v[3] <= now).length; }
function suggest() {
  const now = Date.now(); let best = null, bestScore = -1; const focus = focusSet();
  MODULES.forEach(m => {
    if (m.id === "starq") return;
    const st = modStats(m), ms = S.mod[m.id] || {};
    const since = ms.last ? (now - ms.last) / DAY : 30;
    let score = st.due * 2 + (1 - st.mastery) * 10 + Math.min(since, 14) * 0.6 + (focus.has(m.id) ? 3 : 0) + Math.random() * 1.5;
    if (st.seen === st.total && st.mastery > 0.9) score -= 8;
    if (score > bestScore) { bestScore = score; best = m; }
  });
  return best || MODULES[0];
}
function weakest(n) {
  return MODULES.filter(m => m.id !== "starq").map(m => ({ m, s: modStats(m) })).sort((a, b) => (a.s.mastery - b.s.mastery) || (b.s.due - a.s.due)).slice(0, n).map(x => x.m.id);
}

// ---------- session / quiz ----------
let SESSION = null; let VIEW = { screen: "home" };
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function buildItem(id) {
  const q = QI[id].q; const opts = shuffle([q[1]].concat(q[2]));
  return { id, opts, correct: opts.indexOf(q[1]), picked: null };
}
function pickFrom(ids, n) {
  const now = Date.now();
  const bucket = id => { const s = S.q[id]; if (!s) return 2; if (s[0] === 0) return 0; if (s[3] <= now) return 1; return 3 + s[0]; };
  return shuffle(ids).sort((a, b) => bucket(a) - bucket(b)).slice(0, n);
}
function startDrill(kind, mid) {
  const n = S.settings.perDrill || 10; let ids = [], title = "", code = "";
  if (kind === "module") { const m = MOD[mid]; ids = pickFrom(poolIds(m), n); title = m.name; code = m.code; }
  else if (kind === "review") {
    const now = Date.now();
    const pool = Object.entries(S.q).filter(([id, v]) => QI[id] && v[1] > 0 && (v[0] === 0 || v[3] <= now)).sort((a, b) => a[1][0] - b[1][0] || a[1][3] - b[1][3]).map(x => x[0]);
    ids = pool.slice(0, Math.max(n, 12)); title = "Mistakes & due review"; code = "REV";
    if (!ids.length) { toast("Nothing due. Play a module first."); return; }
  } else if (kind === "pack") {
    const p = latestPack(); if (!p) { toast("No new-question pack yet. The next one arrives on the 1st."); return; }
    ids = pickFrom(p.ids, n); title = p.title; code = "NEW";
  } else if (kind === "exam") {
    const all = MODULES.filter(m => m.id !== "starq").flatMap(poolIds);
    ids = shuffle(all).slice(0, 25); title = "Mixed exam (25 questions, 30 min, " + LEVELS[level()].toLowerCase() + ")"; code = "EXAM";
  }
  SESSION = { kind, mid, title, code, items: ids.map(buildItem), i: 0, combo: 0, best: 0, xp: 0, started: Date.now(), exam: kind === "exam", deadline: kind === "exam" ? Date.now() + 30 * MIN : 0, qStart: Date.now() };
  VIEW = { screen: "quiz" }; render(); window.scrollTo(0, 0);
}
function recordAnswer(id, ok, now) {
  const st = qs(id).slice(); const first = ok && st[2] === 0;
  st[1]++; if (ok) { st[2]++; st[0] = Math.min(st[0] + 1, 5); st[3] = now + INTERVALS[st[0]]; } else { st[0] = 0; st[3] = now + INTERVALS[0]; }
  st[4] = now; S.q[id] = st; return first;
}
function answer(idx) {
  const s = SESSION, it = s.items[s.i]; if (!it || it.picked !== null) return;
  if (s.kind === "challenge") { challengeAnswer(idx); return; }
  it.picked = idx; const ok = idx === it.correct; const now = Date.now();
  const firstRight = recordAnswer(it.id, ok, now);
  if (ok) { s.combo++; s.best = Math.max(s.best, s.combo); const gain = 10 + Math.min(s.combo - 1, 5) * 2 + (firstRight ? 5 : 0); s.xp += gain; it.gain = gain; }
  else { s.combo = 0; it.gain = 0; }
  save();
  render();
}
function next() {
  const s = SESSION; if (!s) return;
  if (s.i < s.items.length - 1) { s.i++; s.qStart = Date.now(); render(); window.scrollTo(0, 0); }
  else if (s.kind === "challenge") finishChallenge();
  else finish();
}
function finish() {
  const s = SESSION; const right = s.items.filter(it => it.picked === it.correct).length; const n = s.items.length;
  const before = levelFor(S.xp).lvl;
  const bonus = right === n && n >= 5 ? 25 : 0; s.xp += bonus; s.bonus = bonus;
  S.xp += s.xp;
  if (s.mid) { const ms = S.mod[s.mid] || { plays: 0, best: 0 }; ms.plays++; ms.last = Date.now(); ms.best = Math.max(ms.best || 0, Math.round(100 * right / n)); S.mod[s.mid] = ms; }
  S.history.push({ t: Date.now(), k: s.kind, m: s.mid || s.code, n, c: right });
  recordActivity();
  s.right = right; s.levelUp = levelFor(S.xp).lvl > before ? levelFor(S.xp) : null; s.done = true;
  save(true); syncFocus();
  VIEW = { screen: "result", filter: right < n ? "missed" : "all" }; render(); window.scrollTo(0, 0);
}

function recordActivity() {
  const d = today();
  if (S.daily.date !== d) S.daily = { date: d, drills: 0 };
  S.daily.drills++;
  if (S.streak.last !== d) {
    const y = new Date(Date.now() - DAY).toLocaleDateString("en-CA");
    S.streak.count = S.streak.last === y ? S.streak.count + 1 : 1; S.streak.last = d; S.streak.best = Math.max(S.streak.best || 0, S.streak.count);
  }
}

// ---------- utilities ----------
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function fmt(s) { return esc(s).replace(/`([^`]+)`/g, "<code>$1</code>"); }
let toastT; function toast(msg) { const t = document.getElementById("toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 2800); }
const I = {
  logo: '<svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="7" fill="var(--head)"/><path d="M16 5l9 3.5v6.2c0 6-3.9 10.2-9 12.3-5.1-2.1-9-6.3-9-12.3V8.5L16 5z" fill="none" stroke="var(--accent)" stroke-width="2.4" stroke-linejoin="round"/><path d="M11.5 16.2l3.2 3.2 6-6.4" fill="none" stroke="var(--accent)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  gear: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  back: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
  bell: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
  flame: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2s5 4.6 5 10a5 5 0 0 1-10 0c0-2.4 1.2-4 1.2-4S9 11 11 11c0-4 1-9 1-9z"/></svg>'
};
function meter(p) { const on = Math.round(p * 5); const col = p >= .8 ? "var(--m3)" : p >= .4 ? "var(--m2)" : p > 0 ? "var(--m1)" : "var(--m0)"; return '<span class="meter" aria-hidden="true">' + [0, 1, 2, 3, 4].map(i => '<i style="background:' + (i < Math.max(on, p > 0 ? 1 : 0) ? col : "var(--m0)") + '"></i>').join("") + "</span>"; }

// ---------- views ----------
function topbarMin() { return '<header class="topbar"><div class="in"><span class="brand">' + I.logo + "<span>CyberQuest</span></span></div></header>"; }
function topbar() {
  const lv = levelFor(S.xp);
  return '<header class="topbar"><div class="in"><button class="brand" data-go="home" aria-label="CyberQuest home">' + I.logo + "<span>CyberQuest</span></button><span class=spacer></span>" +
    '<span class="chip" title="Day streak">' + I.flame + " " + S.streak.count + "d</span>" +
    '<span class="chip hot" title="Experience points">' + S.xp + " XP</span>" +
    '<span class="chip lvl" title="Level">L' + lv.lvl + "</span>" +
    '<button class="iconbtn" data-go="settings" aria-label="Settings">' + I.gear + "</button></div></header>";
}
function viewHome() {
  const lv = levelFor(S.xp); const sug = suggest(); const sst = modStats(sug); const due = dueTotal(); const focus = focusSet();
  const dd = S.daily.date === today() ? S.daily.drills : 0;
  const goal = Array.from({ length: DAILY_GOAL }, (_, i) => '<i class="' + (i < dd ? "on" : "") + '"></i>').join("");
  const groups = GROUP_ORDER.map(g => {
    const ms = MODULES.filter(m => m.group === g); if (!ms.length) return "";
    const lp = latestPack();
    const tiles = ms.map(m => { const st = modStats(m); const fresh = lp ? m.packIds.filter(id => QI[id].pack === lp.month && !S.q[id]).length : 0; return '<button class="tile" data-mod="' + m.id + '" title="' + esc(m.blurb) + '"><span class="tc"><span class="code">' + m.code + "</span><span class=\"row\" style=\"gap:4px\">" + (fresh ? '<span class="newdot">NEW ' + fresh + "</span>" : "") + (focus.has(m.id) ? '<span class="cvdot" title="One of your focus areas">FOCUS</span>' : "") + '</span></span><span class="nm">' + esc(m.name) + "</span>" + meter(st.mastery) + '<span class="sub"><span>' + st.seen + "/" + st.total + " seen</span><span>" + Math.round(st.mastery * 100) + "%</span></span></button>"; }).join("");
    return '<section class="col' + (ms.length > 6 ? ' wide' : '') + '" aria-label="' + esc(g) + '"><div class="colhead"><b>' + esc(g) + "</b><span>" + ms.length + '</span></div><div class="tiles">' + tiles + "</div></section>";
  }).join("");
  return '<main class="wrap fade">' +
    '<div class="grid-top">' +
    '<section class="card badge" aria-label="Your profile"><div class="avatar">' + esc(initialsOf(displayName())) + "<small>CQ-" + String(S.created).slice(-4) + '</small></div><div class="who"><div class="eyebrow">Clearance level ' + lv.lvl + "</div><h1>" + esc(displayName()) + '</h1><div class="title">' + esc(lv.title) + '</div><div class="xpbar" role="progressbar" aria-valuenow="' + Math.round(lv.pct * 100) + '" aria-valuemin="0" aria-valuemax="100" aria-label="Progress to next level"><i style="width:' + Math.round(lv.pct * 100) + '%"></i></div><div class="small muted mono" style="margin-top:4px">' + lv.toNext + " XP to " + esc(TITLES[Math.min(lv.lvl, TITLES.length - 1)]) + '</div></div>' +
    '<div class="stats" style="grid-column:1/-1"><div class="stat"><b>' + S.streak.count + '</b><span>day streak</span></div><div class="stat"><b>' + accuracy() + '%</b><span>accuracy</span></div><div class="stat"><b>' + answered() + '</b><span>answered</span></div><div class="stat"><b>' + masteredCount() + "/" + MODULES.length + '</b><span>mastered</span></div></div>' + acctLine() + '</section>' +
    '<section class="card next" aria-label="Next drill"><div class="stack" style="gap:8px"><div class="eyebrow">Next drill</div><div class="row"><span class="code">' + sug.code + "</span><h2>" + esc(sug.name) + '</h2></div><p class="muted small" style="margin:0">' + esc(sug.blurb) + ". " + (sst.seen ? Math.round(sst.mastery * 100) + "% mastered, " + sst.due + " due." : "Not started yet.") + (focus.has(sug.id) ? " One of your focus areas." : "") + '</p></div>' +
    '<div class="stack" style="gap:8px"><div class="row" style="justify-content:space-between"><span class="small"><b>Today\'s goal</b> <span class="muted">' + Math.min(dd, DAILY_GOAL) + "/" + DAILY_GOAL + ' drills</span></span><span class="small muted mono">' + LEVELS[level()] + " · " + (S.settings.perDrill || 10) + ' Q per drill</span></div><div class="goal">' + goal + '</div><button class="btn primary block" data-start="module" data-mid="' + sug.id + '">Start ' + (S.settings.perDrill || 10) + "-question drill</button></div></section></div>" +
    challengeCard() + reminderCard() +
    '<div class="modes"><button class="mode hl2" data-go="learn"><b>Learn</b><span class="muted small">Visual one-page guides: networking & security basics, tools, ISO 27001 & audit, and ICS/OT.</span><span class="k">' + learnRead() + "/" + LEARN_LIST.length + ' read</span></button><button class="mode" data-start="pack"><b>New this month</b><span class="muted small">' + packBlurb() + '</span><span class="k">' + packCount() + '</span></button><button class="mode hl" data-go="cases"><b>Case files</b><span class="muted small">Investigations: read the evidence, pick the next check, learn when to escalate.</span><span class="k">' + caseSolved() + "/" + CASE_LIST.length + ' played</span></button><button class="mode" data-start="review"><b>Review mistakes</b><span class="muted small">Missed and due questions, spaced repetition.</span><span class="k">' + due + ' due now</span></button><button class="mode" data-start="exam"><b>Mixed exam</b><span class="muted small">25 questions from every domain against a 30-minute clock, with an explanation after each answer.</span><span class="k">' + bankCount() + " " + LEVELS[level()].toLowerCase() + ' questions</span></button><button class="mode" data-go="star"><b>STAR interview coach</b><span class="muted small">' + STAR.prompts.length + ' behavioural questions with example answers to adapt to your own experience.</span><span class="k">' + Object.values(S.star).filter(x => x.practised).length + "/" + STAR.prompts.length + ' practised</span></button></div>' +
    '<div class="matrix-head"><div><div class="eyebrow">Module matrix</div><h2>' + MODULES.length + " modules, " + bankCount() + " " + LEVELS[level()].toLowerCase() + ' questions</h2></div><div class="levelbar"><span class="small muted">Level</span>' + seg("level", ["junior", "mixed", "advanced"], level(), ["Junior", "Mixed", "Advanced"]) + '</div></div><div class="legend" style="margin:-2px 0 10px"><span><i style="background:var(--m0)"></i>Not started</span><span><i style="background:var(--m1)"></i>Learning</span><span><i style="background:var(--m2)"></i>Solid</span><span><i style="background:var(--m3)"></i>Mastered</span><span><span class="cvdot">FOCUS</span> your focus areas</span></div>' +
    '<div class="matrix">' + groups + "</div></main>";
}
function acctLine() {
  if (MODE !== "web") return "";
  if (ACC.user && ACC.expired) return '<div class="acct"><span>Signed out on this device. Sign in to keep saving progress to <b>' + esc(ACC.user.displayName) + "</b>.</span>" + '<button class="btn sm primary" data-auth="signin">Sign in again</button></div>';
  if (ACC.user) return '<div class="acct"><span class="muted">Signed in as <b>@' + esc(ACC.user.username) + "</b>" + (ACC.offline ? " · offline, will sync later" : "") + '</span><button class="btn sm ghost" data-go="settings">Account</button></div>';
  return '<div class="acct"><span>Playing as a guest: progress stays on this device.</span><span class="row" style="gap:6px"><button class="btn sm primary" data-auth="signup">Create account</button><button class="btn sm" data-auth="signin">Sign in</button></span></div>';
}
function reminderCard() {
  if (MODE === "artifact" || !ACC.user || ACC.expired) return "";
  const p = pushState();
  if (p === "on" || S.push.hide) return "";
  let body = "", action = "";
  if (p === "unsupported") { body = "This browser can't receive push reminders. Add the calendar reminders instead, or open CyberQuest in Safari on iPhone/iPad, or Chrome on desktop and Android."; action = '<a class="btn sm" href="/api/calendar.ics">Add calendar reminders</a>'; }
  else if (p === "install") { body = "On iPhone and iPad, reminders only work from the Home Screen app. In Safari tap Share, then Add to Home Screen, then open CyberQuest from the new icon."; action = '<button class="btn sm" data-go="settings">How to install</button>'; }
  else if (p === "denied") { body = "Notifications are blocked for this app. Turn them on in your device settings, or use calendar reminders."; action = '<a class="btn sm" href="/api/calendar.ics">Add calendar reminders</a>'; }
  else { body = "Get a nudge every 4 hours (quiet from 23:00 to 07:00) with the module to play next."; action = '<button class="btn sm primary" data-act="push-on">' + I.bell + " Turn on reminders</button>"; }
  return '<div class="notice row" style="margin-top:14px;justify-content:space-between"><div style="flex:1;min-width:220px"><b>4-hour reminders</b><div class="small muted">' + body + '</div></div><div class="row">' + action + '<button class="btn sm ghost" data-act="hide-push">Not now</button></div></div>';
}
function viewModule() {
  const m = MOD[VIEW.mid]; const st = modStats(m); const ms = S.mod[m.id] || {}; const isF = focusSet().has(m.id);
  const jn = m.ids.filter(id => QI[id].j).length, an = m.ids.length - jn;
  return '<main class="wrap fade"><button class="back" data-go="home">' + I.back + ' All modules</button><div class="card stack" style="max-width:760px;margin:8px auto 0"><div class="row"><span class="pill">' + esc(m.group) + '</span><span class="pill mono">' + m.code + "</span>" + (isF ? '<span class="cvdot">FOCUS</span>' : "") + "</div><h1>" + esc(m.name) + '</h1><p class="muted" style="margin:0">' + esc(m.blurb) + '.</p><p class="small muted mono" style="margin:0">' + jn + " junior · " + an + " advanced · drills use " + LEVELS[level()].toLowerCase() + (level() !== "mixed" && (level() === "junior" ? jn : an) === 0 ? " (none at this level, so all are shown)" : "") + '</p><div class="stats" style="margin-top:4px"><div class="stat"><b>' + Math.round(st.mastery * 100) + '%</b><span>mastery</span></div><div class="stat"><b>' + st.seen + "/" + st.total + '</b><span>seen</span></div><div class="stat"><b>' + st.due + '</b><span>due</span></div><div class="stat"><b>' + (ms.best || 0) + '%</b><span>best drill</span></div></div><div class="row"><button class="btn primary" data-start="module" data-mid="' + m.id + '">Start ' + (S.settings.perDrill || 10) + "-question drill</button>" + (m.id === "starq" ? '<button class="btn" data-go="star">Open STAR coach</button>' : '<button class="btn" data-act="focus" data-mid="' + m.id + '">' + (isF ? "Remove from focus areas" : "Add to focus areas") + "</button>") + "</div>" + CASE_LIST.filter(c => c.m === m.id).map(c => '<button class="notice row caselink" data-case="' + c.id + '" style="justify-content:space-between;text-align:left;width:100%"><span><span class="eyebrow">Case file</span><br><b>' + esc(c.title) + '</b></span><span class="small muted">' + c.steps.length + " decisions · ~" + c.mins + " min</span></button>").join("") + LEARN_LIST.filter(s => s.m === m.id).map(s => '<button class="notice row caselink" data-learn="' + s.id + '" style="justify-content:space-between;text-align:left;width:100%"><span><span class="eyebrow">Learn</span><br><b>' + esc(s.title) + '</b></span><span class="small muted">~' + s.mins + " min read</span></button>").join("") + "</div></main>";
}
function viewQuiz() {
  const s = SESSION, it = s.items[s.i], q = QI[it.id].q, m = QI[it.id].m; const answeredIt = it.picked !== null;
  const prog = s.items.map((x, i) => '<i class="' + (i === s.i && !answeredIt ? "cur" : x.picked === null ? "" : x.picked === x.correct ? "ok" : "bad") + '"></i>').join("");
  const explain = answeredIt ? explainBox(it, it.gain ? ' <span class="xpfloat">+' + it.gain + " XP</span>" : "") : "";
  const timer = s.exam || S.settings.timer ? '<span class="timer mono" id="timer"></span>' : "";
  return '<main class="wrap"><div class="quiz"><div class="qhead"><button class="back" data-act="quit">' + I.back + ' Quit</button><span class="row" style="gap:8px"><span class="pill mono">' + m.code + '</span><span class="small muted mono">' + (s.i + 1) + "/" + s.items.length + "</span>" + (s.combo > 1 ? '<span class="chip hot">' + s.combo + "x streak</span>" : "") + timer + '</span></div><div class="progress' + (s.items.length > 20 ? " dense" : "") + '">' + prog + '</div><div class="card fade" style="padding:18px"><div class="eyebrow">' + esc(s.kind === "module" ? m.name : m.name + " · " + s.title) + packChip(it.id) + '</div><div class="qtext">' + fmt(q[0]) + '</div><div class="opts" role="group" aria-label="Answer options">' + optionButtons(it) + "</div>" + explain + "</div>" +
    (answeredIt ? '<div class="qfoot"><button class="btn primary" data-act="next">' + (s.i < s.items.length - 1 ? "Next question" : "See results") + "</button></div>" : "") + "</div></main>";
}
function viewResult() {
  const s = SESSION; const n = s.items.length; const pct = Math.round(100 * s.right / n); const mins = Math.max(1, Math.round((Date.now() - s.started) / MIN));
  const missed = s.items.filter(it => it.picked !== it.correct);
  const verdict = pct === 100 ? "Clean sweep." : pct >= 80 ? "Strong round." : pct >= 50 ? "Getting there." : "Good practice. The misses are now in your review queue.";
  return '<main class="wrap fade"><div class="quiz stack">' + (s.levelUp ? '<div class="card lvlup"><div class="eyebrow">Promotion</div><h2>Level ' + s.levelUp.lvl + ": " + esc(s.levelUp.title) + "</h2></div>" : "") +
    '<div class="card"><div class="score"><div class="ring" style="--p:' + pct + '"><b>' + pct + '%</b></div><div class="stack" style="gap:4px"><div class="eyebrow">' + esc(s.title) + "</div><h2>" + verdict + '</h2><div class="muted small mono">' + s.right + "/" + n + " correct · +" + s.xp + " XP" + (s.bonus ? " (incl. +" + s.bonus + " perfect bonus)" : "") + " · best streak " + s.best + " · " + mins + ' min</div></div></div><div class="row" style="margin-top:14px">' + (missed.length ? '<button class="btn" data-act="retry-missed">Retry the ' + missed.length + " missed</button>" : "") + (s.kind === "module" ? '<button class="btn" data-start="module" data-mid="' + s.mid + '">Another round</button>' : "") + '<button class="btn primary" data-go="home">Done</button></div></div>' +
    reviewCard(s.items) + "</div></main>";
}
function retryMissed() {
  const s = SESSION; const ids = s.items.filter(it => it.picked !== it.correct).map(it => it.id);
  SESSION = { kind: "review", title: "Retry missed", code: "REV", items: shuffle(ids).map(buildItem), i: 0, combo: 0, best: 0, xp: 0, started: Date.now(), qStart: Date.now() };
  VIEW = { screen: "quiz" }; render(); window.scrollTo(0, 0);
}

// ---------- learn (visual sheets) ----------
// One-page infographic-style explainers (data/15-17-learn-*.js). Rendered from a small block grammar.
const LEARN_LIST = typeof LEARN !== "undefined" ? LEARN : [];
const LESSON = {}; LEARN_LIST.forEach(s => { LESSON[s.id] = s; });
const TRACKS = [
  { id: "fund", name: "Fundamentals", blurb: "The basics to know cold: the OSI model, TCP/UDP, ports, IP & subnetting, DNS/HTTP, security principles and crypto." },
  { id: "defend", name: "Defend & detect", blurb: "Blue team: SOC & SIEM, detection engineering, malware defence and threat intelligence." },
  { id: "respond", name: "Respond & recover", blurb: "Incident response, digital forensics, and business continuity & disaster recovery." },
  { id: "offense", name: "Offense & AppSec", blurb: "Penetration testing method, the OWASP Top 10, DevSecOps and vulnerability management." },
  { id: "cloudid", name: "Cloud & identity", blurb: "Cloud security, identity & access management, and zero trust & emerging tech." },
  { id: "grc", name: "GRC & audit", blurb: "ISO 27001 clauses, the audit process, risk, frameworks, NIST, SOC 2, PCI DSS and GDPR." },
  { id: "ics", name: "Specialist & ICS/OT", blurb: "Industrial control systems, plus social engineering and physical security." },
  { id: "toolkit", name: "Tools & technologies", blurb: "The hands-on stack: Windows, Linux, networking, cloud, security, forensics and crypto tools." },
];
function learnRead() { return LEARN_LIST.filter(s => (S.learn[s.id] || {}).read).length; }
function lessonDone(id) { return !!(S.learn[id] || {}).read; }
function markLesson(id) {
  if (!LESSON[id]) return;
  const before = levelFor(S.xp).lvl, first = !lessonDone(id);
  S.learn[id] = { read: true, at: Date.now() };
  if (first) { S.xp += 15; recordActivity(); }
  save(true);
  if (first && levelFor(S.xp).lvl > before) toast("Read and logged. Level " + levelFor(S.xp).lvl + ": " + levelFor(S.xp).title);
  else toast(first ? "Read, +15 XP" : "Marked unread was kept; already logged");
  render();
}
// --- inline icon set (24x24, strokes use currentColor) ---
const LI_P = {
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  users: '<circle cx="9" cy="8" r="3.4"/><path d="M2.5 20c0-3.4 3-5.2 6.5-5.2s6.5 1.8 6.5 5.2"/><path d="M16 5.2A3.4 3.4 0 0 1 16 12M17.5 20c0-2.6-1-4-2.4-4.8"/>',
  key: '<circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v4M15 12v3"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  doc: '<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v4h4M9 13h6M9 17h6"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1.2"/><circle cx="4" cy="12" r="1.2"/><circle cx="4" cy="18" r="1.2"/>',
  server: '<rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/><path d="M7 7.5h.01M7 16.5h.01"/>',
  cpu: '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 2v3M14 2v3M10 19v3M14 19v3M2 10h3M2 14h3M19 10h3M19 14h3"/>',
  network: '<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5v4M12 11.5l-5.5 5M12 11.5l5.5 5"/>',
  link: '<path d="M9 15l6-6M8 12l-2 2a3 3 0 0 0 4 4l2-2M16 12l2-2a3 3 0 0 0-4-4l-2 2"/>',
  download: '<path d="M12 3v12M7 11l5 5 5-5M4 21h16"/>',
  upload: '<path d="M12 21V9M7 13l5-5 5 5M4 3h16"/>',
  layers: '<path d="M12 2 2 7l10 5 10-5z"/><path d="M2 12l10 5 10-5M2 17l10 5 10-5"/>',
  box: '<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 2v10l9-5M12 12l-9-5M12 12v10"/>',
  folder: '<path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  check: '<path d="M4 12l5 5L20 6"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  wrench: '<path d="M15 6a4 4 0 0 1-5.3 5.3L5 16v3h3l4.7-4.7A4 4 0 0 1 18 9l-2.5-1.5z"/>',
  git: '<circle cx="6" cy="6" r="2.4"/><circle cx="6" cy="18" r="2.4"/><circle cx="18" cy="9" r="2.4"/><path d="M6 8.4v7.2M8.2 7.2 16 9M18 11.4c0 4-6 2.6-12 4.2"/>',
  ship: '<path d="M3 15l2-6h14l2 6M3 15l9 5 9-5M6 9V5h12v4"/>',
  cloud: '<path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.3A3.5 3.5 0 0 1 18 18z"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/>',
  terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M13 15h4"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z"/>',
  stamp: '<path d="M9 4a3 3 0 0 1 6 0c0 2-1.5 3-1.5 5h-3C10.5 7 9 6 9 4z"/><path d="M6 14h12v3H6zM4 20h16"/>',
  badge: '<path d="M12 2l2.5 2 3.5-.5.5 3.5 2 2.5-2 2.5-.5 3.5-3.5-.5L12 20l-2.5-2-3.5.5-.5-3.5L3.5 12l2-2.5.5-3.5 3.5.5z"/><path d="M9 12l2 2 4-4"/>',
  play: '<path d="M7 4l12 8-12 8z"/>',
  radar: '<circle cx="12" cy="12" r="9"/><path d="M12 12l6-4M12 12V5M12 12l4 6"/><circle cx="12" cy="12" r="3"/>',
  honey: '<path d="M12 3l7 4v6c0 4-3 6-7 8-4-2-7-4-7-8V7z"/><path d="M9 11h6M9 14h6M12 8v9"/>',
  alert: '<path d="M12 3l10 18H2z"/><path d="M12 9v5M12 17h.01"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4M21 4v5h-5"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M16 8l-2.5 5.5L8 16l2.5-5.5z"/>',
  gauge: '<path d="M4 18a8 8 0 1 1 16 0"/><path d="M12 18l4-5"/><circle cx="12" cy="18" r="1.3"/>',
  scale: '<path d="M12 3v18M7 21h10M6 7l-3 6a3 3 0 0 0 6 0zM18 7l-3 6a3 3 0 0 0 6 0zM3 7h18M12 7l5-2M12 7L7 5"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 3 2 3H5"/>',
  bell: '<path d="M18 9a6 6 0 1 0-12 0c0 6-3 7-3 7h18s-3-1-3-7"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  coins: '<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v5c0 1.7 2.7 3 6 3M3 12v5c0 1.7 2.7 3 6 3"/><ellipse cx="16" cy="14" rx="5" ry="2.6"/><path d="M11 14v5c0 1.4 2.2 2.6 5 2.6s5-1.2 5-2.6v-5"/>',
  office: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01M10 21v-4h4v4"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
  monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  code: '<path d="M9 7l-5 5 5 5M15 7l5 5-5 5"/>',
  building: '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h.01M12 7h.01M15 7h.01M9 11h.01M12 11h.01M15 11h.01M9 15h.01M15 15h.01M10 21v-3h4v3"/>',
};
function ic(name) { const p = LI_P[name] || LI_P.doc; return '<svg class="li" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + "</svg>"; }
const RICH = s => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");

// --- block renderer ---
function lbRender(b) {
  switch (b.t) {
    case "lead": return '<p class="lb-lead">' + RICH(b.text) + "</p>";
    case "callout": return '<div class="lb-callout">' + ic("flag") + "<p>" + RICH(b.text) + "</p></div>";
    case "note": return '<div class="lb-note"><b>' + RICH(b.title) + "</b> " + RICH(b.text) + "</div>";
    case "list": return (b.title ? '<div class="lb-h">' + RICH(b.title) + "</div>" : "") + '<ul class="lb-list">' + b.items.map(i => "<li>" + RICH(i) + "</li>").join("") + "</ul>";
    case "table": return (b.title ? '<div class="lb-h">' + RICH(b.title) + "</div>" : "") + '<div class="lb-tw"><table class="lb-table"><thead><tr>' + b.head.map(h => "<th>" + RICH(h) + "</th>").join("") + "</tr></thead><tbody>" +
      b.rows.map(r => "<tr>" + r.map((c, i) => "<td" + (i === 0 ? ' class="lh"' : "") + ">" + RICH(c) + "</td>").join("") + "</tr>").join("") + "</tbody></table></div>";
    case "steps": return (b.title ? '<div class="lb-h">' + RICH(b.title) + "</div>" : "") +
      (b.icons ? '<div class="lb-chain">' + b.icons.map((p, i) => '<div class="lb-chip">' + ic(p[0]) + "<span>" + esc(p[1]) + "</span></div>" + (i < b.icons.length - 1 ? '<span class="lb-arrow">' + ic("arrow") + "</span>" : "")).join("") + "</div>" : "") +
      '<ol class="lb-steps">' + b.items.map(i => "<li><span class='lb-n'></span><span>" + RICH(i) + "</span></li>").join("") + "</ol>";
    case "flow": return (b.title ? '<div class="lb-h">' + RICH(b.title) + "</div>" : "") + '<div class="lb-flow">' +
      b.items.map((it, i) => '<div class="lb-node">' + ic(it[0]) + "<b>" + esc(it[1]) + "</b>" + (it[2] ? "<span>" + esc(it[2]) + "</span>" : "") + "</div>" + (i < b.items.length - 1 ? '<span class="lb-flowarrow">' + ic("arrow") + "</span>" : "")).join("") + "</div>";
    case "grid": return (b.title ? '<div class="lb-h">' + RICH(b.title) + "</div>" : "") + '<div class="lb-grid">' +
      b.items.map(it => '<div class="lb-cell"><div class="lb-cellhead">' + (it.icon ? '<span class="lb-ci">' + ic(it.icon) + "</span>" : "") + "<b>" + RICH(it.name) + "</b></div><p>" + RICH(it.text) + "</p>" +
        (it.k ? '<div class="lb-kv">' + it.k.map(kv => "<span><b>" + RICH(kv[0]) + ":</b> " + RICH(kv[1]) + "</span>").join("") + "</div>" : "") + (it.list ? '<ul class="lb-list">' + it.list.map(x => "<li>" + RICH(x) + "</li>").join("") + "</ul>" : "") + "</div>").join("") + "</div>";
    case "timeline": return (b.title ? '<div class="lb-h">' + RICH(b.title) + "</div>" : "") + '<div class="lb-timeline">' +
      b.items.map(it => '<div class="lb-tl"><div class="lb-when">' + RICH(it[0]) + '</div><div class="lb-tlbody"><b>' + RICH(it[1]) + "</b><p>" + RICH(it[2]) + "</p></div></div>").join("") + "</div>";
    case "split": return '<div class="lb-split">' + b.cols.map(col => '<section class="lb-panel ' + (col.c || "blue") + '">' + (col.title ? '<div class="lb-ph">' + RICH(col.title) + "</div>" : "") + '<div class="lb-pbody">' + col.blocks.map(lbRender).join("") + "</div></section>").join("") + "</div>";
    default: return "";
  }
}
function lessonCard(s) {
  const done = lessonDone(s.id);
  return '<button class="lcard ' + s.c + (done ? " done" : "") + '" data-learn="' + s.id + '"><span class="lcard-top"><span class="lcard-ic">' + ic("doc") + '</span>' + (done ? '<span class="lcard-done">' + ic("check") + " Read</span>" : '<span class="lcard-min">~' + s.mins + " min</span>") + '</span><b>' + esc(s.title) + '</b><span class="lcard-sub">' + esc(s.sub) + "</span></button>";
}
function viewLearn() {
  const sections = TRACKS.map(tr => {
    const items = LEARN_LIST.filter(s => s.track === tr.id);
    if (!items.length) return "";
    const read = items.filter(s => lessonDone(s.id)).length;
    return '<section class="ltrack"><div class="ltrack-h"><div><h2>' + esc(tr.name) + '</h2><p class="muted small" style="margin:2px 0 0">' + esc(tr.blurb) + '</p></div><span class="pill mono">' + read + "/" + items.length + '</span></div><div class="lgrid">' + items.map(lessonCard).join("") + "</div></section>";
  }).join("");
  return '<main class="wrap fade"><button class="back" data-go="home">' + I.back + ' Home</button><div class="stack" style="margin-top:6px"><div><div class="eyebrow">Study</div><h1>Learn</h1><p class="muted" style="margin:6px 0 0;max-width:74ch">Visual one-page explainers: the tools, the frameworks and the industrial-control world, laid out as maps you can read in a few minutes and come back to. Pair them with the drills and case files.</p></div><div class="row"><span class="pill mono">' + learnRead() + "/" + LEARN_LIST.length + ' read</span></div>' + sections + "</div></main>";
}
function viewLesson() {
  const s = LESSON[VIEW.lid]; if (!s) { VIEW = { screen: "learn" }; return viewLearn(); }
  const idx = LEARN_LIST.filter(x => x.track === s.track);
  const pos = idx.findIndex(x => x.id === s.id); const next = idx[pos + 1];
  const tr = TRACKS.find(t => t.id === s.track);
  const rel = MOD[s.m];
  return '<main class="wrap fade"><div class="lesson-bar"><button class="back" data-go="learn">' + I.back + ' Learn</button><div class="row" style="gap:8px"><button class="btn sm ghost" data-act="print-lesson">' + ic("download") + ' Save / print</button>' + (rel && rel.id !== "starq" ? '<button class="btn sm" data-mod="' + rel.id + '">Drill ' + esc(rel.code) + "</button>" : "") + "</div></div>" +
    '<article class="sheet ' + s.c + '" id="sheet"><header class="sheet-head"><div class="sheet-track">' + esc(tr ? tr.name : "") + " · ~" + s.mins + ' min read</div><h1>' + esc(s.title) + '</h1><p class="sheet-sub">' + esc(s.sub) + "</p></header><div class=\"sheet-body\">" + s.blocks.map(lbRender).join("") + '</div><footer class="sheet-foot"><span>CyberQuest · Learn · ' + esc(tr ? tr.name : "") + "</span></footer></article>" +
    '<div class="lesson-foot"><button class="btn ' + (lessonDone(s.id) ? "" : "primary") + '" data-act="mark-lesson" data-lid="' + s.id + '">' + (lessonDone(s.id) ? "Read " + ic("check") : "Mark as read (+15 XP)") + "</button>" + (next ? '<button class="btn" data-learn="' + next.id + '">Next: ' + esc(next.title) + "</button>" : '<button class="btn" data-go="learn">Back to Learn</button>') + "</div></main>";
}

// ---------- case files ----------
let CS = null; // { id, i (-1 = brief), picks: [option index], orders: [[shuffled option indexes]], started, done }
const GRADE = { 2: ["ok", "Best move"], 1: ["mid", "Reasonable, not the best"], 0: ["bad", "Not this time"] };
function caseSolved() { return CASE_LIST.filter(c => (S.cases[c.id] || {}).plays).length; }
function startCase(id) {
  const c = CASE[id]; if (!c) return;
  CS = { id, i: -1, picks: [], orders: c.steps.map(() => shuffle([0, 1, 2, 3])), started: Date.now(), done: false };
  VIEW = { screen: "case" }; render(); window.scrollTo(0, 0);
}
function casePick(k) {
  if (!CS || CS.i < 0 || CS.done || CS.picks[CS.i] != null) return;
  CS.picks[CS.i] = k; render();
  const fb = document.getElementById("casefb"); if (fb && fb.scrollIntoView) fb.scrollIntoView({ block: "nearest", behavior: "smooth" });
}
function caseNext() {
  const c = CASE[CS.id]; if (!c) return;
  if (CS.i < c.steps.length - 1) { CS.i++; render(); window.scrollTo(0, 0); return; }
  finishCase();
}
function finishCase() {
  const c = CASE[CS.id]; const n = c.steps.length;
  const pts = CS.picks.reduce((a, k, i) => a + c.steps[i].o[k][0], 0); const max = 2 * n; const pct = Math.round(100 * pts / max);
  const before = levelFor(S.xp).lvl; const xp = pts * 5 + 10; S.xp += xp;
  const prev = S.cases[c.id] || { best: 0, plays: 0 };
  S.cases[c.id] = { best: Math.max(prev.best || 0, pct), plays: (prev.plays || 0) + 1, last: Date.now() };
  S.history.push({ t: Date.now(), k: "case", m: c.id, n, c: CS.picks.filter((k, i) => c.steps[i].o[k][0] === 2).length });
  recordActivity(); save(true);
  CS.done = true; CS.pts = pts; CS.max = max; CS.pct = pct; CS.xp = xp; CS.levelUp = levelFor(S.xp).lvl > before ? levelFor(S.xp) : null;
  VIEW = { screen: "case" }; render(); window.scrollTo(0, 0);
}
function caseStatus(c) {
  const r = S.cases[c.id];
  return r && r.plays ? '<span class="status done">Best ' + r.best + "% · played " + r.plays + "x</span>" : '<span class="status">Not started</span>';
}
function viewCases() {
  const cards = CASE_LIST.map(c => '<button class="sp case" data-case="' + c.id + '"><span class="comp">' + esc(c.area) + " · " + c.steps.length + " decisions · ~" + c.mins + ' min</span><b>' + esc(c.title) + '</b><span class="small muted">' + esc(c.brief) + "</span>" + caseStatus(c) + "</button>").join("");
  return '<main class="wrap fade"><button class="back" data-go="home">' + I.back + ' Home</button><div class="stack" style="margin-top:6px"><div><div class="eyebrow">Investigations</div><h1>Case files</h1><p class="muted" style="margin:6px 0 0;max-width:72ch">Real-world style problems where the answer isn\'t obvious. At each step you see the evidence, choose your next check, and get told whether it was the best move, a reasonable one or a poor one, and why. Each case ends with when to seek help and how to talk about it in an interview.</p></div><div class="row"><span class="pill mono">' + caseSolved() + "/" + CASE_LIST.length + ' played</span><span class="small muted">All cases are fictional training scenarios.</span></div><div class="starlist">' + cards + "</div></div></main>";
}
function caseOptions(c, st, picked) {
  const keys = ["A", "B", "C", "D"]; const order = CS.orders[CS.i]; const done = picked != null;
  return order.map((k, pos) => { const o = st.o[k]; let cls = "opt";
    if (done) { if (o[0] === 2) cls += " right"; else if (k === picked) cls += o[0] === 1 ? " meh" : " wrong"; }
    return '<button class="' + cls + '" data-cpick="' + k + '"' + (done ? " disabled" : "") + '><span class="k">' + keys[pos] + "</span><span>" + fmt(o[1]) + "</span></button>"; }).join("");
}
function viewCase() {
  const c = CASE[CS.id]; const n = c.steps.length;
  const head = '<div class="qhead"><button class="back" data-act="case-list">' + I.back + ' Case files</button><span class="row" style="gap:8px"><span class="pill">' + esc(c.area) + '</span><span class="small muted mono">' + (CS.done ? "Debrief" : CS.i < 0 ? "Brief" : "Step " + (CS.i + 1) + "/" + n) + "</span></span></div>";
  const prog = '<div class="progress">' + c.steps.map((st, i) => { const k = CS.picks[i]; const g = k == null ? null : st.o[k][0]; return '<i class="' + (g == null ? (i === CS.i ? "cur" : "") : g === 2 ? "ok" : g === 1 ? "mid" : "bad") + '"></i>'; }).join("") + "</div>";
  if (CS.done) {
    const path = c.steps.map((st, i) => { const o = st.o[CS.picks[i]]; const g = GRADE[o[0]]; const best = st.o.find(x => x[0] === 2);
      return '<div class="miss"><div class="row" style="gap:6px;margin-bottom:4px"><span class="pill mono">' + (i + 1) + '</span><span class="tag ' + g[0] + '">' + g[1].toUpperCase() + '</span></div><div class="q">' + fmt(st.ask) + '</div><div class="ans ' + (o[0] === 2 ? "ok" : "bad") + '"><b>YOU</b><span>' + fmt(o[1]) + "</span></div>" + (o[0] === 2 ? "" : '<div class="ans ok"><b>BEST</b><span>' + fmt(best[1]) + "</span></div>") + "</div>"; }).join("");
    const verdict = CS.pct === 100 ? "Textbook investigation." : CS.pct >= 75 ? "Strong investigation." : CS.pct >= 50 ? "Solid, with a few detours." : "Good practice: read the debrief and try it again.";
    return '<main class="wrap fade"><div class="quiz stack">' + head + prog + (CS.levelUp ? '<div class="card lvlup"><div class="eyebrow">Promotion</div><h2>Level ' + CS.levelUp.lvl + ": " + esc(CS.levelUp.title) + "</h2></div>" : "") +
      '<div class="card"><div class="score"><div class="ring" style="--p:' + CS.pct + '"><b>' + CS.pct + '%</b></div><div class="stack" style="gap:4px"><div class="eyebrow">Case closed · ' + esc(c.title) + "</div><h2>" + verdict + '</h2><div class="muted small mono">' + CS.pts + "/" + CS.max + " decision points · +" + CS.xp + " XP</div></div></div></div>" +
      '<div class="card stack"><h3>What to take away</h3><ul class="lessons">' + c.lessons.map(l => "<li>" + fmt(l) + "</li>").join("") + "</ul></div>" +
      '<div class="callout help"><div class="eyebrow">When to seek help</div><p>' + fmt(c.help) + "</p></div>" +
      '<div class="callout tell"><div class="eyebrow">Tell it in an interview</div><p>' + fmt(c.tell) + '</p><p class="small muted">Talking about a lab, course or practice case is fine, as long as you label it honestly instead of presenting it as production experience.</p><div class="row"><button class="btn sm" data-star="s21">Draft an investigation story (STAR)</button></div></div>' +
      '<div class="card"><h3>Your path</h3>' + path + "</div>" +
      '<div class="row"><button class="btn" data-case="' + c.id + '">Play again</button><button class="btn" data-mod="' + c.m + '">Drill ' + esc(MOD[c.m] ? MOD[c.m].name : "this topic") + '</button><button class="btn primary" data-act="case-list">All case files</button></div></div></main>';
  }
  if (CS.i < 0) {
    return '<main class="wrap fade"><div class="quiz stack">' + head + '<div class="card casebrief stack"><div class="eyebrow">Case file · ' + esc(c.area) + '</div><h1>' + esc(c.title) + '</h1><div class="small mono muted">You are: ' + esc(c.role) + " · " + n + " decisions · about " + c.mins + ' minutes</div><p style="margin:0">' + fmt(c.brief) + '</p><p class="small muted" style="margin:0">Each step: read the evidence, pick your next move. Some options are reasonable but not the best; you\'ll see why after each choice.</p><button class="btn primary" data-act="case-next">Open the case</button></div></div></main>';
  }
  const st = c.steps[CS.i]; const picked = CS.picks[CS.i]; const done = picked != null;
  let fb = "";
  if (done) {
    const o = st.o[picked]; const g = GRADE[o[0]]; const bestK = st.o.findIndex(x => x[0] === 2);
    const others = CS.orders[CS.i].filter(k => k !== picked && k !== bestK).map(k => '<li><b>' + fmt(st.o[k][1]) + ".</b> " + fmt(st.o[k][2]) + "</li>").join("");
    fb = '<div class="explain fade" id="casefb" role="status"><div class="verdict ' + (o[0] === 2 ? "ok" : o[0] === 1 ? "mid" : "bad") + '">' + g[1] + "</div>" + '<div class="small"><b>Why:</b> ' + fmt(o[2]) + "</div>" +
      (o[0] === 2 ? "" : '<div class="small" style="margin-top:8px"><b>Best move:</b> ' + fmt(st.o[bestK][1]) + ". " + fmt(st.o[bestK][2]) + "</div>") +
      '<details class="small" style="margin-top:8px"><summary>Why not the others?</summary><ul class="lessons">' + others + "</ul></details></div>";
  }
  return '<main class="wrap"><div class="quiz">' + head + prog + '<div class="card fade" style="padding:18px"><div class="eyebrow">Evidence</div><p class="evtext">' + fmt(st.ev) + "</p>" + (st.log ? '<pre class="log">' + st.log.map(esc).join("\n") + "</pre>" : "") +
    '<div class="qtext" style="margin-top:14px">' + fmt(st.ask) + '</div><div class="opts" role="group" aria-label="Your next move">' + caseOptions(c, st, picked) + "</div>" + fb + "</div>" +
    (done ? '<div class="qfoot"><button class="btn primary" data-act="case-next">' + (CS.i < c.steps.length - 1 ? "Next step" : "Close the case") + "</button></div>" : "") + "</div></main>";
}

// ---------- STAR coach ----------
function starStatus(p) { const d = S.star[p.id]; if (!d) return '<span class="status">Not started</span>'; if (d.practised) return '<span class="status done">Practised ' + d.practised + "x</span>"; return '<span class="status">Draft saved</span>'; }
function viewStar() {
  const sq = modStats(MOD.starq);
  const cards = STAR.prompts.map((p, i) => '<button class="sp" data-star="' + p.id + '"><span class="comp">' + String(i + 1).padStart(2, "0") + " · " + esc(p.competency) + "</span><b>" + esc(p.q) + "</b>" + starStatus(p) + "</button>").join("");
  return '<main class="wrap fade"><button class="back" data-go="home">' + I.back + ' Home</button><div class="stack" style="margin-top:6px"><div><div class="eyebrow">Interview prep</div><h1>STAR coach</h1><p class="muted" style="margin:6px 0 0;max-width:70ch">Pick a question, draft your Situation, Task, Action and Result, say it out loud against a 2-minute clock, then compare with an example answer. ' + esc(STAR.note || "") + '</p></div><div class="row"><button class="btn" data-mod="starq">STAR technique quiz · ' + Math.round(sq.mastery * 100) + '%</button></div><div class="starlist">' + cards + "</div></div></main>";
}
const CHECKS = ["Situation is two sentences or less", "My own role is clear (I, not we)", "Actions are specific: tools, steps, decisions", "Result has a number or concrete evidence", "I said what I learned or would change", "Spoken in about two minutes"];
let starTimer = null;
function viewStarDetail() {
  const p = STAR.prompts.find(x => x.id === VIEW.pid); const d = S.star[p.id] || {}; const tab = VIEW.tab || "draft";
  const fields = [["S", "Situation", "Where, when, what was the problem? Keep it short."], ["T", "Task", "What were YOU responsible for?"], ["A", "Action", "What did you do, step by step, and why?"], ["R", "Result", "What changed? Numbers, evidence, what you learned."]];
  const draft = fields.map(([k, label, hint]) => '<div class="field"><label for="f' + k + '"><span class="letter">' + k + "</span>" + label + '</label><div class="hint">' + hint + '</div><textarea id="f' + k + '" data-field="' + k + '" rows="3">' + esc(d[k] || "") + "</textarea></div>").join("");
  const fill = s => esc(s).replace(/\[([^\]]+)\]/g, '<span class="fill">[$1]</span>');
  const model = '<div class="model">' + fields.map(([k, label]) => '<p><span class="letter">' + k + "</span><b>" + label + ".</b> " + fill(p[k]) + "</p>").join("") + '<p class="small muted"><b>Coach note:</b> ' + esc(p.tips) + "</p></div>";
  const checks = '<div class="checks">' + CHECKS.map((c, i) => '<label><input type="checkbox" data-check="' + i + '"' + ((d.checks || [])[i] ? " checked" : "") + "><span>" + c + "</span></label>").join("") + "</div>";
  const ai = MODE === "artifact" && AI.available ? '<div class="stack" style="gap:8px;margin-top:14px"><button class="btn" data-act="ai-feedback">Get AI feedback</button><div class="ai" id="aiout" hidden></div></div>' : "";
  return '<main class="wrap fade"><button class="back" data-go="star">' + I.back + ' All STAR questions</button><div class="card" style="max-width:820px;margin:8px auto 0"><div class="comp">' + esc(p.competency) + '</div><div class="starq" style="margin-top:6px">' + esc(p.q) + '</div><div class="tabs" role="tablist"><button class="tab" role="tab" aria-selected="' + (tab === "draft") + '" data-tab="draft">Your answer</button><button class="tab" role="tab" aria-selected="' + (tab === "model") + '" data-tab="model">Example answer</button></div>' +
    (tab === "draft" ? '<div class="stack">' + draft + '<div class="row" style="justify-content:space-between"><span class="small muted mono" id="wc"></span><button class="btn sm" data-act="star-timer" id="stbtn">Start 2-min speaking timer</button></div><h3 style="margin-top:6px">Self-check</h3>' + checks + ai + '<div class="row" style="margin-top:6px"><button class="btn primary" data-act="star-done">Mark as practised (+20 XP)</button><button class="btn" data-tab="model">Compare with example</button></div></div>' : model + '<div class="row" style="margin-top:14px"><button class="btn" data-tab="draft">Back to your answer</button></div>') + "</div></main>";
}
function starWords() { const d = S.star[VIEW.pid] || {}; const w = ["S", "T", "A", "R"].map(k => (d[k] || "").trim().split(/\s+/).filter(Boolean).length).reduce((a, b) => a + b, 0); const el = document.getElementById("wc"); if (el) el.textContent = w + " words · about " + Math.max(0, Math.round(w / 140 * 60)) + "s spoken"; }

// ---------- question packs ----------
function withTimeout(p, ms) { return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej({ code: "timeout" }), ms))]); }
async function loadLivePacks() {
  try {
    const snap = await withTimeout(LIVE.db.collection("packs").get(), 8000);
    let added = 0; snap.docs.forEach(d => { added += addPack(d.data()); });
    if (added) renderSoft();
  } catch (e) { console.warn("packs unavailable", e && e.code); }
  packsDone();
}
function packBlurb() {
  const p = latestPack(); if (!p) return "Fresh questions are added on the 1st of each month.";
  const left = p.ids.filter(id => !S.q[id]).length;
  return p.ids.length + " questions added for " + CQC.monthLabel(p.month) + (left ? ", " + left + " not tried yet." : ". You've tried them all.");
}
function packCount() { const p = latestPack(); return p ? esc(p.title) : "Next pack on the 1st"; }
function packChip(id) { const x = QI[id]; return x && x.pack ? ' <span class="newdot">NEW · ' + esc(CQC.monthLabel(x.pack)) + (x.tag === "news" ? " · IN THE NEWS" : "") + "</span>" : ""; }
function srcLink(id) { const x = QI[id]; return x && x.src ? '<div class="small" style="margin-top:6px"><a href="' + esc(x.src) + '" target="_blank" rel="noopener noreferrer">Source</a></div>' : ""; }

// ---------- monthly challenge ----------
function rid() { const a = new Uint8Array(9); crypto.getRandomValues(a); return Array.from(a, b => (b % 36).toString(36)).join(""); }
function fmtMs(ms) { const s = Math.round((ms || 0) / 1000); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
function fmtN(n) { return Number(n || 0).toLocaleString("en-IE"); }
function daysLeft() { const now = new Date(); const next = new Date(now.getFullYear(), now.getMonth() + 1, 1); return Math.max(1, Math.ceil((next - now) / DAY)); }
// Junior-level questions only, the same rule the server uses to re-check posted runs.
function challengeSet(month) {
  const core = MODULES.filter(m => m.id !== "starq").map(m => ({ id: m.id, ids: m.baseIds.filter(id => QI[id].j) }));
  const p = PACKS[month]; return CQC.pick(month, core, p ? p.ids.filter(id => QI[id].j) : []);
}
let starting = false;
async function startChallenge() {
  if (starting) return; starting = true;
  if (MODE === "artifact") await Promise.race([LIVE.packsReady, new Promise(r => setTimeout(r, 4000))]);
  starting = false;
  const month = CQC.monthKey(); const ids = challengeSet(month);
  SESSION = { kind: "challenge", month, title: "Monthly Challenge", code: "MC", items: ids.map(buildItem), i: 0, streak: 0, best: 0, points: 0, xp: 0, started: Date.now(), qStart: Date.now() };
  VIEW = { screen: "challenge" }; render(); window.scrollTo(0, 0);
}
function challengeAnswer(idx) {
  const s = SESSION, it = s.items[s.i]; const now = Date.now();
  it.picked = idx; it.ms = now - s.qStart; it.ok = idx === it.correct;
  if (it.ok) { s.streak++; s.best = Math.max(s.best, s.streak); it.pts = CQC.points(Math.min(it.ms, CQC.PER_Q_MS), s.streak); s.points += it.pts; }
  else { s.streak = 0; it.pts = 0; }
  recordAnswer(it.id, it.ok, now); save(); render();
}
function challengeTick() {
  const s = SESSION, el = document.getElementById("bonus"); if (!s || !el) return;
  const it = s.items[s.i]; if (it.picked !== null) { el.textContent = ""; return; }
  const ms = Date.now() - s.qStart; el.textContent = "+" + CQC.points(ms, s.streak + 1) + " if right";
  el.classList.toggle("low", ms > CQC.PER_Q_MS * 0.7);
}
function finishChallenge() {
  const s = SESSION; const sc = CQC.score(s.items.map(it => ({ ok: !!it.ok, ms: it.ms || 0 })));
  const before = levelFor(S.xp).lvl; s.final = sc; s.xp = Math.round(sc.score / 50); S.xp += s.xp;
  const run = { id: rid(), month: s.month, score: sc.score, correct: sc.correct, total: s.items.length, ms: sc.ms, at: Date.now() };
  S.runs = (S.runs || []).concat([run]).slice(-100); s.run = run;
  S.history.push({ t: Date.now(), k: "challenge", m: "MC", n: s.items.length, c: sc.correct });
  recordActivity(); s.levelUp = levelFor(S.xp).lvl > before ? levelFor(S.xp) : null; s.done = true;
  save(true); syncFocus();
  VIEW = { screen: "cresult", filter: sc.correct < s.items.length ? "missed" : "all" }; render(); window.scrollTo(0, 0);
}
function optionButtons(it) {
  const keys = ["A", "B", "C", "D"]; const done = it.picked !== null;
  return it.opts.map((o, i) => { let cls = "opt"; if (done) { if (i === it.correct) cls += " right"; else if (i === it.picked) cls += " wrong"; } return '<button class="' + cls + '" data-ans="' + i + '"' + (done ? " disabled" : "") + '><span class="k">' + keys[i] + "</span><span>" + fmt(o) + "</span></button>"; }).join("");
}
function explainBox(it, verdictExtra) {
  const q = QI[it.id].q; const ok = it.picked === it.correct; const timedOut = it.picked === -1;
  return '<div class="explain fade" role="status"><div class="verdict ' + (ok ? "ok" : "bad") + '">' + (ok ? "Correct" : timedOut ? "Time's up" : "Not quite") + (verdictExtra || "") + "</div>" +
    (!ok ? '<div class="small" style="margin-bottom:6px"><b>Answer:</b> ' + fmt(q[1]) + "</div>" : "") + '<div class="small"><b>Why:</b> ' + fmt(q[3]) + "</div>" + srcLink(it.id) + "</div>";
}
function viewChallenge() {
  const s = SESSION, it = s.items[s.i], x = QI[it.id], q = x.q, m = x.m; const done = it.picked !== null;
  const prog = s.items.map((y, i) => '<i class="' + (i === s.i && !done ? "cur" : y.picked === null ? "" : y.ok ? "ok" : "bad") + '"></i>').join("");
  const extra = it.ok ? ' <span class="xpfloat">+' + it.pts + " pts</span>" : done ? ' <span class="muted small">· 0 pts, streak reset</span>' : "";
  return '<main class="wrap"><div class="quiz"><div class="qhead"><button class="back" data-act="quit">' + I.back + ' End run</button><span class="row" style="gap:8px"><span class="pill mono">MC</span><span class="small muted mono">' + (s.i + 1) + "/" + s.items.length + '</span><span class="chip hot mono">' + fmtN(s.points) + " pts</span>" + (s.streak > 1 ? '<span class="chip">' + s.streak + "x streak</span>" : "") + '</span></div><div class="progress dense">' + prog + '</div>' +
    '<div class="card fade" style="padding:18px"><div class="row" style="justify-content:space-between;gap:8px"><div class="eyebrow">' + esc(m.name) + packChip(it.id) + '</div><span class="timer mono small" id="bonus" aria-live="off"></span></div><div class="qtext">' + fmt(q[0]) + '</div><div class="opts" role="group" aria-label="Answer options">' + optionButtons(it) + "</div>" + (done ? explainBox(it, extra) : "") + "</div>" +
    (done ? '<div class="qfoot"><button class="btn primary" data-act="next">' + (s.i < s.items.length - 1 ? "Next question" : "Finish and see score") + "</button></div>" : "") + "</div></main>";
}
function reviewList(items, filter) {
  const rows = items.map((it, n) => ({ it, n })).filter(({ it }) => filter === "all" || it.picked !== it.correct);
  if (!rows.length) return '<p class="muted small">Nothing to show here. Every answer was right.</p>';
  return rows.map(({ it, n }) => {
    const q = QI[it.id].q; const ok = it.picked === it.correct;
    return '<div class="miss"><div class="row" style="gap:6px;margin-bottom:4px"><span class="pill mono">Q' + (n + 1) + '</span><span class="pill mono">' + QI[it.id].m.code + '</span><span class="tag ' + (ok ? "ok" : "bad") + '">' + (ok ? "Right" : "Missed") + '</span></div><div class="q">' + fmt(q[0]) + "</div>" +
      (!ok ? (it.picked !== null && it.picked >= 0 ? '<div class="ans bad"><b>YOU</b><span>' + fmt(it.opts[it.picked]) + "</span></div>" : '<div class="ans bad"><b>YOU</b><span class="muted">No answer</span></div>') : "") +
      '<div class="ans ok"><b>ANSWER</b><span>' + fmt(q[1]) + '</span></div><div class="small muted" style="margin-top:4px">' + fmt(q[3]) + "</div>" + srcLink(it.id) + "</div>";
  }).join("");
}
function reviewCard(items) {
  const missed = items.filter(it => it.picked !== it.correct).length; const f = VIEW.filter || (missed ? "missed" : "all");
  return '<div class="card"><div class="row" style="justify-content:space-between"><h3>Answer review</h3><span class="seg" role="group"><button data-act="filter" data-f="missed" aria-pressed="' + (f === "missed") + '">Missed (' + missed + ')</button><button data-act="filter" data-f="all" aria-pressed="' + (f === "all") + '">All (' + items.length + ")</button></span></div>" + reviewList(items, f) + "</div>";
}
function boardNote() {
  if (BOARD.shared && MODE === "artifact") return "Everyone you share this page with sees the same scoreboard and can post their own runs.";
  if (BOARD.shared) return "This site's shared scoreboard. Each player's best run counts, and every score is re-checked on the server.";
  return "The shared scoreboard isn't reachable, so scores are kept on this device.";
}
function viewCResult() {
  const s = SESSION, sc = s.final, run = s.run, n = s.items.length;
  const rank = run.posted ? (run.rank || rankOf(run.id, run.month)) : 0;
  let post;
  if (run.posted || run.postedLocal) post = '<div class="notice"><b>On the board as ' + esc(run.name) + "</b>" + (rank ? " · rank #" + rank + " for " + esc(CQC.monthLabel(run.month)) : "") + (run.improved === false && run.best ? '<div class="small">Your best this month, ' + fmtN(run.best) + " pts, stays on the board.</div>" : "") + '<div class="small muted">' + boardNote() + "</div></div>";
  else if (MODE === "web" && (!ACC.user || ACC.expired)) post = '<div class="post stack" style="gap:8px"><b>Put your score on the scoreboard</b><div class="small">Sign in or create a free account to post. Your run is kept while you do.</div><div class="row"><button class="btn primary" data-auth="signin" data-next="cresult">Sign in to post</button><button class="btn" data-auth="signup" data-next="cresult">Create account</button></div></div>';
  else if (MODE === "web") post = '<div class="post stack" style="gap:8px"><b>Post to the scoreboard as ' + esc(ACC.user.displayName) + '</b><div class="row"><button class="btn primary" data-act="post-score">Post score</button></div><div class="small muted">' + boardNote() + "</div></div>";
  else post = '<div class="post stack" style="gap:8px"><label for="pname"><b>Put your score on the scoreboard</b></label><div class="row"><input type="text" id="pname" maxlength="24" value="' + esc(VIEW.pname != null ? VIEW.pname : (S.settings.playerName || "")) + '" placeholder="Your name or nickname" autocomplete="nickname" style="flex:1;min-width:180px"><button class="btn primary" data-act="post-score">Post score</button></div><div class="small muted">' + boardNote() + "</div></div>";
  const verdict = sc.correct === n ? "Perfect run." : sc.correct >= 40 ? "Excellent run." : sc.correct >= 30 ? "Solid run." : "Every miss is now in your review queue.";
  const top = monthEntries(run.month).slice(0, 5);
  return '<main class="wrap fade"><div class="quiz stack">' + (s.levelUp ? '<div class="card lvlup"><div class="eyebrow">Promotion</div><h2>Level ' + s.levelUp.lvl + ": " + esc(s.levelUp.title) + "</h2></div>" : "") +
    '<div class="card stack"><div class="eyebrow">Monthly Challenge · ' + esc(CQC.monthLabel(run.month)) + '</div><div class="row" style="align-items:flex-end;gap:16px"><div class="bigscore mono">' + fmtN(sc.score) + '</div><div class="muted small mono" style="padding-bottom:6px">points</div></div><h2>' + verdict + '</h2><div class="muted small mono">' + sc.correct + "/" + n + " correct · answer time " + fmtMs(sc.ms) + " · best streak " + s.best + " · +" + s.xp + " XP</div>" + post +
    '<div class="row"><button class="btn" data-act="board">Scoreboard</button><button class="btn" data-act="challenge">Play again</button><button class="btn primary" data-go="home">Done</button></div></div>' +
    (top.length ? '<div class="card"><h3>Top of the board</h3>' + boardTable(top, run.id) + "</div>" : "") + reviewCard(s.items) + "</div></main>";
}

// ---------- scoreboard ----------
const BOARD = { status: "idle", entries: [], shared: false, at: 0 };
let boardUnsub = null;
const cleanName = v => String(v || "").replace(/[\u0000-\u001f\u007f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 24);
function validRun(r) { return r && typeof r.id === "string" && /^\d{4}-\d{2}$/.test(r.month || "") && typeof r.score === "number" && r.score >= 0 && r.score <= CQC.MAX && Number.isInteger(r.correct) && r.correct >= 0 && r.correct <= CQC.SIZE && typeof r.ms === "number" && typeof r.name === "string" && r.name.length <= 24; }
const byScore = (a, b) => b.score - a.score || a.ms - b.ms || a.at - b.at;
function boardEntries() {
  if (BOARD.shared) return BOARD.entries;
  return (S.runs || []).filter(r => r.name).map(r => Object.assign({}, r, { mine: true }));
}
function monthEntries(month) { return boardEntries().filter(e => e.month === month).sort(byScore); }
function rankOf(id, month) { const i = monthEntries(month).findIndex(e => e.id === id); return i < 0 ? 0 : i + 1; }
function renderSoft() {
  const a = document.activeElement; if (a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA")) return;
  if (["home", "board", "cresult", "module", "settings", "auth", "cases", "learn"].includes(VIEW.screen)) render();
}
function loadBoard(force) {
  if (MODE === "artifact") {
    if (!LIVE.db || boardUnsub) return;
    BOARD.status = "loading";
    boardUnsub = LIVE.db.collection("scores").onSnapshot(snap => {
      const out = [];
      snap.docs.forEach(d => { const v = d.data() || {}; (Array.isArray(v.runs) ? v.runs : []).forEach(r => { if (validRun(r)) out.push(Object.assign({}, r, { mine: d.id === LIVE.uid })); }); });
      BOARD.entries = out; BOARD.status = "ready"; BOARD.shared = true; renderSoft();
    }, () => { BOARD.status = "local"; BOARD.shared = false; boardUnsub = null; renderSoft(); });
    return;
  }
  if (!force && Date.now() - BOARD.at < 60e3) return;
  BOARD.at = Date.now(); if (!BOARD.shared) BOARD.status = "loading";
  const get = u => fetch(u, { credentials: "same-origin" }).then(r => r.ok ? r.json() : Promise.reject(r.status));
  Promise.all([get("/api/scores?month=" + CQC.monthKey()), get("/api/scores?scope=all")]).then(([a, b]) => {
    const mine = new Set((S.runs || []).filter(r => r.posted).map(r => r.id)); const map = {};
    (a.entries || []).concat(b.entries || []).forEach(e => { if (validRun(e)) map[e.id] = Object.assign({}, e, { mine: !!e.mine || mine.has(e.id) }); });
    BOARD.entries = Object.values(map); BOARD.status = "ready"; BOARD.shared = true; renderSoft();
  }).catch(() => { BOARD.status = "local"; BOARD.shared = false; renderSoft(); });
}
async function postScore(btn) {
  const s = SESSION, run = s && s.run; if (!run) return;
  let name;
  if (MODE === "web") {
    if (!ACC.user || ACC.expired) { goAuth("signin", "cresult"); return; }
    name = ACC.user.displayName;
  } else {
    const input = document.getElementById("pname"); name = cleanName(input && input.value);
    if (!name) { toast("Type a name or nickname first."); if (input) input.focus(); return; }
    S.settings.playerName = name;
  }
  run.name = name; btn.disabled = true; btn.textContent = "Posting...";
  if (!(S.runs || []).some(r => r.id === run.id)) S.runs = (S.runs || []).concat([run]).slice(-100);
  try {
    if (MODE === "artifact" && LIVE.db && LIVE.uid) {
      const ref = LIVE.db.doc("scores/" + LIVE.uid); const snap = await ref.get(); const cur = snap.exists ? snap.data() : {};
      const mineRuns = (Array.isArray(cur.runs) ? cur.runs : []).filter(r => r.id !== run.id);
      mineRuns.push({ id: run.id, name, month: run.month, score: run.score, correct: run.correct, total: run.total, ms: run.ms, at: run.at });
      await ref.set({ runs: mineRuns.slice(-60), updated: Date.now() });
      run.posted = true; toast("Score posted");
    } else if (MODE === "web") {
      const body = { id: run.id, month: run.month, results: s.items.map(it => ({ id: it.id, a: it.picked >= 0 ? CQC.hashInt(it.opts[it.picked]) : 0, ms: Math.round(it.ms || 0) })) };
      const r = await api("/api/scores", { method: "POST", body });
      if (r.status === 401) { sessionEnded(); btn.disabled = false; btn.textContent = "Post score"; render(); return; }
      if (!r.ok) throw new Error(r.data.error || "HTTP " + r.status);
      const j = r.data; if (j.entry) { run.score = j.entry.score; run.correct = j.entry.correct; }
      run.rank = j.rank || 0; run.improved = j.improved; run.best = j.best ? j.best.score : 0; run.posted = true;
      toast(j.improved ? "Score posted" : "Posted. Your best this month stays on the board.");
      BOARD.at = 0; loadBoard(true);
    } else throw new Error("no shared board");
  } catch (e) {
    console.warn("post failed", e && (e.code || e.message));
    if (MODE === "web") { toast("Couldn't post: " + ((e && e.message) || "server not reachable") + ". Try again."); btn.disabled = false; btn.textContent = "Post score"; save(); return; }
    run.postedLocal = true; toast("Saved on this device. The shared scoreboard isn't reachable right now.");
  }
  VIEW.pname = null; save(); render();
}
function boardTable(list, hiId) {
  if (!list.length) return '<p class="muted small">No scores yet. Be the first on the board.</p>';
  return '<div class="tablewrap"><table class="board"><thead><tr><th>#</th><th>Name</th><th class="num">Score</th><th class="num">Correct</th><th class="num">Time</th><th class="hide-sm">Date</th></tr></thead><tbody>' +
    list.map((e, i) => '<tr class="' + (e.id === hiId || (e.mine && !hiId) ? "me" : "") + '"><td><span class="rank r' + (i < 3 ? i + 1 : 0) + '">' + String(i + 1).padStart(2, "0") + "</span></td><td>" + esc(e.name) + (e.mine ? ' <span class="muted small">(you)</span>' : "") + '</td><td class="num mono">' + fmtN(e.score) + '</td><td class="num mono">' + e.correct + "/" + (e.total || CQC.SIZE) + '</td><td class="num mono">' + fmtMs(e.ms) + '</td><td class="hide-sm small muted">' + new Date(e.at).toLocaleDateString("en-IE", { day: "numeric", month: "short" }) + "</td></tr>").join("") + "</tbody></table></div>";
}
function viewBoard() {
  const tab = VIEW.tab || "month"; const month = CQC.monthKey();
  let body = "";
  if (tab === "month") body = boardTable(monthEntries(month).slice(0, 50));
  else if (tab === "all") body = boardTable(boardEntries().slice().sort(byScore).slice(0, 50));
  else {
    const runs = (S.runs || []).slice().reverse();
    body = runs.length ? '<div class="tablewrap"><table class="board"><thead><tr><th>Date</th><th>Set</th><th class="num">Score</th><th class="num">Correct</th><th class="num">Time</th><th>Board</th></tr></thead><tbody>' + runs.map(r => "<tr><td class=\"small\">" + new Date(r.at).toLocaleDateString("en-IE", { day: "numeric", month: "short" }) + '</td><td class="small">' + esc(CQC.monthLabel(r.month)) + '</td><td class="num mono">' + fmtN(r.score) + '</td><td class="num mono">' + r.correct + "/" + (r.total || CQC.SIZE) + '</td><td class="num mono">' + fmtMs(r.ms) + '</td><td class="small">' + (r.posted ? "Posted as " + esc(r.name) : r.postedLocal ? "This device" : "Not posted") + "</td></tr>").join("") + "</tbody></table></div>" : '<p class="muted small">You haven\'t played a Monthly Challenge yet.</p>';
  }
  const status = BOARD.status === "loading" ? "Loading the scoreboard..." : BOARD.shared ? (MODE === "artifact" ? "Shared with everyone who can open this page." : "Shared scoreboard for this site.") : "Showing scores saved on this device.";
  return '<main class="wrap fade"><button class="back" data-go="home">' + I.back + ' Home</button><div class="stack" style="max-width:860px;margin:8px auto 0"><div><div class="eyebrow">Monthly Challenge</div><h1>Scoreboard</h1><p class="muted small" style="margin:6px 0 0">50 mixed junior-level questions, the same set for everyone this month. 100 points per right answer, up to +50 for speed and up to +50 for a streak. New set in ' + daysLeft() + " day" + (daysLeft() === 1 ? "" : "s") + ".</p></div>" +
    '<div class="row" style="justify-content:space-between"><span class="seg" role="group"><button data-act="board-tab" data-tab="month" aria-pressed="' + (tab === "month") + '">' + esc(CQC.monthLabel(month)) + '</button><button data-act="board-tab" data-tab="all" aria-pressed="' + (tab === "all") + '">All time</button><button data-act="board-tab" data-tab="mine" aria-pressed="' + (tab === "mine") + '">My runs</button></span><button class="btn primary sm" data-act="challenge">Play this month\'s 50</button></div>' +
    '<div class="card">' + body + '<div class="small muted" style="margin-top:10px">' + status + "</div></div></div></main>";
}
function challengeCard() {
  const month = CQC.monthKey(); const mine = (S.runs || []).filter(r => r.month === month);
  const best = mine.reduce((b, r) => (!b || r.score > b.score ? r : b), null); const mi = monthEntries(month).findIndex(e => e.mine); const rank = mi >= 0 ? mi + 1 : 0;
  const top = monthEntries(month).slice(0, 3);
  const rows = top.length ? top.map((e, i) => '<div class="mini"><span class="rank r' + (i + 1) + '">' + String(i + 1).padStart(2, "0") + '</span><span class="nm">' + esc(e.name) + '</span><span class="mono">' + fmtN(e.score) + "</span></div>").join("") : '<div class="mini"><span class="muted small">No scores yet this month. Set the bar.</span></div>';
  const p = PACKS[month];
  return '<section class="card challenge" aria-label="Monthly Challenge"><div class="stack" style="gap:10px"><div class="eyebrow">Monthly Challenge · Set ' + esc(CQC.monthLabel(month)) + '</div><h2>50 mixed questions. One scoreboard.</h2><p class="small" style="margin:0;opacity:.82">The same 50 junior-level questions for everyone, drawn from every domain' + (p && p.ids.length ? ", including this month's new pack" : "") + ". An explanation follows every answer. The set changes in " + daysLeft() + " day" + (daysLeft() === 1 ? "" : "s") + ".</p>" +
    '<div class="row"><button class="btn primary" data-act="challenge">Play 50 questions</button><button class="btn ghost onhead" data-act="board">Scoreboard</button></div></div>' +
    '<div class="stack" style="gap:6px"><div class="eyebrow">Top this month</div>' + rows + '<div class="small" style="opacity:.75;margin-top:4px">' + (best ? "Your best: " + fmtN(best.score) + " pts" + (rank ? " · rank #" + rank : " · not posted") : "You haven't played this month's set yet.") + "</div></div></section>";
}

// ---------- AI feedback (artifact only) ----------
const AI = { available: false, fn: null };
async function initAI() {
  if (MODE !== "artifact" || !window.claude || !window.claude.use) return;
  try { const s = await window.claude.use("sample"); if (s) { AI.fn = s; AI.available = true; if (VIEW.screen === "stardetail") render(); } } catch (e) { }
}
async function aiFeedback(btn) {
  const p = STAR.prompts.find(x => x.id === VIEW.pid); const d = S.star[p.id] || {}; const out = document.getElementById("aiout");
  if (!["S", "T", "A", "R"].some(k => (d[k] || "").trim())) { toast("Write your answer first."); return; }
  out.hidden = false; out.textContent = "Thinking..."; btn.disabled = true;
  const prompt = "You are an interview coach for cybersecurity and GRC roles in Ireland. Evaluate this candidate's spoken STAR answer.\n\nQuestion: " + p.q + "\nCompetency: " + p.competency +
    "\n\nSituation: " + (d.S || "(blank)") + "\nTask: " + (d.T || "(blank)") + "\nAction: " + (d.A || "(blank)") + "\nResult: " + (d.R || "(blank)") +
    "\n\nReply in plain text with these short sections: Score (out of 10, one line). Strengths (2 bullets). Improve (3 specific bullets: own role vs team, concrete actions, measurable result, brevity of situation). Stronger result line (one rewritten sentence that only uses facts the candidate gave, with [brackets] for any number they still need to add). Keep it under 220 words.";
  try { await AI.fn(prompt, { onText: ({ text }) => { out.textContent = text; }, cache: false }); }
  catch (e) { if (e && e.code === "not_granted" || e && e.code === "sampling_disabled") { AI.available = false; out.textContent = "AI feedback isn't available in this view."; } else { out.textContent = (e && e.text) || "Feedback didn't come through. Try again in a moment."; } }
  btn.disabled = false;
}

// ---------- settings / reminders ----------
function isIOS() { return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); }
function isStandalone() { return (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true; }
function pushState() {
  if (MODE !== "web") return "unsupported";
  if (S.push.enabled && "Notification" in window && Notification.permission === "granted") return "on";
  if (isIOS() && !isStandalone()) return "install";
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  return "off";
}
function b64ToU8(b) { const p = "=".repeat((4 - b.length % 4) % 4); const s = atob((b + p).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(s, c => c.charCodeAt(0)); }
async function pushOn() {
  if (!ACC.user || ACC.expired) { goAuth("signup"); toast("Create an account (or sign in) to turn on reminders."); return; }
  try {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") { toast("Notifications were not allowed."); render(); return; }
    const reg = await navigator.serviceWorker.ready;
    const r = await fetch("/api/vapid"); if (!r.ok) throw new Error("vapid " + r.status);
    const { publicKey } = await r.json();
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToU8(publicKey) });
    await sendSub(sub);
    S.push.enabled = true; S.push.endpoint = sub.endpoint; save(); render(); toast("Reminders on: every 4 hours, quiet 23:00 to 07:00");
  } catch (e) { console.warn(e); toast("Couldn't turn on reminders. The site's push service may not be set up yet."); }
}
async function sendSub(sub) {
  const prefs = { interval: S.push.interval || 4, quietStart: S.push.quietStart ?? 23, quietEnd: S.push.quietEnd ?? 7, tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Dublin" };
  const r = await fetch("/api/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ subscription: sub.toJSON ? sub.toJSON() : sub, prefs, focus: Array.from(new Set(Array.from(focusSet()).concat(weakest(6)))).slice(0, 10) }) });
  if (r.status === 401) { sessionEnded(); throw new Error("signed out"); }
  if (!r.ok) throw new Error("subscribe " + r.status);
  S.push.focusSent = today();
}
async function syncFocus() {
  if (MODE !== "web" || !ACC.user || ACC.expired || !S.push.enabled || S.push.focusSent === today()) return;
  try { const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.getSubscription(); if (sub) { await sendSub(sub); save(); } } catch (e) { }
}
async function pushOff() {
  try { const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.getSubscription(); if (sub) { await fetch("/api/subscribe", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) }); await sub.unsubscribe(); } } catch (e) { }
  S.push.enabled = false; save(); render(); toast("Reminders off");
}
async function pushTest() {
  try { const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.getSubscription(); if (!sub) throw 0; const r = await fetch("/api/test-push", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) }); toast(r.ok ? "Test sent. It should arrive in a few seconds." : "Test failed (" + r.status + ")"); } catch (e) { toast("No active subscription on this device."); }
}
function seg(name, values, cur, labels) { return '<span class="seg" role="group">' + values.map((v, i) => '<button data-set="' + name + '" data-val="' + v + '" aria-pressed="' + (String(cur) === String(v)) + '">' + (labels ? labels[i] : v) + "</button>").join("") + "</span>"; }
function field(name, label, type, ac, opts) {
  opts = opts || {};
  return '<div class="field"><label for="f-' + name + '">' + label + "</label>" + (opts.hint ? '<div class="hint">' + opts.hint + "</div>" : "") + '<input id="f-' + name + '" name="' + name + '" type="' + type + '" autocomplete="' + ac + '"' + (opts.attrs || "") + (opts.value != null ? ' value="' + esc(opts.value) + '"' : "") + "></div>";
}
const UATTR = ' autocapitalize="none" autocorrect="off" spellcheck="false" maxlength="20"';
function accountCard() {
  if (MODE !== "web") return "";
  if (!ACC.user) return '<div class="card stack"><h2>Account</h2><p class="small muted" style="margin:0">You\'re playing as a guest, so progress is saved on this device only. With a free account your progress follows you to any device, you can post to the scoreboard and get reminders. Guest progress can be moved into a new account.</p><div class="row"><button class="btn sm primary" data-auth="signup">Create account</button><button class="btn sm" data-auth="signin">Sign in</button></div></div>';
  const u = ACC.user;
  return '<div class="card stack"><h2>Account</h2><div class="small">Signed in as <b>' + esc(u.displayName) + '</b> <span class="muted mono">@' + esc(u.username) + "</span>" + (ACC.expired ? ' <span class="tag bad">SIGNED OUT</span> <button class="btn sm primary" data-auth="signin">Sign in again</button>' : "") + "</div>" +
    '<form class="stack" data-form="profile" novalidate style="gap:6px"><div class="field"><label for="f-dn">Display name</label><div class="hint">Shown on the scoreboard instead of your username.</div><div class="row"><input id="f-dn" name="displayName" type="text" maxlength="24" autocomplete="nickname" value="' + esc(u.displayName) + '" style="flex:1;min-width:180px"><button class="btn sm" type="submit">Save</button></div></div><p class="formerr" role="alert" hidden></p></form>' +
    '<details><summary><b>Change password</b></summary><form class="stack" data-form="password" novalidate style="margin-top:10px">' + '<input type="text" name="username" autocomplete="username" value="' + esc(u.username) + '" hidden>' + field("current", "Current password", "password", "current-password", { attrs: ' maxlength="128"' }) + field("password", "New password", "password", "new-password", { attrs: ' maxlength="128"', hint: "At least 8 characters. Other devices will be signed out." }) + field("password2", "Repeat new password", "password", "new-password", { attrs: ' maxlength="128"' }) + '<p class="formerr" role="alert" hidden></p><button class="btn sm primary" type="submit">Change password</button></form></details>' +
    '<div class="row"><button class="btn sm" data-act="signout">Sign out on this device</button></div>' +
    '<details><summary><b>Delete account</b></summary><form class="stack" data-form="delete" novalidate style="margin-top:10px"><p class="small muted" style="margin:0">Deletes your account, saved progress, scoreboard entries and reminder subscriptions. This can\'t be undone.</p>' + field("password", "Password", "password", "current-password", { attrs: ' maxlength="128"' }) + '<p class="formerr" role="alert" hidden></p><button class="btn sm dark" type="submit">Delete my account</button></form></details></div>';
}
function focusCard() {
  const f = focusSet();
  return '<div class="card stack"><h2>Focus areas</h2><p class="small muted" style="margin:0">Pick up to ' + MAX_FOCUS + " modules to prioritise, for example the skills in a job advert. Next-drill picks and reminders lean towards them. " + f.size + "/" + MAX_FOCUS + ' chosen.</p><div class="chips">' +
    MODULES.filter(m => m.id !== "starq").map(m => '<button class="chipsel" data-act="focus" data-mid="' + m.id + '" aria-pressed="' + f.has(m.id) + '">' + esc(m.name) + "</button>").join("") + "</div></div>";
}
function viewSettings() {
  const ps = pushState(); let rem = "";
  if (MODE === "web") {
    const st = { on: "On", off: "Off", install: "Needs Home Screen install", denied: "Blocked in device settings", unsupported: "Not supported in this browser" }[ps];
    const canPush = ACC.user && !ACC.expired;
    rem = '<div class="card stack"><h2>Reminders</h2><div class="set"><div><b>Push reminders</b><div class="small muted">' + (canPush ? "Every " + (S.push.interval || 4) + " hours, quiet " + String(S.push.quietStart ?? 23).padStart(2, "0") + ":00 to " + String(S.push.quietEnd ?? 7).padStart(2, "0") + ":00. Status: " + st : "Sign in to get a reminder every few hours on this device.") + '</div></div><div class="row">' + (!canPush ? '<button class="btn sm" data-auth="signin">Sign in</button>' : ps === "on" ? '<button class="btn sm" data-act="push-test">Send test</button><button class="btn sm" data-act="push-off">Turn off</button>' : ps === "off" ? '<button class="btn sm primary" data-act="push-on">Turn on</button>' : "") + "</div></div>" +
      '<div class="set"><div><b>Interval</b><div class="small muted">Applies the next time reminders are switched on or refreshed.</div></div>' + seg("interval", [2, 3, 4, 6], S.push.interval || 4, ["2h", "3h", "4h", "6h"]) + "</div>" +
      '<div class="set"><div><b>Calendar backup</b><div class="small muted">Adds daily alerts at 08:00, 12:00, 16:00 and 20:00 to your phone\'s calendar. Works everywhere, no push needed.</div></div><a class="btn sm" href="/api/calendar.ics">Add to calendar</a></div>' +
      '<details><summary><b>Install on iPhone or iPad</b></summary><ol class="steps small"><li>Open this site in <b>Safari</b>.</li><li>Tap <b>Share</b>, then <b>Add to Home Screen</b>.</li><li>Open CyberQuest from the new icon and sign in.</li><li>Tap <b>Turn on reminders</b> and allow notifications.</li></ol></details></div>';
  } else {
    rem = '<div class="card stack"><h2>Reminders and sync</h2><p class="small muted" style="margin:0">Progress here is saved to your account, so it follows you to any device where you open this page. For push notifications every 4 hours, use the Netlify version and add it to your Home Screen.</p><div class="small mono muted">Storage: ' + (store.kind === "account" ? "your account" : "this browser only") + "</div></div>";
  }
  return '<main class="wrap fade"><button class="back" data-go="home">' + I.back + ' Home</button><div class="stack" style="max-width:760px;margin:8px auto 0"><h1>Settings</h1>' + accountCard() +
    '<div class="card"><h2>Drills</h2><div class="set"><div><b>Question level</b><div class="small muted">' + LEVEL_HELP[level()] + ' The Monthly Challenge always uses junior questions, so everyone plays the same set.</div></div>' + seg("level", ["junior", "mixed", "advanced"], level(), ["Junior", "Mixed", "Advanced"]) + '</div><div class="set"><div><b>Questions per drill</b></div>' + seg("perDrill", [5, 10, 15, 20], S.settings.perDrill || 10) + '</div><div class="set"><div><b>Per-question timer</b><div class="small muted">Adds a countdown. Time-outs count as wrong.</div></div>' + seg("timer", [0, 30, 60], S.settings.timer || 0, ["Off", "30s", "60s"]) + "</div></div>" + focusCard() + rem +
    '<div class="card stack"><h2>Your data</h2><div class="row"><button class="btn sm" data-act="export">Export progress (.json)</button><label class="btn sm" for="importf">Import progress</label><input type="file" id="importf" accept="application/json,.json" hidden></div><div class="row"><button class="btn sm" data-act="reset" id="resetbtn">Reset all progress</button></div>' + (MODE === "artifact" ? '<div class="row"><button class="btn sm" data-act="export-packs">Export question packs (.json)</button><span class="small muted">For adding this month\'s new questions to the Netlify version.</span></div>' : "") + '</div>' +
    '<p class="small muted">CyberQuest · ' + TOTAL_Q + " questions across " + MODULES.length + " modules (" + MODULES.reduce((a, m) => a + (m.id === "starq" ? 0 : m.ids.filter(id => QI[id].j).length), 0) + " junior), " + CASE_LIST.length + " case files, " + LEARN_LIST.length + " learn sheets and " + STAR.prompts.length + " STAR prompts. Question facts reflect standards as of 2025-2026; check primary sources before quoting them in an audit.</p></div></main>";
}
// ---------- sign-in portal (web) ----------
function viewLoading() { return '<main class="wrap"><div class="auth"><div class="card"><p class="muted" style="margin:0">Loading CyberQuest...</p></div></div></main>'; }
function viewAuth() {
  const tab = VIEW.tab || "signin";
  const hero = '<div class="hero"><div class="eyebrow">CyberQuest</div><h1>Cybersecurity practice, one drill at a time</h1><p class="muted small" style="margin:6px 0 0">' + MODULES.length + " modules from Linux and Windows basics to ISO 27001, NIST, GDPR and SOC 2, a monthly 50-question challenge with a scoreboard, and a STAR interview coach. Every player has their own account and progress.</p></div>";
  let body;
  if (tab === "reset") {
    body = '<h2>Reset your password</h2><form class="stack" data-form="reset" novalidate>' + field("username", "Username", "text", "username", { attrs: UATTR }) + field("recovery", "Recovery code", "text", "one-time-code", { attrs: ' autocapitalize="characters" spellcheck="false" maxlength="40"', hint: "The code you saved when you created your account." }) + field("password", "New password", "password", "new-password", { attrs: ' maxlength="128"', hint: "At least 8 characters." }) + field("password2", "Repeat new password", "password", "new-password", { attrs: ' maxlength="128"' }) + '<p class="formerr" role="alert" hidden></p><button class="btn primary block" type="submit">Reset password</button><button type="button" class="linkbtn" data-tab="signin">Back to sign in</button></form><p class="small muted" style="margin:0">Lost the recovery code too? Create a new account; there\'s no email reset, because CyberQuest doesn\'t store email addresses.</p>';
  } else {
    const tabs = '<div class="tabs" role="tablist"><button class="tab" role="tab" aria-selected="' + (tab === "signin") + '" data-tab="signin">Sign in</button><button class="tab" role="tab" aria-selected="' + (tab === "signup") + '" data-tab="signup">Create account</button></div>';
    body = tabs + (tab === "signin"
      ? '<form class="stack" data-form="signin" novalidate>' + field("username", "Username", "text", "username", { attrs: UATTR }) + field("password", "Password", "password", "current-password", { attrs: ' maxlength="128"' }) + '<p class="formerr" role="alert" hidden></p><button class="btn primary block" type="submit">Sign in</button><button type="button" class="linkbtn" data-tab="reset">Forgot your password?</button></form>'
      : '<form class="stack" data-form="signup" novalidate>' + field("displayName", "Display name", "text", "nickname", { attrs: ' maxlength="24"', hint: "Shown on the scoreboard. You can change it later." }) + field("username", "Username", "text", "username", { attrs: UATTR, hint: "3-20 characters: letters, numbers, dot, dash or underscore. You sign in with this." }) + field("password", "Password", "password", "new-password", { attrs: ' maxlength="128"', hint: "At least 8 characters. A short phrase works well." }) + field("password2", "Repeat password", "password", "new-password", { attrs: ' maxlength="128"' }) + (ACC.invite ? field("invite", "Invite code", "text", "off", { attrs: ' spellcheck="false" maxlength="64"', hint: "Ask the person who shared CyberQuest with you." }) : "") + '<p class="formerr" role="alert" hidden></p><button class="btn primary block" type="submit">Create account</button><p class="small muted" style="margin:0">No email needed. You\'ll get a one-time recovery code, which is the only way to reset a forgotten password.</p></form>');
  }
  return '<main class="wrap fade"><div class="auth">' + hero + (VIEW.note ? '<div class="notice small">' + esc(VIEW.note) + "</div>" : "") + '<div class="card stack">' + body + '</div><div class="or"><span>or</span></div><div class="stack" style="gap:6px"><button class="btn block" data-act="guest">Play as a guest</button><p class="small muted" style="margin:0;text-align:center">Guest progress stays on this device. Guests can\'t post scores or get reminders.</p></div></div></main>';
}
function viewRecovery() {
  return '<main class="wrap fade"><div class="auth"><div class="card stack"><div class="eyebrow">' + (VIEW.fresh ? "Account created" : "Password reset") + '</div><h1>Save your recovery code</h1><p class="small" style="margin:0">If you forget your password, this code is the only way back in. Keep it in a password manager or take a screenshot. It won\'t be shown again' + (VIEW.fresh ? "" : ", and your old code no longer works") + '.</p><div class="codebox big" id="reccode">' + esc(VIEW.code) + '</div><div class="row"><button class="btn sm" data-act="copy-rec">Copy code</button></div><label class="checkrow"><input type="checkbox" id="recok"> I\'ve saved my recovery code</label><button class="btn primary block" data-act="rec-done">Continue</button></div></div></main>';
}
function viewImport() {
  return '<main class="wrap fade"><div class="auth"><div class="card stack"><div class="eyebrow">Welcome, ' + esc(displayName()) + '</div><h1>Bring your progress with you?</h1><p class="small" style="margin:0">This device has progress from playing as a guest: ' + fmtN(VIEW.n) + " questions answered, " + fmtN(VIEW.xp) + ' XP. Move it into your account so it follows you to your other devices?</p><div class="row"><button class="btn primary" data-act="import-yes">Move it to my account</button><button class="btn" data-act="import-no">Start fresh</button></div><p class="small muted" style="margin:0">Start fresh leaves the guest progress on this device for guest play.</p></div></div></main>';
}
async function exportData() {
  const data = JSON.stringify(S, null, 1);
  if (MODE === "artifact") {
    try { const dl = window.claude && window.claude.use ? await window.claude.use("downloads") : null; if (!dl) throw { code: "unavailable" }; await dl.save({ filename: "cyberquest-progress.json", data }); toast("Saved"); }
    catch (e) { toast(e && e.code === "declined" ? "Export cancelled" : "Export isn't available in this view"); }
    return;
  }
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([data], { type: "application/json" })); a.download = "cyberquest-progress.json"; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
async function exportPacks() {
  const list = Object.values(PACKS).filter(p => p.ids.length).map(p => ({ month: p.month, title: p.title, questions: p.ids.map(id => { const x = QI[id]; const o = { m: x.m.id, lvl: x.j ? "j" : "a", q: x.q[0], a: x.q[1], w: x.q[2], e: x.q[3] }; if (x.tag) o.tag = x.tag; if (x.src) o.src = x.src; return o; }) }));
  if (!list.length) { toast("No question packs yet."); return; }
  try { const dl = window.claude && window.claude.use ? await window.claude.use("downloads") : null; if (!dl) throw { code: "unavailable" }; await dl.save({ filename: "cyberquest-packs.json", data: JSON.stringify(list, null, 1) }); toast("Saved"); }
  catch (e) { toast(e && e.code === "declined" ? "Export cancelled" : "Export isn't available in this view"); }
}
function importData(file) {
  const fr = new FileReader();
  fr.onload = () => { try { const d = JSON.parse(fr.result); if (d.v !== 1 || typeof d.q !== "object") throw 0; S = Object.assign(freshState(), d); save(true); render(); toast("Progress imported"); } catch (e) { toast("That file isn't a CyberQuest export."); } };
  fr.readAsText(file);
}

// ---------- render & events ----------
let tickT = null;
function render() {
  const app = document.getElementById("app"); let html = "";
  const bare = ["loading", "auth", "recovery", "import"].includes(VIEW.screen);
  if (VIEW.screen === "loading") html = viewLoading();
  else if (VIEW.screen === "auth") html = viewAuth();
  else if (VIEW.screen === "recovery") html = viewRecovery();
  else if (VIEW.screen === "import") html = viewImport();
  else if (VIEW.screen === "quiz" && SESSION) html = viewQuiz();
  else if (VIEW.screen === "challenge" && SESSION) html = viewChallenge();
  else if (VIEW.screen === "cresult" && SESSION) html = viewCResult();
  else if (VIEW.screen === "board") html = viewBoard();
  else if (VIEW.screen === "result" && SESSION) html = viewResult();
  else if (VIEW.screen === "module" && MOD[VIEW.mid]) html = viewModule();
  else if (VIEW.screen === "star") html = viewStar();
  else if (VIEW.screen === "cases") html = viewCases();
  else if (VIEW.screen === "case" && CS && CASE[CS.id]) html = viewCase();
  else if (VIEW.screen === "learn") html = viewLearn();
  else if (VIEW.screen === "lesson" && LESSON[VIEW.lid]) html = viewLesson();
  else if (VIEW.screen === "stardetail") html = viewStarDetail();
  else if (VIEW.screen === "settings") html = viewSettings();
  else { VIEW = { screen: "home" }; html = viewHome(); }
  app.innerHTML = (bare ? topbarMin() : topbar()) + html;
  if (VIEW.screen === "stardetail") starWords();
  clearInterval(tickT);
  if (VIEW.screen === "quiz" && (SESSION.exam || S.settings.timer)) { tick(); tickT = setInterval(tick, 500); }
  if (VIEW.screen === "challenge") { tick(); tickT = setInterval(tick, 100); }
  const nb = app.querySelector('[data-act="next"]'); if (nb) nb.focus({ preventScroll: true });
}
function tick() {
  const s = SESSION; if (!s) return;
  if (s.kind === "challenge") { challengeTick(); return; }
  const el = document.getElementById("timer"); if (!el) return;
  let left;
  if (s.exam) left = s.deadline - Date.now();
  else { const it = s.items[s.i]; if (it.picked !== null) { el.textContent = ""; return; } left = s.qStart + S.settings.timer * 1000 - Date.now(); }
  if (left <= 0) {
    if (s.exam) { s.items.forEach(it => { if (it.picked === null) it.picked = -1; }); clearInterval(tickT); finish(); return; }
    const it = s.items[s.i]; it.picked = -1; const st = qs(it.id).slice(); st[1]++; st[0] = 0; st[3] = Date.now() + INTERVALS[0]; st[4] = Date.now(); S.q[it.id] = st; s.combo = 0; it.gain = 0; save(); render(); return;
  }
  const sec = Math.ceil(left / 1000); el.textContent = Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0"); el.classList.toggle("low", sec <= (s.exam ? 120 : 10));
}
document.addEventListener("click", e => {
  const t = e.target.closest("button,a,label"); if (!t) return;
  const d = t.dataset;
  if (d.go) { if (d.go === "star") VIEW = { screen: "star" }; else VIEW = { screen: d.go }; render(); window.scrollTo(0, 0); return; }
  if (d.auth) { goAuth(d.auth, d.next); return; }
  if (d.mod) { VIEW = { screen: "module", mid: d.mod }; render(); window.scrollTo(0, 0); return; }
  if (d.case) { startCase(d.case); return; }
  if (d.learn) { VIEW = { screen: "lesson", lid: d.learn }; render(); window.scrollTo(0, 0); return; }
  if (d.cpick !== undefined) { casePick(+d.cpick); return; }
  if (d.start) { startDrill(d.start, d.mid); return; }
  if (d.ans !== undefined) { answer(+d.ans); return; }
  if (d.star) { VIEW = { screen: "stardetail", pid: d.star, tab: "draft" }; render(); window.scrollTo(0, 0); return; }
  if (d.tab) { VIEW.tab = d.tab; render(); return; }
  if (d.set === "level") { S.settings.level = LEVELS[d.val] ? d.val : "junior"; save(); render(); return; }
  if (d.set) { const v = +d.val; if (d.set === "interval") { S.push.interval = v; if (S.push.enabled) syncFocusForce(); } else S.settings[d.set] = v; save(); render(); return; }
  switch (d.act) {
    case "next": next(); break;
    case "case-next": caseNext(); break;
    case "case-list": CS = null; VIEW = { screen: "cases" }; render(); window.scrollTo(0, 0); break;
    case "mark-lesson": markLesson(d.lid); break;
    case "print-lesson": window.print(); break;
    case "challenge": startChallenge(); break;
    case "board": VIEW = { screen: "board", tab: d.tab || "month" }; render(); window.scrollTo(0, 0); loadBoard(true); break;
    case "board-tab": VIEW.tab = d.tab; render(); break;
    case "filter": VIEW.filter = d.f; render(); break;
    case "post-score": postScore(t); break;
    case "quit": if (SESSION && SESSION.kind === "challenge") { if (!t.dataset.armed) { t.dataset.armed = "1"; t.lastChild.textContent = " Tap again to end (score won't count)"; setTimeout(() => { if (t.isConnected) { delete t.dataset.armed; t.lastChild.textContent = " End run"; } }, 3500); break; } SESSION = null; VIEW = { screen: "home" }; render(); toast("Run ended. Only finished runs can go on the scoreboard."); break; } if (SESSION && SESSION.items.some(it => it.picked !== null) && !SESSION.done) { SESSION.items = SESSION.items.filter(it => it.picked !== null); if (SESSION.items.length) { finish(); break; } } SESSION = null; VIEW = { screen: "home" }; render(); break;
    case "retry-missed": retryMissed(); break;
    case "push-on": pushOn(); break;
    case "push-off": pushOff(); break;
    case "push-test": pushTest(); break;
    case "hide-push": S.push.hide = true; save(); render(); break;
    case "star-done": { const p = VIEW.pid; const dd = S.star[p] = S.star[p] || {}; const first = dd.lastDone !== today(); dd.practised = (dd.practised || 0) + 1; if (first) { S.xp += 20; dd.lastDone = today(); } save(); toast(first ? "+20 XP. Story logged." : "Logged. XP is once per story per day."); render(); break; }
    case "star-timer": starTimerToggle(t); break;
    case "ai-feedback": aiFeedback(t); break;
    case "export": exportData(); break;
    case "export-packs": exportPacks(); break;
    case "reset": if (t.dataset.armed) { S = freshState(); save(true); toast("Progress reset"); VIEW = { screen: "home" }; render(); } else { t.dataset.armed = "1"; t.textContent = "Tap again to erase everything"; t.classList.add("dark"); setTimeout(() => { if (t.isConnected) { delete t.dataset.armed; t.textContent = "Reset all progress"; t.classList.remove("dark"); } }, 4000); } break;
    case "focus": { const f = new Set((S.settings.focus || []).filter(id => MOD[id])); if (f.has(d.mid)) f.delete(d.mid); else if (f.size >= MAX_FOCUS) { toast("Up to " + MAX_FOCUS + " focus areas. Remove one first."); break; } else f.add(d.mid); S.settings.focus = Array.from(f); save(); render(); if (S.push.enabled) syncFocusForce(); break; }
    case "guest": { const next = AUTH_NEXT; AUTH_NEXT = null; useGuest(true); VIEW = next === "cresult" && SESSION && SESSION.run ? { screen: "cresult" } : { screen: "home" }; render(); if (VIEW.screen === "home" && PENDING_ROUTE) route(); loadBoard(true); break; }
    case "signout": signOut(); break;
    case "copy-rec": { const code = VIEW.code; if (navigator.clipboard) navigator.clipboard.writeText(code).then(() => toast("Copied"), () => selectText("reccode")); else selectText("reccode"); break; }
    case "rec-done": { const c = document.getElementById("recok"); if (c && !c.checked) { toast("Tick the box once you've saved the code."); c.focus(); break; } continueAfterAuth(); break; }
    case "import-yes": { const next = VIEW.next; const g = guestProgress().st; g.push = S.push || {}; S = normalise(g); save(true); lsDel(K.guest); toast("Progress moved to your account"); VIEW = next && next.screen === "cresult" && SESSION ? next : { screen: "home" }; render(); break; }
    case "import-no": { const next = VIEW.next; VIEW = next && next.screen === "cresult" && SESSION ? next : { screen: "home" }; render(); break; }
  }
});
async function syncFocusForce() { S.push.focusSent = ""; syncFocus(); }
function selectText(id) { const el = document.getElementById(id); if (!el) return; const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); toast("Selected. Copy it from here."); }
function starTimerToggle(btn) {
  if (starTimer) { clearInterval(starTimer); starTimer = null; btn.textContent = "Start 2-min speaking timer"; return; }
  const end = Date.now() + 120e3;
  const upd = () => { const b = document.getElementById("stbtn"); const left = Math.max(0, end - Date.now()); if (!b) { clearInterval(starTimer); starTimer = null; return; } b.textContent = left ? "Speaking... " + Math.floor(left / 6e4) + ":" + String(Math.ceil(left / 1000) % 60).padStart(2, "0") + " (tap to stop)" : "Time. How did it go?"; if (!left) { clearInterval(starTimer); starTimer = null; } };
  upd(); starTimer = setInterval(upd, 500);
}
let draftT;
document.addEventListener("input", e => {
  if (e.target.id === "pname") { VIEW.pname = e.target.value; return; }
  const f = e.target.dataset.field; if (f && VIEW.pid) { const dd = S.star[VIEW.pid] = S.star[VIEW.pid] || {}; dd[f] = e.target.value; clearTimeout(draftT); draftT = setTimeout(save, 600); starWords(); }
});
document.addEventListener("change", e => {
  const c = e.target.dataset.check; if (c !== undefined && VIEW.pid) { const dd = S.star[VIEW.pid] = S.star[VIEW.pid] || {}; dd.checks = dd.checks || []; dd.checks[+c] = e.target.checked; save(); }
  if (e.target.id === "importf" && e.target.files[0]) importData(e.target.files[0]);
});
document.addEventListener("submit", e => { const f = e.target; if (f && f.dataset && f.dataset.form) { e.preventDefault(); if (f.dataset.form === "delete" && !f.dataset.armed) { f.dataset.armed = "1"; const b = f.querySelector('button[type="submit"]'); b.textContent = "Tap again to delete for good"; setTimeout(() => { if (b.isConnected) { delete f.dataset.armed; b.textContent = "Delete my account"; } }, 5000); return; } submitAuth(f); } });
document.addEventListener("keydown", e => {
  if (e.target.id === "pname" && e.key === "Enter") { const b = document.querySelector('[data-act="post-score"]'); if (b) { e.preventDefault(); b.click(); } return; }
  if (VIEW.screen === "case" && CS && !CS.done && CS.i >= 0 && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA" && !e.metaKey && !e.ctrlKey) {
    const k = e.key.toLowerCase(); const map = { "1": 0, "2": 1, "3": 2, "4": 3, a: 0, b: 1, c: 2, d: 3 };
    if (e.target.tagName === "BUTTON" && (k === "enter" || k === " ")) return;
    if (CS.picks[CS.i] == null && k in map) { e.preventDefault(); casePick(CS.orders[CS.i][map[k]]); }
    else if (CS.picks[CS.i] != null && (k === "enter" || k === "arrowright")) { e.preventDefault(); caseNext(); }
    return;
  }
  if ((VIEW.screen !== "quiz" && VIEW.screen !== "challenge") || !SESSION || e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT" || e.metaKey || e.ctrlKey) return;
  const it = SESSION.items[SESSION.i]; const k = e.key.toLowerCase();
  if (e.target.tagName === "BUTTON" && (k === "enter" || k === " ")) return; const map = { "1": 0, "2": 1, "3": 2, "4": 3, a: 0, b: 1, c: 2, d: 3 };
  if (it.picked === null && k in map) { e.preventDefault(); answer(map[k]); }
  else if (it.picked !== null && (k === "enter" || k === " " || k === "arrowright")) { e.preventDefault(); next(); }
});

// ---------- boot ----------
// Deep links (?module=, ?star=1, ?play=challenge, #scoreboard...) are applied once, after sign-in if needed.
function route() {
  const R0 = PENDING_ROUTE || { search: "", hash: "" }; PENDING_ROUTE = null;
  if (MODE === "web" && (location.search || location.hash)) history.replaceState(null, "", "/");
  const p = new URLSearchParams(R0.search); const h = (R0.hash || "").replace(/^#/, "");
  const mod = p.get("module") || (h.startsWith("m-") ? h.slice(2) : "");
  if (["loading", "auth"].includes(VIEW.screen)) VIEW = { screen: "home" };
  if (p.get("drill") === "next" || h === "next") { startDrill("module", suggest().id); return; }
  if (mod && MOD[mod]) { VIEW = { screen: "module", mid: mod }; }
  else if (p.get("star") || h === "star") VIEW = { screen: "star" };
  else if (p.get("case") && CASE[p.get("case")]) { startCase(p.get("case")); return; }
  else if (p.get("cases") || h === "cases") VIEW = { screen: "cases" };
  else if (p.get("learn") && LESSON[p.get("learn")]) VIEW = { screen: "lesson", lid: p.get("learn") };
  else if (p.get("learn") != null || h === "learn") VIEW = { screen: "learn" };
  else if (p.get("play") === "challenge" || h === "challenge") { render(); startChallenge(); return; }
  else if (p.get("board") || h === "scoreboard") { VIEW = { screen: "board", tab: "month" }; loadBoard(true); }
  render();
}
if (MODE === "web") bootWeb();
else { route(); initRemote(); initAI(); }
})();
