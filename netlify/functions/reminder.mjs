// Scheduled every hour. Sends each subscribed device a drill reminder when its interval
// (default 4 h) has passed and it is outside that device's quiet hours (default 23:00-07:00).
import { subs, send, buildMessage, localHour, isQuiet } from "../lib/push.mjs";

export default async (req, context) => {
  const store = subs();
  const now = Date.now();
  const { blobs } = await store.list();
  let sent = 0, skipped = 0, removed = 0;
  // Up to 25 devices at a time so a few hundred subscriptions finish well inside the function time limit.
  const one = async ({ key }) => {
    const rec = await store.get(key, { type: "json" });
    if (!rec?.subscription) return;
    const p = rec.prefs || {};
    const hour = localHour(now, p.tz || "Europe/Dublin");
    const due = !rec.lastSent || now - rec.lastSent >= (p.interval || 4) * 3.6e6 - 10 * 6e4;
    if (!due || isQuiet(hour, p.quietStart ?? 23, p.quietEnd ?? 7)) { skipped++; return; }
    try {
      await send(rec.subscription, buildMessage(rec, now), context?.site?.url);
      rec.lastSent = now;
      rec.count = (rec.count || 0) + 1;
      await store.setJSON(key, rec);
      sent++;
    } catch (e) {
      if (e?.statusCode === 404 || e?.statusCode === 410) { await store.delete(key); removed++; }
      else console.error("push failed", key, e?.statusCode, e?.body);
    }
  };
  for (let i = 0; i < blobs.length; i += 25) await Promise.all(blobs.slice(i, i + 25).map(one));
  console.log(`reminders: sent=${sent} skipped=${skipped} removed=${removed}`);
};

export const config = { schedule: "@hourly" };
