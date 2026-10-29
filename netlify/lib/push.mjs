// Shared helpers for CyberQuest Netlify Functions: storage, VAPID keys, sending pushes.
import { getStore } from "@netlify/blobs";
import webpush from "web-push";
import MODULES from "./modules.mjs";

export const subs = () => getStore({ name: "cq-subscriptions", consistency: "strong" });
export const configStore = () => getStore({ name: "cq-config", consistency: "strong" });
export const progress = () => getStore({ name: "cq-progress", consistency: "strong" });

// Push services that browsers use. Anything else is rejected so the endpoint can't be abused to call arbitrary URLs.
const PUSH_HOSTS = [/\.googleapis\.com$/, /\.mozilla\.com$/, /\.mozaws\.net$/, /^web\.push\.apple\.com$/, /\.push\.apple\.com$/, /\.notify\.windows\.com$/];
export function validEndpoint(endpoint) {
  try {
    const u = new URL(endpoint);
    return u.protocol === "https:" && PUSH_HOSTS.some((re) => re.test(u.hostname));
  } catch { return false; }
}
export async function keyFor(endpoint) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(endpoint));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 40);
}

// VAPID keys: use env vars if set, otherwise generate once and keep them in Blobs.
let cached = null;
export async function vapid() {
  if (cached) return cached;
  const env = (k) => (globalThis.Netlify?.env?.get?.(k)) ?? process.env[k];
  if (env("VAPID_PUBLIC_KEY") && env("VAPID_PRIVATE_KEY")) {
    cached = { publicKey: env("VAPID_PUBLIC_KEY"), privateKey: env("VAPID_PRIVATE_KEY") };
    return cached;
  }
  const store = configStore();
  let keys = await store.get("vapid", { type: "json" });
  if (!keys) {
    keys = webpush.generateVAPIDKeys();
    await store.setJSON("vapid", keys);
  }
  cached = keys;
  return keys;
}

export async function send(subscription, payload, siteUrl) {
  const keys = await vapid();
  const subject = process.env.VAPID_SUBJECT || siteUrl || "https://cyberquest.netlify.app";
  return webpush.sendNotification(subscription, JSON.stringify(payload), {
    TTL: 3 * 3600,
    urgency: "normal",
    topic: "cyberquest",
    vapidDetails: { subject, publicKey: keys.publicKey, privateKey: keys.privateKey },
  });
}

const OPENERS = ["Drill time", "4-hour check-in", "Quick round", "Stay sharp", "Keep the streak"];
export function buildMessage(rec, now = Date.now()) {
  const focus = (rec.focus || []).filter((id) => MODULES[id]);
  const pool = focus.length ? focus : Object.keys(MODULES);
  const n = (rec.count || 0) + Math.floor(now / 3.6e6);
  // Every fourth reminder is a STAR interview prompt instead of a module drill.
  if (n % 6 === 5) {
    return { title: "Case file", body: "One investigation, five decisions: read the evidence, pick your next check, and see when to escalate.", url: "/?cases=1", tag: "cyberquest-drill" };
  }
  if (n % 4 === 3) {
    return { title: "STAR practice", body: "Two minutes: answer one behavioural question out loud, then compare with an example answer.", url: "/?star=1", tag: "cyberquest-drill" };
  }
  const id = pool[n % pool.length];
  const m = MODULES[id];
  return { title: `${OPENERS[n % OPENERS.length]}: ${m.name}`, body: `${m.code} · 10 questions, about 5 minutes. ${m.blurb}.`, url: `/?module=${id}`, tag: "cyberquest-drill" };
}

export function localHour(now, tz) {
  try {
    return Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: tz }).format(new Date(now)));
  } catch { return new Date(now).getUTCHours(); }
}
export function isQuiet(hour, start, end) {
  if (start === end) return false;
  return start > end ? hour >= start || hour < end : hour >= start && hour < end;
}

export const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
