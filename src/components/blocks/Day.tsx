import type { ReactNode } from "react";
import { Car } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RichText } from "@/components/RichText";
import { PlaceChip } from "./Place";
import type { DayBlock } from "@/types/guide";

export const TAG_STYLES: Record<string, string> = {
  free: "bg-success/10 text-success border-success/20",
  book: "bg-warning/10 text-warning border-warning/20",
  photo: "bg-secondary text-secondary-foreground border-border",
  charge: "bg-info/10 text-info border-info/20",
  bath: "bg-info/10 text-info border-info/20",
  opt: "bg-muted text-muted-foreground border-border",
  supply: "bg-success/10 text-success border-success/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

export function tagClass(t: string): string {
  if (/免费|不收费/.test(t)) return TAG_STYLES.free;
  if (/预约|需约|必抢|抢票/.test(t)) return TAG_STYLES.book;
  if (/拍照|出片|摄影/.test(t)) return TAG_STYLES.photo;
  if (/换电|充电|补能/.test(t)) return TAG_STYLES.charge;
  if (/洗澡|温泉|淋浴/.test(t)) return TAG_STYLES.bath;
  if (/可选|备选/.test(t)) return TAG_STYLES.opt;
  if (/补给|采购/.test(t)) return TAG_STYLES.supply;
  return TAG_STYLES.neutral;
}

function FootRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-16 shrink-0 pt-1 font-mono text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function DayView({
  block,
  dayIndex,
}: {
  block: DayBlock;
  dayIndex?: number;
}) {
  return (
    <Card
      id={dayIndex != null ? `day-${dayIndex}` : undefined}
      data-day={dayIndex}
      className="scroll-mt-[140px] overflow-hidden"
    >
      <div className="flex flex-wrap items-center gap-3 border-b bg-secondary/40 px-4 py-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
          {block.no}
        </div>
        <div className="min-w-0">
          <div className="font-bold">{block.title}</div>
          {block.date && (
            <div className="font-mono text-xs text-muted-foreground">
              {block.date}
            </div>
          )}
        </div>
        {block.km && (
          <div className="ml-auto inline-flex items-center gap-1 rounded-md border bg-card px-2.5 py-1 font-mono text-xs font-semibold">
            <Car className="size-3.5 text-primary" /> {block.km}
          </div>
        )}
      </div>
      <div className="px-4 py-3">
        <ul className="flex flex-col gap-3">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-3">
              <div className="w-16 shrink-0 pt-0.5 font-mono text-xs text-muted-foreground">
                {it.time}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                  {it.place ? (
                    <PlaceChip place={it.place} />
                  ) : it.s ? (
                    <div className="text-sm leading-relaxed">
                      <RichText value={it.s} />
                    </div>
                  ) : null}
                  {it.tags && it.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {it.tags.map((t, ti) => (
                        <span
                          key={ti}
                          className={cn(
                            "rounded-md border px-2 py-0.5 text-xs font-medium",
                            tagClass(t)
                          )}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {it.note && (
                  <div className="mt-1.5 text-[13px] text-muted-foreground">
                    <RichText value={it.note} />
                  </div>
                )}
                {(it.parking || it.transit || it.duration) && (
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
                    {it.parking && <span>停车：{it.parking}</span>}
                    {it.transit && <span>公交：{it.transit}</span>}
                    {it.duration && <span>游玩：{it.duration}</span>}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
        {block.meals && block.meals.length > 0 && (
          <div className="mt-3 flex flex-col gap-3 border-t pt-3">
            {block.meals.map((slot, si) => (
              <div key={si}>
                <div className="mb-1 font-mono text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  {slot.kind}
                </div>
                <div className="flex flex-col gap-1.5">
                  {slot.items.map((m, mi) => (
                    <div
                      key={mi}
                      className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]"
                    >
                      <span className="font-semibold">{m.name}</span>
                      {m.tags?.map((t, ti) => (
                        <span
                          key={ti}
                          className="rounded-md border bg-secondary px-1.5 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                      {m.dishes && m.dishes.length > 0 && (
                        <span className="text-muted-foreground">
                          特色菜：{m.dishes.join("、")}
                        </span>
                      )}
                      {m.perCapita && (
                        <span className="font-mono text-sm font-bold text-rose-600">
                          {m.perCapita}
                        </span>
                      )}
                      {m.hours && (
                        <span className="text-muted-foreground">
                          营业 {m.hours}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {(block.sleep || block.eat || block.note) && (
          <div className="mt-3 flex flex-col gap-2 border-t pt-3">
            {block.sleep && (
              <FootRow label="过夜 / 休息">
                <PlaceChip place={block.sleep} />
              </FootRow>
            )}
            {block.eat && block.eat.length > 0 && (
              <FootRow label="吃">
                <div className="flex flex-wrap gap-2">
                  {block.eat.map((p, i) => (
                    <PlaceChip key={i} place={p} />
                  ))}
                </div>
              </FootRow>
            )}
            {block.note && (
              <div className="rounded-md border border-dashed bg-muted/40 p-2.5 text-[13px] text-muted-foreground">
                <RichText value={block.note} />
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
