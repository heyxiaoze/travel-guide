// GitHub Contents API helpers. Guides live in the public content repo
// (e.g. heyxiaoze/travel-guide-content) as guides/<id>.json + guides/index.json.
// Admin writes go through a PAT (GITHUB_TOKEN) and a commit is created on `main`.
// Visitors read content at request time via the /guides Function (runtime read),
// so no travel-guide rebuild is needed after a content change.

interface GithubEnv {
  GITHUB_TOKEN: string;
  CONTENT_REPO: string; // "owner/repo"
}

function btoaUnicode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function atobUnicode(b64: string): string {
  const bin = atob(b64.replace(/\s/g, ""));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function apiUrl(repo: string, path: string): string {
  return `https://api.github.com/repos/${repo}/contents/${path}`;
}

async function ghFetch(
  url: string,
  token: string,
  method = "GET",
  body?: unknown,
): Promise<Response> {
  return fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "travel-guide-pages-fn",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function getContent(
  env: GithubEnv,
  path: string,
): Promise<{ content: string; sha: string } | null> {
  const res = await ghFetch(apiUrl(env.CONTENT_REPO, path), env.GITHUB_TOKEN);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`GET ${path} -> ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as { content: string; sha: string };
  return { content: atobUnicode(data.content), sha: data.sha };
}

async function putContent(
  env: GithubEnv,
  path: string,
  content: string,
  message: string,
  sha?: string,
): Promise<void> {
  const body: Record<string, unknown> = {
    message,
    content: btoaUnicode(content),
    branch: "main",
  };
  if (sha) body.sha = sha;
  const res = await ghFetch(
    apiUrl(env.CONTENT_REPO, path),
    env.GITHUB_TOKEN,
    "PUT",
    body,
  );
  if (!res.ok) {
    throw new Error(`PUT ${path} -> ${res.status}: ${await res.text()}`);
  }
}

async function deleteContent(
  env: GithubEnv,
  path: string,
  message: string,
  sha: string,
): Promise<void> {
  const res = await ghFetch(apiUrl(env.CONTENT_REPO, path), env.GITHUB_TOKEN, "DELETE", {
    message,
    sha,
    branch: "main",
  });
  if (!res.ok) {
    throw new Error(`DELETE ${path} -> ${res.status}: ${await res.text()}`);
  }
}

export async function writeGuide(
  env: GithubEnv,
  id: string,
  content: string,
): Promise<void> {
  const path = `guides/${id}.json`;
  const existing = await getContent(env, path);
  await putContent(
    env,
    path,
    content,
    `update guide ${id}`,
    existing?.sha,
  );
}

export async function deleteGuide(env: GithubEnv, id: string): Promise<void> {
  const path = `guides/${id}.json`;
  const existing = await getContent(env, path);
  if (!existing) return;
  await deleteContent(env, path, `delete guide ${id}`, existing.sha);
}

type IndexEntry = {
  id: string;
  status: string;
  title: string;
  subtitle?: string;
  emoji?: string;
  color?: string;
  updatedAt?: string;
  badge?: string;
  modes?: string[];
  cities?: number;
};

export async function upsertIndexEntry(
  env: GithubEnv,
  guide: Record<string, unknown>,
): Promise<void> {
  const path = "guides/index.json";
  const existing = await getContent(env, path);
  const list: IndexEntry[] = existing ? JSON.parse(existing.content) : [];
  const entry: IndexEntry = {
    id: String(guide.id),
    status: (guide.status as string) || "published",
    title: String(guide.title ?? ""),
    subtitle: (guide.subtitle as string) ?? "",
    emoji: (guide.emoji as string) ?? "",
    color: (guide.color as string) ?? "",
    updatedAt: new Date().toISOString().slice(0, 10),
    badge: (guide.badge as string) ?? "",
    modes: (guide.modes as string[]) ?? [],
    cities: (guide.cities as number) ?? 0,
  };
  const i = list.findIndex((g) => g.id === entry.id);
  if (i >= 0) list[i] = entry;
  else list.push(entry);
  await putContent(
    env,
    path,
    JSON.stringify(list, null, 2),
    `index: upsert ${entry.id}`,
    existing?.sha,
  );
}

export async function removeIndexEntry(
  env: GithubEnv,
  id: string,
): Promise<void> {
  const path = "guides/index.json";
  const existing = await getContent(env, path);
  if (!existing) return;
  const list = (JSON.parse(existing.content) as IndexEntry[]).filter(
    (g) => g.id !== id,
  );
  await putContent(
    env,
    path,
    JSON.stringify(list, null, 2),
    `index: remove ${id}`,
    existing.sha,
  );
}
