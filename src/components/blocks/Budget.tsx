import { Card } from "@/components/ui/card";
import { RichText } from "@/components/RichText";
import type { BudgetBlock } from "@/types/guide";

export function BudgetView({ block }: { block: BudgetBlock }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {(block.cells ?? []).map((c, i) => (
        <Card key={i} className="p-3.5">
          <div className="text-xs font-medium text-muted-foreground">{c.k}</div>
          <div className="mt-1 font-mono text-base font-bold text-foreground">
            {c.v}
          </div>
          {c.n && (
            <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
              <RichText value={c.n} />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
