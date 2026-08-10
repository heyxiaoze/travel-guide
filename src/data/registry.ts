import type { Guide } from "@/types/guide";
import { guideData as qinggan } from "./qinggan-2026";
import { guideData as chuanyu } from "./chuanyu-2026";

export const GUIDE_ORDER: string[] = [qinggan.id, chuanyu.id];

export const TRAVEL_GUIDES: Record<string, Guide> = {
  [qinggan.id]: qinggan,
  [chuanyu.id]: chuanyu,
};
