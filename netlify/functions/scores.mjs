// Monthly Challenge scoreboard.
// GET  /api/scores?month=YYYY-MM -> top 50 for that month's set
// GET  /api/scores?scope=all     -> top 50 across all months
// POST /api/scores {id, month, results:[{id, a, ms}]}   (signed-in players only)
//   The server rebuilds that month's 50-question set, checks each answer against the bank
//   (a = hash of the option the player picked) and recomputes the score, so a client
//   can't post a made-up number. The name shown is the player's account display name, and
//   each player keeps their best run per table.
import CQC from "../lib/cqc.mjs";
import BANK from "../lib/bank.mjs";
import { getSession, sameOrigin, reply } from "../lib/auth.mjs";
import { scoresStore, mergeBest } from "../lib/scoreboard.mjs";

const KEEP_MONTH = 200, KEEP_ALL = 100, SHOW = 50;
const core = Object.entries(BANK.modules).map(([id, ids]) => ({ id, ids }));

function prevMonth(key) {
  const [y, m] = key.split("-").map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
}
const view = (uid) => (e) => ({ id: e.id, name: e.name, month: e.month, score: e.score, correct: e.correct, total: e.total, ms: e.ms, at: e.at, mine: !!(uid && e.uid === uid) });

export default async (req) => {
  const store = scoresStore();
  const url = new URL(req.url);
  const auth = await getSession(req);
  const uid = auth ? auth.uid : null;

  if (req.method === "GET") {
    if (url.searchParams.get("scope") === "all") {
      const all = (await store.get("all", { type: "json" })) || [];
      return reply({ scope: "all", entries: all.slice(0, SHOW).map(view(uid)) });
    }
    const month = url.searchParams.get("month") || CQC.monthKey();
    if (!/^\d{4}-\d{2}$/.test(month)) return reply({ error: "Bad month" }, 400);
    const list = (await store.get("m-" + month, { type: "json" })) || [];
    const mine = uid ? list.find((e) => e.uid === uid) : null;
    return reply({ month, entries: list.slice(0, SHOW).map(view(uid)), me: mine ? Object.assign(view(uid)(mine), { rank: list.indexOf(mine) + 1 }) : null });
  }

  if (!sameOrigin(req)) return reply({ error: "Cross-site request blocked" }, 403);
  if (!auth) return reply({ error: "Sign in to post a score." }, 401);
  let body;
  try { body = await req.json(); } catch { return reply({ error: "Invalid JSON" }, 400); }
  const id = String(body?.id || "");
  const month = String(body?.month || "");
  const results = body?.results;
  if (!/^[a-z0-9]{8,24}$/.test(id)) return reply({ error: "Bad run id" }, 400);
  const now = CQC.monthKey();
  if (month !== now && month !== prevMonth(now)) return reply({ error: "That month's challenge is closed" }, 400);
  const set = CQC.pick(month, core, BANK.packs[month] || []);
  if (!Array.isArray(results) || results.length !== set.length) return reply({ error: "Incomplete run" }, 400);
  for (let i = 0; i < set.length; i++) if (results[i]?.id !== set[i]) return reply({ error: "Questions don't match this month's set" }, 400);

  const checked = results.map((r) => ({ ok: Number(r.a) === BANK.answers[r.id], ms: Math.max(0, Math.min(Number(r.ms) || 0, 3_600_000)) }));
  const sc = CQC.score(checked);
  const entry = { id, uid: auth.uid, name: auth.user.displayName, month, score: sc.score, correct: sc.correct, total: set.length, ms: sc.ms, at: Date.now() };

  const m = mergeBest((await store.get("m-" + month, { type: "json" })) || [], entry, KEEP_MONTH);
  if (m.improved) await store.setJSON("m-" + month, m.list);
  const a = mergeBest((await store.get("all", { type: "json" })) || [], entry, KEEP_ALL);
  if (a.improved) await store.setJSON("all", a.list);
  const best = m.list.find((e) => e.uid === auth.uid);
  return reply({ ok: true, entry: view(auth.uid)(entry), improved: m.improved, best: best ? view(auth.uid)(best) : null, rank: best ? m.list.indexOf(best) + 1 : 0 });
};

export const config = { path: "/api/scores", method: ["GET", "POST"] };
