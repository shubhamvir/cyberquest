// GET /api/vapid -> the public VAPID key browsers need to subscribe to push.
import { vapid, json } from "../lib/push.mjs";

export default async () => {
  const { publicKey } = await vapid();
  return json({ publicKey });
};

export const config = { path: "/api/vapid", method: "GET" };
