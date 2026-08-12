/* Hallmark · pre-emit critique: P4 H4 E4 S4 R4 V5 */
/* Hallmark · component: card
 * genre: playful (inferred from reference)
 * theme: studied-DNA (user reference: stacked pastel job cards)
 * states: default · hover · focus · active
 * contrast: pass (40–41)
 */

import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { RichText } from "@/components/RichText";
import { countDays, countPlaces } from "@/lib/guide-stats";
import type { Guide } from "@/types/guide";

export function GuideCard({ guide }: { guide: Guide }) {
  const days = countDays(guide);
  const places = countPlaces(guide);
  return (
    <Link
      to={`/guide/${guide.id}`}
      style={{ "--card-accent": guide.color } as CSSProperties}
      className="group relative block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:opacity-95"
    >
      {/* Back shadow layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none [transform:translate(8px,8px)_rotate(2deg)] group-hover:[transform:translate(10px,10px)_rotate(3deg)]"
        style={{ background: guide.color, opacity: 0.16 }}
      />
      {/* Mid shadow layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none [transform:translate(4px,4px)_rotate(-1deg)] group-hover:[transform:translate(5px,5px)_rotate(-2deg)]"
        style={{ background: guide.color, opacity: 0.28 }}
      />

      <Card className="relative flex h-full flex-col overflow-hidden rounded-2xl border-border/60 bg-card shadow-sm">
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
              style={{ background: guide.color }}
            >
              <RichText
                value={guide.emoji ?? "{{icon:compass}}"}
                iconClassName="size-5"
              />
            </div>
            <div className="text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <span className="block">{days} 天</span>
              <span className="block">{places} 地点</span>
            </div>
          </div>

          <h3 className="text-lg font-bold leading-tight tracking-tight text-foreground">
            {guide.title}
          </h3>
          {guide.subtitle && (
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {guide.subtitle}
            </p>
          )}

          {guide.meta && guide.meta.length > 0 && (
            <div className="mb-3 mt-3 flex flex-wrap gap-1">
              {guide.meta.slice(0, 3).map((m, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-full border border-border/80 bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                >
                  {m}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-4">
            <span className="text-xs font-medium text-muted-foreground">
              查看指南
            </span>
            <span className="guide-arrow inline-flex size-7 items-center justify-center rounded-full">
              <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
