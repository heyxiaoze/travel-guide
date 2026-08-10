import type { Block, Guide } from "@/types/guide";

export function countDays(g: Guide): number {
  return g.sections.reduce(
    (acc, s) => acc + s.blocks.filter((b) => b.t === "day").length,
    0
  );
}

export function countPlaces(g: Guide): number {
  let n = 0;
  const walk = (b: Block) => {
    if (b.t === "place") n += 1;
    else if (b.t === "places") n += b.items.length;
    else if (b.t === "day") {
      b.items.forEach((it) => {
        if (it.place) n += 1;
      });
      if (b.sleep) n += 1;
      if (b.eat) n += (b.eat || []).length;
    }
  };
  g.sections.forEach((s) => s.blocks.forEach(walk));
  return n;
}

export function extractDate(subtitle?: string): string {
  const m = (subtitle || "").match(
    /(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}|\d{1,2}[\/\-]\d{1,2}|\d{1,2}月\d{1,2}日?)/
  );
  return m ? m[1] : "";
}

/** 累计自驾里程（km）。从各攻略 facts 中的「总里程」解析并求和。 */
export function totalDrivingKm(guides: Guide[]): number {
  let km = 0;
  for (const g of guides) {
    const v = g.facts?.find((f) => f.k === "总里程")?.v || "";
    const m = v.match(/(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+)/);
    if (m) km += parseFloat(m[1].replace(/,/g, ""));
  }
  return km;
}
