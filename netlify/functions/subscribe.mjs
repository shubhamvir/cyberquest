// POST /api/subscribe   {subscription, prefs, focus}  -> save or refresh a device's push subscription (signed-in players)
// DELETE /api/subscribe {endpoint}                     -> remove it
import { subs, keyFor, validEndpoint, json } from "../lib/push.mjs";
import { getSession, sameOrigin } from "../lib/auth.mjs";

const MAX_SUBS = 500;
const clampHour = (v, d) => (Number.isInteger(v) && v >= 0 && v <= 23 ? v : d);

export default async (req) => {
  if (!sameOrigin(req)) return json({ error: "Cross-site request blocked" }, 403);
  let body;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const store = subs();

  if (req.method === "DELETE") {
    if (!body?.endpoint || !validEndpoint(body.endpoint)) return json({ error: "Unknown endpoint" }, 400);
    await store.delete(await keyFor(body.endpoint));
    return json({ ok: true });
  }

  const auth = await getSession(req);
  if (!auth) return json({ error: "Sign in to turn on reminders." }, 401);
  const s = body?.subscription;
  if (!s?.endpoint || !s?.keys?.p256dh || !s?.keys?.auth || !validEndpoint(s.endpoint)) return json({ error: "Invalid subscription" }, 400);
  const key = await keyFor(s.endpoint);
  const existing = await store.get(key, { type: "json" });
  if (!existing) {
    const { blobs } = await store.list();
    if (blobs.length >= MAX_SUBS) return json({ error: "Subscription limit reached" }, 429);
  }
  const p = body.prefs || {};
  const interval = [2, 3, 4, 6].includes(p.interval) ? p.interval : 4;
  let tz = "Europe/Dublin";
  try { if (typeof p.tz === "string") { new Intl.DateTimeFormat("en", { timeZone: p.tz }); tz = p.tz; } } catch { /* keep default */ }
  const focus = Array.isArray(body.focus) ? body.focus.filter((x) => typeof x === "string" && /^[a-z0-9]{2,12}$/.test(x)).slice(0, 10) : [];
  const rec = {
    subscription: { endpoint: s.endpoint, expirationTime: s.expirationTime ?? null, keys: { p256dh: String(s.keys.p256dh), auth: String(s.keys.auth) } },
    prefs: { interval, quietStart: clampHour(p.quietStart, 23), quietEnd: clampHour(p.quietEnd, 7), tz },
    focus,
    uid: auth.uid,
    created: existing?.created || Date.now(),
    updated: Date.now(),
    lastSent: existing?.lastSent || 0,
    count: existing?.count || 0,
  };
  await store.setJSON(key, rec);
  return json({ ok: true, interval: rec.prefs.interval });
};

export const config = { path: "/api/subscribe", method: ["POST", "DELETE"] };
