// Runtime read of published guides from the public content repo.
//   GET /guides        -> Guide[] (full objects, used for cards & filters)
//   GET /guides/<id>   -> single Guide
//
// This is what lets the live site reflect travel-guide-content changes with
// NO travel-guide rebuild: visitors read content through the Cloudflare edge,
// which caches it (s-maxage + stale-while-revalidate) so GitHub is only hit at
// most once per cache window per guide. Edit the content repo and it goes live
// within the TTL — no need to commit/push travel-guide or redeploy CF.
//
// The build-time snapshot (src/data/generated.ts) stays only as an offline
// fallback for when the edge / GitHub is unreachable (see src/lib/content.ts).

function repo(env: any): string {
  return env.CONTENT_REPO || "heyxiaoze/travel-guide-content";
}
function ref(env: any): string {
  return env.CONTENT_REF || "main";
}
function base(env: any): string {
  return `https://raw.githubusercontent.com/${repo(env)}/${ref(env)}/guides`;
}
function cacheHeaders(env: any): Record<string, string> {
  const sMaxAge = Math.max(0, Number(env.GUIDE_CACHE_SMAXAGE ?? 60));
  return {
    "Cache-Control": `public, s-maxage=${sMaxAge}, stale-while-revalidate=86400`,
  };
}

async function getJson(url: string): Promise<any | null> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "travel-guide-pages-fn",
      Accept: "application/json",
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json();
}

export async function onRequestGet(context: any) {
  const { request, env } = context;
  const url = new URL(request.url);
  const seg = url.pathname.replace(/^\/guides\/?/, "").split("/").filter(Boolean);
  const id = seg[0];

  try {
    if (!id) {
      // List: read index.json, then fetch each published guide's full JSON.
      const index: any[] = (await getJson(`${base(env)}/index.json`)) ?? [];
      const published = index.filter(
        (e) => (e.status ?? "published") === "published"
      );
      const guides = await Promise.all(
        published.map(async (e) => {
          try {
            return await getJson(`${base(env)}/${e.id}.json`);
          } catch {
            return null;
          }
        })
      );
      const list = guides.filter(Boolean);
      return new Response(JSON.stringify(list), {
        headers: { "Content-Type": "application/json", ...cacheHeaders(env) },
      });
    }

    const guide = await getJson(`${base(env)}/${id}.json`);
    if (!guide) {
      return new Response(JSON.stringify({ error: "not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(guide), {
      headers: { "Content-Type": "application/json", ...cacheHeaders(env) },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "fetch failed" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
