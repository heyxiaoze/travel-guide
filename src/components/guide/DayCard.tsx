/* Hallmark · component: itinerary-day-card · genre: editorial-detail
 * theme: project-tokens (shadcn HSL) · studied: yes · DNA-source: url (trip.com hotel detail)
 * states: default · (hover/focus inherited from parent card)
 * contrast: pass (white on gradient header carries a dark scrim)
 */

import { Car, Moon, UtensilsCrossed } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RichText } from "@/components/RichText";
import { PlaceChip } from "@/components/blocks/Place";
import { tagClass } from "@/components/blocks/Day";
import type { DayBlock } from "@/types/guide";

export function DayCard({
  block,
  color,
  dayIndex,
}: {
  block: DayBlock;
  color?: string;
  dayIndex?: number;
}) {
  return (
    <Card
      id={dayIndex != null ? `day-${dayIndex}` : undefined}
      data-day={dayIndex}
      className="scroll-mt-[140px] overflow-hidden"
    >
      {/* Header band — gradient "room card" header carrying the guide's identity colour */}
      <div
        className="relative isolate flex flex-wrap items-center gap-3 px-4 py-3"
        style={color ? { backgroundImage: color } : undefined}
      >
        <div className="absolute inset-0 -z-10 bg-black/20" />
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/95 font-mono text-sm font-extrabold text-slate-900 shadow-sm">
          {block.no}
        </div>
        <div className="min-w-0">
          <div className="text-base font-bold leading-tight text-white drop-shadow-sm">
            {block.title}
          </div>
          {block.date && (
            <div className="font-mono text-xs text-white/85">{block.date}</div>
          )}
        </div>
        {block.km && (
          <div className="ml-auto inline-flex items-center gap-1 rounded-md bg-white/90 px-2.5 py-1 font-mono text-xs font-semibold text-slate-900 shadow-sm">
            <Car className="size-3.5" /> {block.km}
          </div>
        )}
      </div>

      <div className="px-4 py-3">
        {/* Vertical timeline — each stop is a stop on the day's route */}
        <ul className="relative flex flex-col gap-4 border-l border-border/60 pl-4">
          {block.items.map((it, i) => (
            <li key={i} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[22px] top-1 size-2.5 rounded-full border-2 border-background bg-primary"
              />
              <div className="font-mono text-xs font-medium text-muted-foreground">
                {it.time}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
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
                <div className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
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
            </li>
          ))}
        </ul>

        {/* Per-meal alternatives (早 / 午 / 晚 / 夜宵 / 小吃) */}
        {block.meals && block.meals.length > 0 && (
          <div className="mt-4 flex flex-col gap-3 border-t border-dashed pt-3">
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

        {/* Footer band — where to sleep, what to eat, day-level note */}
        {(block.sleep || block.eat || block.note) && (
          <div className="mt-4 flex flex-col gap-2.5 rounded-lg bg-secondary/40 px-3 py-2.5">
            {block.sleep && (
              <div className="flex items-start gap-2">
                <Moon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    过夜 / 休息
                  </div>
                  <PlaceChip place={block.sleep} />
                </div>
              </div>
            )}
            {block.eat && block.eat.length > 0 && (
              <div className="flex items-start gap-2">
                <UtensilsCrossed className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    备选吃
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {block.eat.map((p, i) => (
                      <PlaceChip key={i} place={p} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            {block.note && (
              <div className="rounded-md border border-dashed bg-background/60 p-2.5 text-[13px] leading-relaxed text-muted-foreground">
                <RichText value={block.note} />
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
