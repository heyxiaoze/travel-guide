import type { Guide } from "@/types/guide";

export type SortKey = "default" | "updated";
export type ModeKey = "自驾" | "公共交通";

/** 地点：取 breadcrumb 的第二级（如「西北」「川渝」）。 */
export function guideRegion(g: Guide): string {
  return g.breadcrumb?.[1] ?? "其他";
}

/** 形式：可多选。优先用数据里显式声明的 `modes`；否则从「方式」fact / 标题 / 副标题推断。 */
export function guideModes(g: Guide): ModeKey[] {
  if (Array.isArray(g.modes) && g.modes.length > 0) {
    return g.modes.filter((m): m is ModeKey => m === "自驾" || m === "公共交通");
  }
  const text = [g.facts?.find((f) => f.k === "方式")?.v, g.subtitle, g.title]
    .filter(Boolean)
    .join(" ");
  return /自驾/.test(text) ? ["自驾"] : ["公共交通"];
}

/** 行程年份：从副标题里的日期解析。 */
export function guideYear(g: Guide): number | null {
  const m = (g.subtitle || "").match(/(\d{4})[\/\-\.]\d/);
  return m ? Number(m[1]) : null;
}

export function guideUpdatedAt(g: Guide): number {
  return g.updatedAt ? new Date(g.updatedAt).getTime() : 0;
}

export interface DiscoverFilters {
  sort: SortKey;
  year: number | "all";
  region: string | "all";
  mode: ModeKey | "all";
}

export function filterAndSort(guides: Guide[], f: DiscoverFilters): Guide[] {
  const list = guides.filter((g) => {
    if (f.year !== "all" && guideYear(g) !== f.year) return false;
    if (f.region !== "all" && guideRegion(g) !== f.region) return false;
    if (f.mode !== "all" && !guideModes(g).includes(f.mode)) return false;
    return true;
  });
  if (f.sort === "updated") {
    return [...list].sort((a, b) => guideUpdatedAt(b) - guideUpdatedAt(a));
  }
  // 默认：保持传入顺序（即创建时间顺序 / GUIDE_ORDER）
  return list;
}

export function distinctRegions(guides: Guide[]): string[] {
  return Array.from(new Set(guides.map(guideRegion)));
}

export function distinctYears(guides: Guide[]): number[] {
  return Array.from(
    new Set(guides.map(guideYear).filter((y): y is number => y !== null))
  ).sort((a, b) => b - a);
}
