// Accounts for CyberQuest.
// GET  /api/auth/config                                   -> { inviteRequired }
// GET  /api/auth/me                                       -> { user | null }
// POST /api/auth/signup   { username, displayName, password, invite? } -> { user, recovery }
// POST /api/auth/login    { username, password }          -> { user }
// POST /api/auth/logout                                   -> { ok }
// POST /api/auth/reset    { username, recovery, password } -> { user, recovery }  (uses the recovery code)
// POST /api/auth/password { current, password }           -> { ok }   (signs out other devices)
// POST /api/auth/profile  { displayName }                  -> { user }
// POST /api/auth/delete   { password }                     -> { ok }   (removes account, progress, scores, devices)
import { randomBytes } from "node:crypto";
import {
  users, progressStore, env, sha, hashPassword, verifyPassword, safeEqual, normUser, validUsername, cleanName,
  passwordProblem, newRecoveryCode, normRecovery, reply, clearCookie, sameOrigin, clientIp, createSession,
  getSession, renewIfOld, endSessions, publicUser, limited, hit, clearHits,
} from "../lib/auth.mjs";
import { subs } from "../lib/push.mjs";
import { renameInScores, removeFromScores } from "../lib/scoreboard.mjs";

const MIN = 6e4, HOUR = 36e5;
const RESERVED = new Set(["admin", "administrator", "root", "system", "support", "cyberquest", "moderator", "guest"]);

async function readBody(req) {
  const text = await req.text();
  if (text.length > 4000) return null;
  try { const v = JSON.parse(text || "{}"); return v && typeof v === "object" ? v : null; } catch { return null; }
}

