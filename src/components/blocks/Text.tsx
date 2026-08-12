import type { TextBlock, PointsBlock, SummaryBlock } from "@/types/guide";
import { RichText } from "@/components/RichText";

const NUMS = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];

export function TextBlockView({ block }: { block: TextBlock }) {
  const paras = Array.isArray(block.s) ? block.s : [block.s];
  return (
    <div className="text-[15px] leading-relaxed text-foreground/90">
      {paras.map((p, i) => (
        <p key={i} className="mb-3">
          <RichText value={p} />
        </p>
      ))}
    </div>
  );
}

export function PointsView({ block }: { block: PointsBlock }) {
  return (
    <div className="flex flex-col gap-3">
      {(block.items ?? []).map((it, i) => (
        <div key={i} className="flex gap-3">
          <span className="grid size-7 shrink-0 place-items-center rounded-md bg-secondary text-sm font-bold text-primary">
            {NUMS[i] ?? i + 1}
          </span>
          <div>
            <div className="font-semibold">{it.k}</div>
            <div className="text-sm leading-relaxed text-muted-foreground">
              <RichText value={it.v} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SummaryView({ block }: { block: SummaryBlock }) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-xs">
      <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {(block.rows ?? []).map((r, i) => (
          <div
            key={i}
            className="flex items-baseline justify-between gap-3 border-b border-dashed py-1.5 last:border-0"
          >
            <span className="text-sm text-muted-foreground">{r.k}</span>
            <span className="text-right font-medium">{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
