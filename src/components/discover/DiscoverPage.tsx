import { useEffect, useMemo, useState, type ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { GUIDE_ORDER, TRAVEL_GUIDES } from "@/data/registry";
import { getGuides } from "@/lib/content";
import type { Guide } from "@/types/guide";
import {
  filterAndSort,
  distinctRegions,
  distinctYears,
  type DiscoverFilters,
} from "@/lib/guide-filters";
import { GuideCard } from "@/components/guide/GuideCard";

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export function DiscoverPage() {
  // Seed from the build-time snapshot, then upgrade to the live /guides list.
  const [all, setAll] = useState<Guide[]>(() =>
    GUIDE_ORDER.map((id) => TRAVEL_GUIDES[id]).filter(Boolean) as Guide[]
  );
  useEffect(() => {
    let cancelled = false;
    getGuides().then((g) => {
      if (!cancelled) setAll(g);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const regions = useMemo(() => distinctRegions(all), [all]);
  const years = useMemo(() => distinctYears(all), [all]);

  const [filters, setFilters] = useState<DiscoverFilters>({
    sort: "default",
    year: "all",
    region: "all",
    mode: "all",
  });
  const [open, setOpen] = useState(false);

  const result = useMemo(() => filterAndSort(all, filters), [all, filters]);

  const activeCount =
    (filters.year !== "all" ? 1 : 0) +
    (filters.region !== "all" ? 1 : 0) +
    (filters.mode !== "all" ? 1 : 0);

  const set = <K extends keyof DiscoverFilters>(
    k: K,
    v: DiscoverFilters[K]
  ) => setFilters((p) => ({ ...p, [k]: v }));

  const reset = () =>
    setFilters((p) => ({ ...p, year: "all", region: "all", mode: "all" }));

  return (
    <div className="container py-8">
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">发现指南</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          共 {all.length} 篇指南，可按条件筛选与排序。
        </p>
      </div>

      <div className="filter-subnav-inner sticky top-16 z-40 bg-background/85 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => set("sort", "default")}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                filters.sort === "default"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              默认
            </button>
            <button
              type="button"
              onClick={() => set("sort", "updated")}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                filters.sort === "updated"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              最近更新
            </button>
          </div>

          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setOpen((o) => !o)}
            >
              <SlidersHorizontal className="size-4" />
              过滤器
              {activeCount > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  {activeCount}
                </span>
              )}
            </Button>

            {open && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setOpen(false)}
                />
                <div className="absolute right-0 z-50 mt-2 w-[280px] rounded-xl border bg-popover p-4 text-popover-foreground shadow-lg sm:w-[320px]">
                  <div className="mb-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      时间范围
                    </p>
                    <select
                      value={String(filters.year)}
                      onChange={(e) =>
                        set(
                          "year",
                          e.target.value === "all" ? "all" : Number(e.target.value)
                        )
                      }
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="all">全部时间</option>
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y} 年
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      地点
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <FilterChip
                        active={filters.region === "all"}
                        onClick={() => set("region", "all")}
                      >
                        全部
                      </FilterChip>
                      {regions.map((r) => (
                        <FilterChip
                          key={r}
                          active={filters.region === r}
                          onClick={() => set("region", r)}
                        >
                          {r}
                        </FilterChip>
                      ))}
                    </div>
                  </div>

                  <div className="mb-1">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      形式
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <FilterChip
                        active={filters.mode === "all"}
                        onClick={() => set("mode", "all")}
                      >
                        全部
                      </FilterChip>
                      <FilterChip
                        active={filters.mode === "自驾"}
                        onClick={() => set("mode", "自驾")}
                      >
                        自驾
                      </FilterChip>
                      <FilterChip
                        active={filters.mode === "公共交通"}
                        onClick={() => set("mode", "公共交通")}
                      >
                        公共交通
                      </FilterChip>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={reset}>
                      重置
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        {result.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {result.map((g) => (
              <GuideCard key={g.id} guide={g} />
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyTitle>没有匹配的指南</EmptyTitle>
            <EmptyDescription>
              试着放宽筛选条件，或点击「重置」。
            </EmptyDescription>
          </Empty>
        )}
      </div>
    </div>
  );
}
