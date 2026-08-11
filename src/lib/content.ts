import { TRAVEL_GUIDES, GUIDE_ORDER } from "@/data/registry";
import type { Guide } from "@/types/guide";

const LIVE = "/guides";

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Live guide list (full Guide[]), served by the /guides Cloudflare Function
 * which proxies the content repo. Falls back to the build-time snapshot when
 * the edge / content repo is unreachable.
 */
export async function getGuides(): Promise<Guide[]> {
  const live = await fetchJson<Guide[]>(LIVE);
  if (live && Array.isArray(live) && live.length > 0) return live;
  return (
    GUIDE_ORDER.map((id) => TRAVEL_GUIDES[id]).filter(Boolean) as Guide[]
  );
}

/**
 * Live single guide, served by the /guides/<id> Cloudflare Function.
 * Falls back to the build-time snapshot.
 */
export async function getGuide(id: string): Promise<Guide | undefined> {
  const live = await fetchJson<Guide>(`${LIVE}/${encodeURIComponent(id)}`);
  if (live && live.id) return live;
  return TRAVEL_GUIDES[id];
}
