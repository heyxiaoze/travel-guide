// GET /api/me -> { isAdmin } based on the signed session cookie.
import { getCookie, verifySession, json } from "../_lib/auth";

export async function onRequestGet(context: any) {
  const { request, env } = context;
  const ok = await verifySession(getCookie(request), env.ADMIN_PASSWORD);
  return json({ isAdmin: ok });
}
