/* Hallmark · macrostructure: Detail Page (itinerary-led) · genre: editorial-detail
 * theme: project-tokens (shadcn HSL) · studied: yes · DNA-source: url (trip.com hotel detail)
 * redesign-scope: hero + sticky subnav + day-as-room-card; IA / routes preserved
 */

import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useParams } from "react-router-dom";
import { Download } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button, buttonVariants } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyTitle, EmptyActions } from "@/components/ui/empty";
import { RichText } from "@/components/RichText";
import SplitReveal from "@/animata/preloader/split-reveal";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { GuideEditor } from "./GuideEditor";
import { DayCard } from "./DayCard";
import FluidTabs from "@/animata/tabs/fluid-tabs";
import { TRAVEL_GUIDES } from "@/data/registry";
import { getGuide } from "@/lib/content";
import { useAuth } from "@/lib/auth";
import type { Guide, Section } from "@/types/guide";

// Header height (h-[60px]) + sticky subnav (~52px) + breathing room.
const ANCHOR_OFFSET = 140;

function SectionHeader({ section }: { section: Section }) {
  return (
    <div className="mb-4 flex flex-col gap-1 border-l-2 border-primary pl-3">
      <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
        {section.icon && (
          <RichText value={section.icon} iconClassName="size-5 text-primary" />
        )}
        {section.title}
      </h2>
      {section.lead && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          <RichText value={section.lead} />
        </p>
      )}
    </div>
  );
}

function FactBar({ guide }: { guide: Guide }) {
  if (!guide.facts || guide.facts.length === 0) return null;
  return (
    <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
      {guide.facts.map((f, i) => (
        <div
          key={i}
          className="flex flex-col gap-1 rounded-xl border bg-card p-3 shadow-xs"
        >
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <RichText value={f.i ?? "{{icon:compass}}"} iconClassName="size-4 text-primary" />
            {f.k}
          </div>
          <div className="font-mono text-sm font-bold leading-tight text-foreground">
            {f.v}
          </div>
        </div>
      ))}
    </div>
  );
}

