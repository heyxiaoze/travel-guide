// POST /api/login { password } -> sets signed HttpOnly cookie on success.
import { signSession, sessionCookie, isSecure, json } from "../_lib/auth";

export async function onRequestPost(context: any) {
  const { request, env } = context;
  const { password } = await request.json().catch(() => ({}));
  if (typeof password === "string" && password === env.ADMIN_PASSWORD) {
    const token = await signSession(env.ADMIN_PASSWORD);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Set-Cookie": sessionCookie(token, isSecure(request)),
      },
    });
  }
  return json({ ok: false, error: "invalid password" }, 401);
}
