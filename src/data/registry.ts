import type { Guide } from "@/types/guide";

// 指南内容的【唯一真相源】在独立内容仓库 travel-guide-content（guides/*.json + index.json）。
// 构建期（predev / prebuild）由 scripts/sync-content.mjs 从内容仓库拉取「已发布」指南，
// 生成下方快照 src/data/generated.ts（CONTENT_GUIDES / CONTENT_ORDER）。
// 站点只消费这份快照；远程源不可达时 sync-content 写空兜底，站点回退为无指南
// （不再保留 src/data/*.ts 静态指南做兜底——内容以内容仓库为准，见 work-log/README.md §3）。
import { CONTENT_GUIDES, CONTENT_ORDER } from "./generated";

export const TRAVEL_GUIDES: Record<string, Guide> = CONTENT_GUIDES;
export const GUIDE_ORDER: string[] = CONTENT_ORDER;