export default async (req, context) => {
  const action = String(context.params?.action || "");
  const ip = sha(clientIp(req, context)).slice(0, 24);
  const inviteCode = env("INVITE_CODE") || "";

  if (req.method === "GET") {
    if (action === "config") return reply({ inviteRequired: !!inviteCode });
    if (action === "me") {
      const auth = await getSession(req);
      if (!auth) return reply({ user: null });
      const c = await renewIfOld(auth);
      return reply({ user: publicUser(auth.user) }, 200, c ? [c] : []);
    }
    return reply({ error: "Not found" }, 404);
  }

  if (!sameOrigin(req)) return reply({ error: "Cross-site request blocked" }, 403);
  const body = await readBody(req);
  if (!body) return reply({ error: "Invalid request" }, 400);
  const U = users();

  if (action === "signup") {
    const wait = await limited("su:" + ip, 10, HOUR);
    if (wait) return reply({ error: `Too many sign-ups from this network. Try again in ${wait} min.` }, 429);
    await hit("su:" + ip, HOUR);
    if (inviteCode && !safeEqual(String(body.invite || "").trim(), inviteCode)) return reply({ error: "That invite code isn't right. Ask whoever shared the game for it.", field: "invite" }, 403);
    const username = normUser(body.username);
    if (!validUsername(username)) return reply({ error: "Usernames are 3-20 characters: letters, numbers, dot, dash or underscore, starting with a letter or number.", field: "username" }, 400);
    if (RESERVED.has(username)) return reply({ error: "That username is reserved. Pick another.", field: "username" }, 400);
    const displayName = cleanName(body.displayName) || username;
    const problem = passwordProblem(body.password, username);
    if (problem) return reply({ error: problem, field: "password" }, 400);
    const uid = randomBytes(9).toString("base64url").replace(/[-_]/g, "x");
    const claim = await U.setJSON("n/" + username, { uid }, { onlyIfNew: true });
    if (claim && claim.modified === false) return reply({ error: "That username is taken. Try another.", field: "username" }, 409);
    const recovery = newRecoveryCode();
    const user = { uid, username, displayName, pw: await hashPassword(body.password), rec: sha(normRecovery(recovery)), created: Date.now(), updated: Date.now(), sessions: [] };
    const s = await createSession(user);
    await U.setJSON("u/" + uid, user);
    return reply({ user: publicUser(user), recovery }, 201, [s.cookie]);
  }

  if (action === "login" || action === "reset") {
    const username = normUser(body.username);
    const userKey = (action === "login" ? "lf:" : "rf:") + sha(username).slice(0, 24);
    const wait = (await limited(userKey, 5, 15 * MIN)) || (await limited("li:" + ip, 30, HOUR));
    if (wait) return reply({ error: `Too many attempts. Try again in ${wait} min.` }, 429);
    const idx = validUsername(username) ? await U.get("n/" + username, { type: "json" }) : null;
    const user = idx ? await U.get("u/" + idx.uid, { type: "json" }) : null;
    let ok;
    if (action === "login") ok = await verifyPassword(String(body.password || ""), user && user.pw);
    else ok = !!user && safeEqual(sha(normRecovery(body.recovery)), user.rec);
    if (!ok) {
      await hit(userKey, 15 * MIN); await hit("li:" + ip, HOUR);
      return reply({ error: action === "login" ? "Username or password is wrong." : "Username or recovery code is wrong." }, 401);
    }
    await clearHits(userKey);
    if (action === "reset") await clearHits("lf:" + sha(username).slice(0, 24)); // proving ownership lifts a login lockout too
    let recovery;
    if (action === "reset") {
      const problem = passwordProblem(body.password, username);
      if (problem) return reply({ error: problem, field: "password" }, 400);
      await endSessions(user.sessions); user.sessions = [];
      user.pw = await hashPassword(body.password);
      recovery = newRecoveryCode(); user.rec = sha(normRecovery(recovery));
    }
    const s = await createSession(user);
    user.updated = Date.now(); user.lastLogin = Date.now();
    await U.setJSON("u/" + user.uid, user);
    return reply(recovery ? { user: publicUser(user), recovery } : { user: publicUser(user) }, 200, [s.cookie]);
  }

  // Everything below needs a signed-in user.
  const auth = await getSession(req);
  if (action === "logout") {
    if (auth) {
      await endSessions([auth.key]);
      auth.user.sessions = (auth.user.sessions || []).filter((k) => k !== auth.key);
      await U.setJSON("u/" + auth.uid, auth.user);
    }
    return reply({ ok: true }, 200, [clearCookie()]);
  }
  if (!auth) return reply({ error: "Please sign in again." }, 401, [clearCookie()]);
  const user = auth.user;

  if (action === "profile") {
    const displayName = cleanName(body.displayName);
    if (!displayName) return reply({ error: "Display name can't be empty.", field: "displayName" }, 400);
    if (displayName !== user.displayName) {
      user.displayName = displayName; user.updated = Date.now();
      await U.setJSON("u/" + user.uid, user);
      await renameInScores(user.uid, displayName);
    }
    return reply({ user: publicUser(user) });
  }

  if (action === "password" || action === "delete") {
    const key = "pf:" + user.uid;
    const wait = await limited(key, 5, 15 * MIN);
    if (wait) return reply({ error: `Too many attempts. Try again in ${wait} min.` }, 429);
    const ok = await verifyPassword(String((action === "password" ? body.current : body.password) || ""), user.pw);
    if (!ok) { await hit(key, 15 * MIN); return reply({ error: "Current password is wrong.", field: "current" }, 401); }
    await clearHits(key);

    if (action === "password") {
      const problem = passwordProblem(body.password, user.username);
      if (problem) return reply({ error: problem, field: "password" }, 400);
      user.pw = await hashPassword(body.password);
      await endSessions((user.sessions || []).filter((k) => k !== auth.key));
      user.sessions = [auth.key]; user.updated = Date.now();
      await U.setJSON("u/" + user.uid, user);
      return reply({ ok: true });
    }

    // Delete: devices, scores, progress, sessions, then the account itself.
    const S = subs();
    const { blobs } = await S.list();
    for (const { key: k } of blobs) {
      const rec = await S.get(k, { type: "json" });
      if (rec && rec.uid === user.uid) await S.delete(k);
    }
    await removeFromScores(user.uid);
    await progressStore().delete("u/" + user.uid);
    await endSessions(user.sessions);
    await U.delete("n/" + user.username);
    await U.delete("u/" + user.uid);
    return reply({ ok: true }, 200, [clearCookie()]);
  }

  return reply({ error: "Not found" }, 404);
};

export const config = { path: "/api/auth/:action", method: ["GET", "POST"] };
