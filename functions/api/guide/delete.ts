// POST /api/guide/delete { id } -> admin-gated. Deletes guides/<id>.json and
// removes it from guides/index.json, then triggers a Deploy Hook.
import { getCookie, verifySession, json } from "../_lib/auth";
import {
  deleteGuide,
  removeIndexEntry,
  triggerDeploy,
} from "../_lib/github";

export async function onRequestPost(context: any) {
  const { request, env } = context;
  if (!(await verifySession(getCookie(request), env.ADMIN_PASSWORD))) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }
  const body = await request.json().catch(() => null);
  const id = body?.id;
  if (typeof id !== "string") {
    return json({ ok: false, error: "invalid id" }, 400);
  }
  try {
    await deleteGuide(env, id);
    await removeIndexEntry(env, id);
    await triggerDeploy(env.DEPLOY_HOOK_URL);
    return json({ ok: true, id });
  } catch (e: any) {
    return json({ ok: false, error: e?.message ?? "delete failed" }, 500);
  }
}
