// POST /api/guide/save { guide } -> admin-gated. Writes guides/<id>.json and
// upserts guides/index.json in the content repo, then triggers a Deploy Hook.
import { getCookie, verifySession, json } from "../../_lib/auth";
import {
  writeGuide,
  upsertIndexEntry,
  triggerDeploy,
} from "../../_lib/github";

export async function onRequestPost(context: any) {
  const { request, env } = context;
  if (!(await verifySession(getCookie(request), env.ADMIN_PASSWORD))) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }
  const body = await request.json().catch(() => null);
  const guide = body?.guide;
  if (
    !guide ||
    typeof guide.id !== "string" ||
    typeof guide.title !== "string" ||
    !Array.isArray(guide.sections)
  ) {
    return json({ ok: false, error: "invalid guide payload" }, 400);
  }
  try {
    await writeGuide(env, guide.id, JSON.stringify(guide, null, 2));
    await upsertIndexEntry(env, guide);
    await triggerDeploy(env.DEPLOY_HOOK_URL);
    return json({ ok: true, id: guide.id });
  } catch (e: any) {
    return json({ ok: false, error: e?.message ?? "write failed" }, 500);
  }
}
