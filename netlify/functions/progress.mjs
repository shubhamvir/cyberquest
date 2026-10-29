// GET/PUT /api/me/progress -> the signed-in player's progress (drills, review queue, STAR drafts, settings).
// Each account has its own record, so nobody can read or change anyone else's progress.
import { getSession, sameOrigin, reply, progressStore } from "../lib/auth.mjs";

const MAX_BYTES = 400_000;

export default async (req) => {
  const auth = await getSession(req);
  if (!auth) return reply({ error: "Please sign in again." }, 401);
  const store = progressStore();
  const key = "u/" + auth.uid;
  if (req.method === "GET") {
    const data = await store.get(key, { type: "json" });
    return reply(data || { empty: true });
  }
  if (!sameOrigin(req)) return reply({ error: "Cross-site request blocked" }, 403);
  const text = await req.text();
  if (text.length > MAX_BYTES) return reply({ error: "Too large" }, 413);
  let data;
  try { data = JSON.parse(text); } catch { return reply({ error: "Invalid JSON" }, 400); }
  if (data?.v !== 1 || typeof data.q !== "object" || data.q === null) return reply({ error: "Not CyberQuest progress" }, 400);
  const current = await store.get(key, { type: "json" });
  if (current && (current.updatedAt || 0) > (data.updatedAt || 0)) return reply({ ok: false, stale: true, updatedAt: current.updatedAt }, 409);
  data.owner = auth.uid;
  await store.setJSON(key, data);
  return reply({ ok: true });
};

export const config = { path: "/api/me/progress", method: ["GET", "PUT"] };
