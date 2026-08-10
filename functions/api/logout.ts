// POST /api/logout -> clears the session cookie.
import { sessionCookie, isSecure, json } from "../_lib/auth";

export async function onRequestPost(context: any) {
  const { request } = context;
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Set-Cookie": sessionCookie(null, isSecure(request)),
    },
  });
}
