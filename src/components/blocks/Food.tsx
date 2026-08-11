import { ForkKnife, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { RichText } from "@/components/RichText";
import type { FoodBlock } from "@/types/guide";

export function FoodView({ block }: { block: FoodBlock }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="flex items-center gap-1.5 text-base font-bold">
        <ForkKnife className="size-4 text-primary" /> {block.city}
        {block.flag && (
          <span className="rounded-md border bg-secondary px-2 py-0.5 text-xs font-normal text-muted-foreground">
            {block.flag}
          </span>
        )}
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {block.items.map((it, i) => (
          <Card key={i} className="p-3.5">
            <div className="flex items-center gap-1.5 font-semibold">
              <ForkKnife className="size-4 text-primary" /> {it.name}
            </div>
            {it.tags && it.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {it.tags.map((t, ti) => (
                  <span
                    key={ti}
                    className="rounded-md border bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            {it.addr && (
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3.5" /> {it.addr}
              </div>
            )}
            {it.dishes && it.dishes.length > 0 && (
              <div className="mt-1 text-xs text-muted-foreground">
                特色菜：{it.dishes.join("、")}
              </div>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              {(it.perCapita || it.price) && (
                <span className="font-mono text-sm font-bold text-rose-600">
                  {it.perCapita ?? it.price}
                </span>
              )}
              {it.hours && (
                <span className="text-xs text-muted-foreground">
                  营业 {it.hours}
                </span>
              )}
            </div>
            {it.src && (
              <div className="mt-1 text-[11px] text-success">{it.src}</div>
            )}
            {it.note && (
              <div className="mt-1 text-xs text-muted-foreground">
                <RichText value={it.note} />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
