import type { Guide } from "@/types/guide";
import { guideData as qinggan } from "./qinggan-2026";
import { guideData as chuanyu } from "./chuanyu-2026";
import { guideData as dalianQiqihaer } from "./dalian-qiqihaer-2026";
// 构建期由 scripts/sync-content.mjs 从内容仓库生成（已发布攻略）。
// 远程源不可达时为空，此时回退到下面的静态攻略（决策⑥：保留 src/data/*.ts 兜底）。
import { CONTENT_GUIDES, CONTENT_ORDER } from "./generated";

// 静态兜底：与内容仓库保持一致的三篇原始攻略。
const STATIC_GUIDES: Record<string, Guide> = {
  [qinggan.id]: qinggan,
  [chuanyu.id]: chuanyu,
  [dalianQiqihaer.id]: dalianQiqihaer,
};
const STATIC_ORDER = [qinggan.id, chuanyu.id, dalianQiqihaer.id];

// 优先使用内容仓库快照（若非空），否则回退静态攻略。
export const TRAVEL_GUIDES: Record<string, Guide> =
  Object.keys(CONTENT_GUIDES).length > 0 ? CONTENT_GUIDES : STATIC_GUIDES;

export const GUIDE_ORDER: string[] =
  CONTENT_ORDER.length > 0 ? CONTENT_ORDER : STATIC_ORDER;
