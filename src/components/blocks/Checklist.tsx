import type { ChecklistBlock } from "@/types/guide";

export function ChecklistView({ block }: { block: ChecklistBlock }) {
  return (
    <div className="flex flex-col gap-3">
      {(block.groups ?? []).map((g, gi) => (
        <div key={gi} className="rounded-lg border bg-card p-3.5 shadow-xs">
          {g.title && (
            <div className="mb-2 border-b pb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {g.title}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            {(g.items ?? []).map((it, i) => (
              <label
                key={i}
                className="flex items-center gap-2.5 rounded-md p-1.5 text-sm transition-colors hover:bg-accent"
              >
                <input
                  type="checkbox"
                  className="size-4 shrink-0 accent-primary"
                />
                <span>{it}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
