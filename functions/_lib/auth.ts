// Admin session: HMAC-signed HttpOnly cookie using Web Crypto (available in the
// Cloudflare Workers/Pages runtime). The password itself is never placed in the
// cookie — only an HMAC over a signed payload, keyed by ADMIN_PASSWORD. This keeps
// the secret server-side and out of the client bundle.

const COOKIE_NAME = "tg_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function toBinaryString(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return s;
}

function b64urlEncode(input: string | ArrayBuffer): string {
  const bytes =
    typeof input === "string"
      ? new TextEncoder().encode(input)
      : new Uint8Array(input);
  return btoa(toBinaryString(bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function hmac(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return b64urlEncode(sig);
}

export async function signSession(secret: string): Promise<string> {
  const payload = b64urlEncode(JSON.stringify({ v: 1, iat: Date.now() }));
  const sig = await hmac(secret, payload);
  return `${payload}.${sig}`;
}

export async function verifySession(
  token: string | undefined,
  secret: string,
): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expected = await hmac(secret, payload);
  if (sig.length !== expected.length) return false;
  let ok = true;
  for (let i = 0; i < expected.length; i++) {
    if (sig[i] !== expected[i]) ok = false;
  }
  return ok;
}

export function getCookie(request: Request): string | undefined {
  const header = request.headers.get("Cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === COOKIE_NAME) return rest.join("=");
  }
  return undefined;
}

export function isSecure(request: Request): boolean {
  return new URL(request.url).protocol === "https:";
}

// Full Set-Cookie header value. Pass null to clear.
export function sessionCookie(token: string | null, secure: boolean): string {
  const base = `${COOKIE_NAME}=${token ?? ""}; Path=/; HttpOnly; SameSite=Lax`;
  const age = token ? `; Max-Age=${MAX_AGE}` : "; Max-Age=0";
  return `${base}${age}${secure ? "; Secure" : ""}`;
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
