// Accounts, sessions and rate limits for CyberQuest, stored in Netlify Blobs.
// Passwords: scrypt (N=2^17, r=8, p=1). Sessions: random 256-bit tokens in an HttpOnly cookie;
// only a SHA-256 of each token is stored, so a leaked store can't be replayed as a login.
import { getStore } from "@netlify/blobs";
import { scrypt as scryptCb, randomBytes, timingSafeEqual, createHash } from "node:crypto";

export const users = () => getStore({ name: "cq-users", consistency: "strong" });
export const sessions = () => getStore({ name: "cq-sessions", consistency: "strong" });
export const limits = () => getStore({ name: "cq-limits", consistency: "strong" });
export const progressStore = () => getStore({ name: "cq-progress", consistency: "strong" });

export const COOKIE = "__Host-cq_session";
const SESSION_MS = 30 * 864e5;
const RENEW_AFTER_MS = 7 * 864e5;
const KDF = { N: 2 ** 17, r: 8, p: 1, keylen: 32 };
const MAXMEM = 256 * 1024 * 1024;

export const env = (k) => (globalThis.Netlify?.env?.get?.(k)) ?? process.env[k];
export const sha = (s) => createHash("sha256").update(String(s)).digest("hex");
const b64 = (buf) => Buffer.from(buf).toString("base64");

function scrypt(password, salt, { N, r, p, keylen }) {
  return new Promise((resolve, reject) => scryptCb(String(password).normalize("NFKC"), salt, keylen, { N, r, p, maxmem: MAXMEM }, (err, dk) => (err ? reject(err) : resolve(dk))));
}
export async function hashPassword(password) {
  const salt = randomBytes(16);
  const dk = await scrypt(password, salt, KDF);
  return { alg: "scrypt", N: KDF.N, r: KDF.r, p: KDF.p, salt: b64(salt), dk: b64(dk) };
}
const DUMMY = { alg: "scrypt", N: KDF.N, r: KDF.r, p: KDF.p, salt: b64(Buffer.alloc(16, 7)), dk: b64(Buffer.alloc(32, 9)) };
// Always runs one scrypt, even for unknown users, so response time doesn't reveal which usernames exist.
export async function verifyPassword(password, rec) {
  const h = rec && rec.alg === "scrypt" ? rec : DUMMY;
  const want = Buffer.from(h.dk, "base64");
  const got = await scrypt(password, Buffer.from(h.salt, "base64"), { N: h.N, r: h.r, p: h.p, keylen: want.length });
  return rec === h && got.length === want.length && timingSafeEqual(got, want);
}
export function safeEqual(a, b) {
  const x = Buffer.from(sha(a), "hex"), y = Buffer.from(sha(b), "hex");
  return timingSafeEqual(x, y);
}

// ---------- input rules ----------
export const normUser = (v) => String(v || "").trim().toLowerCase();
export const validUsername = (u) => /^[a-z0-9][a-z0-9_.-]{2,19}$/.test(u);
export const cleanName = (v) => String(v || "").normalize("NFKC").replace(/[\u0000-\u001f\u007f-\u009f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 24);
const COMMON = new Set(["password", "password1", "password123", "12345678", "123456789", "1234567890", "qwerty123", "qwertyuiop", "iloveyou", "11111111", "00000000", "abc12345", "letmein1", "welcome1", "admin123", "cyberquest", "football", "baseball", "sunshine", "princess"]);
export function passwordProblem(pw, username) {
  if (typeof pw !== "string" || pw.length < 8) return "Use at least 8 characters.";
  if (pw.length > 128) return "Use 128 characters or fewer.";
  const low = pw.toLowerCase();
  if (COMMON.has(low)) return "That password is too common. Pick something less guessable.";
  if (username && low.includes(username)) return "Don't include your username in the password.";
  return "";
}
export function newRecoveryCode() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(16);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("").replace(/(.{4})(?!$)/g, "$1-");
}
export const normRecovery = (v) => String(v || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

// ---------- HTTP helpers ----------
export function reply(body, status = 200, cookies = []) {
  const h = new Headers({ "content-type": "application/json", "cache-control": "no-store" });
  cookies.forEach((c) => h.append("set-cookie", c));
  return new Response(JSON.stringify(body), { status, headers: h });
}
export const sessionCookie = (token) => `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${Math.floor(SESSION_MS / 1000)}`;
export const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
export function readCookie(req, name = COOKIE) {
  const raw = req.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return "";
}
// Blocks cross-site form posts: browsers always send Origin on POST/PUT/DELETE.
export function sameOrigin(req) {
  const o = req.headers.get("origin");
  if (!o) return true;
  try { return new URL(o).host === new URL(req.url).host; } catch { return false; }
}
export function clientIp(req, context) {
  return context?.ip || req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

// ---------- sessions ----------
export async function createSession(user) {
  const token = randomBytes(32).toString("base64url");
  const key = sha(token);
  const now = Date.now();
  await sessions().setJSON(key, { uid: user.uid, created: now, renewed: now, exp: now + SESSION_MS });
  user.sessions = (user.sessions || []).concat([key]).slice(-10);
  return { token, cookie: sessionCookie(token), key };
}
// Returns { uid, user, key, renew } for a valid session cookie, or null.
export async function getSession(req) {
  const token = readCookie(req);
  if (!token || token.length < 30 || token.length > 100) return null;
  const key = sha(token);
  const s = await sessions().get(key, { type: "json" });
  if (!s || s.exp < Date.now()) { if (s) await sessions().delete(key); return null; }
  const user = await users().get("u/" + s.uid, { type: "json" });
  if (!user) { await sessions().delete(key); return null; }
  return { uid: s.uid, user, key, token, session: s };
}
export async function renewIfOld(auth) {
  if (Date.now() - (auth.session.renewed || auth.session.created) < RENEW_AFTER_MS) return null;
  const now = Date.now();
  await sessions().setJSON(auth.key, Object.assign({}, auth.session, { renewed: now, exp: now + SESSION_MS }));
  return sessionCookie(auth.token);
}
export async function endSessions(keys) {
  const st = sessions();
  await Promise.all((keys || []).map((k) => st.delete(k).catch(() => {})));
}
export const publicUser = (u) => ({ uid: u.uid, username: u.username, displayName: u.displayName, created: u.created });

// ---------- rate limits ----------
// Fixed windows kept in Blobs. Not perfectly atomic, but enough to stop password guessing.
export async function limited(key, max, windowMs) {
  const st = limits();
  const rec = await st.get(key, { type: "json" });
  const now = Date.now();
  if (rec && rec.until && rec.until > now) return Math.ceil((rec.until - now) / 60000);
  if (rec && rec.start + windowMs > now && rec.count >= max) {
    await st.setJSON(key, Object.assign(rec, { until: rec.start + windowMs }));
    return Math.ceil((rec.start + windowMs - now) / 60000);
  }
  return 0;
}
export async function hit(key, windowMs) {
  const st = limits();
  const now = Date.now();
  let rec = await st.get(key, { type: "json" });
  if (!rec || rec.start + windowMs <= now) rec = { start: now, count: 0 };
  rec.count++;
  await st.setJSON(key, rec);
  return rec.count;
}
export const clearHits = (key) => limits().delete(key).catch(() => {});