export function GuidePage() {
  const { id } = useParams();
  // Seed from the build-time snapshot, then upgrade to the live /guides/<id>.
  const [guide, setGuide] = useState<Guide | undefined>(
    id ? TRAVEL_GUIDES[id] : undefined
  );
  // `guideResolved` flips true once getGuide() settles (found or not). The
  // SplitReveal preloader uses it as its `ready` signal so the shutters only
  // open after the guide is actually available.
  const [guideResolved, setGuideResolved] = useState(() =>
    id ? !!TRAVEL_GUIDES[id] : true
  );
  // `preloadActive` keeps the preloader mounted through the reveal animation.
  // Armed on every guide-entry so the SplitReveal intro plays for all guides
  // (snapshot guides resolve near-instantly but still get the full reveal).
  const [preloadActive, setPreloadActive] = useState(() => (id ? true : false));
  const { isAdmin, loading: authLoading } = useAuth();
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!id) {
      setGuide(undefined);
      setGuideResolved(true);
      setPreloadActive(false);
      return;
    }
    let cancelled = false;
    setGuideResolved(false);
    setPreloadActive(true);
    getGuide(id)
      .then((g) => {
        if (cancelled) return;
        setGuide(g);
        setGuideResolved(true);
      })
      .catch(() => {
        if (cancelled) return;
        setGuide(undefined);
        setGuideResolved(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Flatten day blocks across all sections for the subnav + anchor ids.
  // Memoised so its array reference is stable across renders — an unstable
  // `days` would give `updateIndicator` a new identity every render and drive
  // the sliding-indicator layout effect into an infinite setState loop.
  const days = useMemo(() => {
    const out: { index: number; no: string; title: string }[] = [];
    if (guide) {
      let di = 0;
      guide.sections.forEach((s) =>
        s.blocks.forEach((b) => {
          if (b.t === "day") {
            di += 1;
            out.push({ index: di, no: b.no, title: b.title });
          }
        })
      );
    }
    return out;
  }, [guide]);

  const [activeDay, setActiveDay] = useState(() =>
    days[0] ? String(days[0].index) : ""
  );

  const activeIndex = days.findIndex((d) => String(d.index) === activeDay);
  const safeActiveIndex = activeIndex >= 0 ? activeIndex : 0;

  // Ref to the sticky subnav so we can keep the active tab within the
  // horizontally-scrollable row as the user scrolls the page (scroll-spy).
  const subnavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = subnavRef.current;
    if (!root) return;
    const active = root.querySelector<HTMLElement>('[aria-selected="true"]');
    if (active) {
      active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeDay]);

  // Scroll-spy: highlight the day currently in view. Declared BEFORE the
  // edit-mode early return so it is called on every render (Rules of Hooks).
  useEffect(() => {
    if (!guide || days.length === 0) return;
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-day]")
    );
    if (els.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          );
        if (visible[0]) {
          const idx = visible[0].target.getAttribute("data-day");
          if (idx != null) setActiveDay(idx);
        }
      },
      { rootMargin: `-${ANCHOR_OFFSET}px 0px -55% 0px`, threshold: 0 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [guide, days.length]);

  // When the live guide loads (e.g. an id not in the snapshot), make sure a
  // day is pre-selected for the sticky subnav.
  useEffect(() => {
    if (!activeDay && days[0]) setActiveDay(String(days[0].index));
  }, [days.length, activeDay]);

  if (guide && editing && isAdmin) {
    return <GuideEditor guide={guide} onClose={() => setEditing(false)} />;
  }

  const scrollToDay = (index: number) => {
    const el = document.getElementById(`day-${index}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Export the current guide to PDF via the browser's print pipeline.
  // The user picks "Save as PDF" in the print dialog; the @media print
  // stylesheet renders a clean light-theme document. We temporarily set
  // document.title so the saved file gets a sensible name, then restore it.
  const handleExportPdf = () => {
    const prev = document.title;
    const base = (guide?.title ?? "travel-guide").replace(/[\\/?:*""<>|]/g, "_");
    document.title = `${base} · 旅行手账`;
    const restore = () => {
      document.title = prev;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
  };

  if (preloadActive) {
    return (
      <SplitReveal
        ready={guideResolved}
        backgroundColor="hsl(var(--background))"
        foregroundColor="hsl(var(--foreground))"
        onComplete={() => setPreloadActive(false)}
      >
        <SplitReveal.Overlay>
          <SplitReveal.Shutter side="top" />
          <SplitReveal.Shutter side="bottom" />
          <SplitReveal.Progress>
            <div className="flex flex-col items-center justify-center gap-3">
              <RichText
                value={guide?.emoji ?? "{{icon:compass}}"}
                iconClassName="size-10 text-primary drop-shadow"
              />
              <p className="text-sm font-medium tracking-[0.2em] text-muted-foreground">
                正在打开指南…
              </p>
            </div>
          </SplitReveal.Progress>
        </SplitReveal.Overlay>
      </SplitReveal>
    );
  }

  if (!guide) {
    return (
      <div className="container py-24">
        <Empty>
          <EmptyTitle>没有找到这篇指南</EmptyTitle>
          <EmptyDescription>链接可能已失效，或指南尚未发布。</EmptyDescription>
          <EmptyActions>
            <Link to="/" className={buttonVariants()}>
              返回首页
            </Link>
          </EmptyActions>
        </Empty>
      </div>
    );
  }

  let di = 0; // running day index, kept in sync with the `days` array above.

  return (
    <div>
      {/* Cover band: gradient + emoji hero */}
      <section
        className="guide-cover flex h-40 items-center justify-center sm:h-52"
        style={{ background: guide.color }}
      >
        <RichText
          value={guide.emoji ?? "{{icon:compass}}"}
          iconClassName="size-12 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] sm:size-16"
        />
      </section>

      <div className="container py-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link
                to="/"
                className="transition-colors hover:text-foreground"
              >
                首页
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {(guide.breadcrumb ?? []).flatMap((crumb, i) => (
              <Fragment key={i}>
                <BreadcrumbItem>
                  <span className="text-muted-foreground">{crumb}</span>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </Fragment>
            ))}
            <BreadcrumbItem>
              <BreadcrumbPage>{guide.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Title block */}
        <div className="mt-4 flex flex-col gap-3">
          {/* Title + badge share one line: vertically centered, left-aligned */}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {guide.title}
            </h1>
            {guide.badge && (
              <div
                className="inline-flex w-fit self-stretch items-center rounded-md px-4 text-base font-medium text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
                style={{ background: guide.color }}
              >
                {/* icon stripped: only the label text remains */}
                <RichText
                  value={guide.badge.replace(/^\{\{icon:[a-z0-9-]+\}\}\s*/, "")}
                />
              </div>
            )}
          </div>
          {guide.subtitle && (
            <p className="text-base text-muted-foreground sm:text-lg">
              {guide.subtitle}
            </p>
          )}
          {guide.meta && guide.meta.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {guide.meta.map((m, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-full border border-border/70 bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  {m}
                </span>
              ))}
            </div>
          )}
          {!editing && (
            <div className="no-print flex items-center justify-end gap-2">
              <Button size="sm" variant="outline" onClick={handleExportPdf}>
                <Download className="size-4" />
                导出 PDF
              </Button>
              {isAdmin && !authLoading && (
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                  编辑指南
                </Button>
              )}
            </div>
          )}
        </div>

        <FactBar guide={guide} />
      </div>

      {/* Sticky day subnav */}
      {days.length > 0 && (
        <div
          ref={subnavRef}
          className="no-print sticky top-[60px] z-40 border-y bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        >
          <div className="container py-2">
            <FluidTabs
              activeIndex={safeActiveIndex}
              onActiveIndexChange={(i) => {
                const d = days[i];
                if (d) {
                  setActiveDay(String(d.index));
                  scrollToDay(d.index);
                }
              }}
              className="w-full"
            >
              <FluidTabs.List aria-label="行程天数">
                {days.map((d) => (
                  <FluidTabs.Tab key={d.index} label={d.no}>
                    <FluidTabs.Label>{d.no}</FluidTabs.Label>
                  </FluidTabs.Tab>
                ))}
              </FluidTabs.List>
            </FluidTabs>
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="container py-8">
        {guide.sections.map((section, si) => (
          <section key={si} className="mb-10">
            <SectionHeader section={section} />
            <div className="flex flex-col gap-5">
              {section.blocks.map((block, bi) => {
                if (block.t === "day") {
                  di += 1;
                  return (
                    <DayCard
                      key={bi}
                      block={block}
                      color={guide.color}
                      dayIndex={di}
                    />
                  );
                }
                return <BlockRenderer key={bi} block={block} />;
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
