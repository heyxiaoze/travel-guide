import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button, buttonVariants } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyTitle, EmptyActions } from "@/components/ui/empty";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichText } from "@/components/RichText";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { GuideEditor } from "./GuideEditor";
import { TRAVEL_GUIDES } from "@/data/registry";
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
        <p className="max-w-[760px] text-sm leading-relaxed text-muted-foreground">
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
  const guide = id ? TRAVEL_GUIDES[id] : undefined;
  const { isAdmin, loading: authLoading } = useAuth();
  const [editing, setEditing] = useState(false);

  // Flatten day blocks across all sections for the subnav + anchor ids.
  // Computed BEFORE the early returns below so that every hook is called
  // unconditionally (Rules of Hooks). Previously `activeDay` was declared
  // AFTER the edit-mode early return, so toggling edit changed the hook
  // count between renders and crashed React (#300 / white screen).
  const days: { index: number; no: string; title: string }[] = [];
  if (guide) {
    let di = 0;
    guide.sections.forEach((s) =>
      s.blocks.forEach((b) => {
        if (b.t === "day") {
          di += 1;
          days.push({ index: di, no: b.no, title: b.title });
        }
      })
    );
  }

  const [activeDay, setActiveDay] = useState(() =>
    days[0] ? String(days[0].index) : ""
  );

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

  if (guide && editing && isAdmin) {
    return <GuideEditor guide={guide} onClose={() => setEditing(false)} />;
  }

  const scrollToDay = (index: number) => {
    const el = document.getElementById(`day-${index}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!guide) {
    return (
      <div className="container py-24">
        <Empty>
          <EmptyTitle>没有找到这篇攻略</EmptyTitle>
          <EmptyDescription>链接可能已失效，或攻略尚未发布。</EmptyDescription>
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
        className="flex h-40 items-center justify-center sm:h-52"
        style={{ background: guide.color }}
      >
        <RichText
          value={guide.emoji ?? "{{icon:compass}}"}
          iconClassName="size-12 text-white drop-shadow sm:size-16"
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
            {(guide.breadcrumb ?? []).map((crumb, i) => (
              <BreadcrumbItem key={i}>
                <span className="text-muted-foreground">{crumb}</span>
                <BreadcrumbSeparator />
              </BreadcrumbItem>
            ))}
            <BreadcrumbItem>
              <BreadcrumbPage>{guide.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Title block */}
        <div className="mt-4 flex flex-col gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {guide.title}
          </h1>
          {guide.subtitle && (
            <p className="max-w-[760px] text-base text-muted-foreground sm:text-lg">
              {guide.subtitle}
            </p>
          )}
          {guide.badge && (
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <RichText value={guide.badge} iconClassName="size-3.5 text-primary" />
            </div>
          )}
          {isAdmin && !authLoading && !editing && (
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                编辑攻略
              </Button>
            </div>
          )}
        </div>

        <FactBar guide={guide} />
      </div>

      {/* Sticky day subnav */}
      {days.length > 0 && (
        <div className="sticky top-[60px] z-40 border-y bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="container py-2">
            <Tabs
              value={activeDay}
              onValueChange={(v) => scrollToDay(Number(v))}
            >
              <TabsList className="w-full justify-start gap-1 overflow-x-auto">
                {days.map((d) => (
                  <TabsTrigger key={d.index} value={String(d.index)}>
                    {d.no}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
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
                  return <BlockRenderer key={bi} block={block} dayIndex={di} />;
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
