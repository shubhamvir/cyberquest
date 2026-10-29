// POST /api/test-push {endpoint} -> send one reminder right now to a device that is already subscribed.
import { subs, keyFor, validEndpoint, send, buildMessage, json } from "../lib/push.mjs";

export default async (req, context) => {
  let body;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  if (!body?.endpoint || !validEndpoint(body.endpoint)) return json({ error: "Unknown endpoint" }, 400);
  const store = subs();
  const key = await keyFor(body.endpoint);
  const rec = await store.get(key, { type: "json" });
  if (!rec) return json({ error: "Not subscribed" }, 404);
  if (rec.lastTest && Date.now() - rec.lastTest < 30_000) return json({ error: "Wait a few seconds between tests" }, 429);
  const msg = buildMessage(rec);
  try {
    await send(rec.subscription, { ...msg, title: "Test: " + msg.title }, context?.site?.url);
    rec.lastTest = Date.now();
    await store.setJSON(key, rec);
    return json({ ok: true });
  } catch (e) {
    if (e?.statusCode === 404 || e?.statusCode === 410) { await store.delete(key); return json({ error: "Subscription expired" }, 410); }
    console.error("test push failed", e?.statusCode, e?.body);
    return json({ error: "Push service error", status: e?.statusCode || 0 }, 502);
  }
};

export const config = { path: "/api/test-push", method: "POST" };
