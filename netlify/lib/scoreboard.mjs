// Scoreboard storage shared by the scores and auth functions.
// Keys: "m-YYYY-MM" (that month's table) and "all" (all-time table). Each signed-in player
// keeps only their best run in each table.
import { getStore } from "@netlify/blobs";

export const scoresStore = () => getStore({ name: "cq-scores", consistency: "strong" });
export const byScore = (a, b) => b.score - a.score || a.ms - b.ms || a.at - b.at;

async function tableKeys() {
  const { blobs } = await scoresStore().list();
  return blobs.map((b) => b.key).filter((k) => k === "all" || /^m-\d{4}-\d{2}$/.test(k));
}
async function rewrite(fn) {
  const st = scoresStore();
  for (const key of await tableKeys()) {
    const list = (await st.get(key, { type: "json" })) || [];
    const next = fn(list);
    if (next) await st.setJSON(key, next);
  }
}
export const renameInScores = (uid, name) => rewrite((list) => {
  let changed = false;
  list.forEach((e) => { if (e.uid === uid && e.name !== name) { e.name = name; changed = true; } });
  return changed ? list : null;
});
export const removeFromScores = (uid) => rewrite((list) => {
  const next = list.filter((e) => e.uid !== uid);
  return next.length !== list.length ? next : null;
});
// Adds a run to a table, keeping one best entry per signed-in player. Returns the updated list.
export function mergeBest(list, entry, keep) {
  const prev = list.find((e) => e.uid && e.uid === entry.uid);
  if (prev && byScore(prev, entry) <= 0) return { list, improved: false };
  const next = list.filter((e) => !(e.uid && e.uid === entry.uid) && e.id !== entry.id);
  next.push(entry); next.sort(byScore);
  return { list: next.slice(0, keep), improved: true };
}
