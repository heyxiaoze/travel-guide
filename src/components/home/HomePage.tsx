import { useRef } from "react";
import { Link } from "react-router-dom";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { ShiningButton } from "@/components/ui/shining-button";
import { GUIDE_ORDER, TRAVEL_GUIDES } from "@/data/registry";
import { useCountUp } from "@/hooks/useCountUp";
import { GuideCard } from "@/components/guide/GuideCard";
import { HeroTextHover, type HeroHoverEmoji } from "@/animata/hero/hero-section-text-hover";
import { BlurryBlob } from "@/animata/background/blurry-blob";

const makeEmojis: HeroHoverEmoji[] = [
  { emoji: "✈️", position: "-left-5 -top-6 md:-left-8 md:-top-9 group-hover/hero:-rotate-12 group-hover/hero:-translate-y-3" },
  { emoji: "🗺️", position: "-right-5 -top-5 md:-right-8 md:-top-8 group-hover/hero:rotate-12 group-hover/hero:-translate-y-3" },
  { emoji: "🚗", position: "-left-4 top-3 md:-left-9 md:top-5 group-hover/hero:-rotate-12 group-hover/hero:translate-x-3" },
  { emoji: "🏕️", position: "-right-4 top-3 md:-right-8 md:top-5 group-hover/hero:rotate-12 group-hover/hero:translate-x-3" },
];

const planEmojis: HeroHoverEmoji[] = [
  { emoji: "📋", position: "-left-5 -top-6 md:-left-8 md:-top-9 group-hover/hero:-rotate-12 group-hover/hero:-translate-y-3" },
  { emoji: "🧭", position: "-right-5 -top-5 md:-right-8 md:-top-8 group-hover/hero:rotate-12 group-hover/hero:-translate-y-3" },
  { emoji: "📍", position: "-left-4 top-3 md:-left-9 md:top-5 group-hover/hero:-rotate-12 group-hover/hero:translate-x-3" },
  { emoji: "🗓️", position: "-right-4 top-3 md:-right-8 md:top-5 group-hover/hero:rotate-12 group-hover/hero:translate-x-3" },
];

function MetaItem({
  k,
  value,
  suffix,
}: {
  k: string;
  value: number;
  suffix?: string;
}) {
  const n = useCountUp(value);
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="flex items-baseline text-4xl font-bold tracking-tight text-foreground tabular-nums">
        {n.toLocaleString()}
        {suffix && (
          <span className="ml-1 text-lg font-medium text-muted-foreground">
            {suffix}
          </span>
        )}
      </span>
      <span className="text-xs font-medium text-muted-foreground">{k}</span>
    </div>
  );
}

export function HomePage() {
  const guides = GUIDE_ORDER.map((id) => TRAVEL_GUIDES[id]).filter(Boolean);
  const gridRef = useRef<HTMLDivElement>(null);

  const LAST_TRIP_DATE = new Date(2026, 4, 5); // 2026-05-05
  const daysSinceLastTrip = Math.max(
    0,
    Math.floor((Date.now() - LAST_TRIP_DATE.getTime()) / 86400000)
  );

  const scrollToGuides = () =>
    gridRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <div className="home-viewport">
        <section className="bg-dot-pattern relative overflow-hidden pt-12 pb-8 sm:pt-16 sm:pb-10">
          <BlurryBlob className="z-0" />
          <div className="container relative z-10">
            <div className="text-center">
              <span className="text-sm font-semibold text-primary">
                旅行日志 · Travel Journal
              </span>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                我在
                <HeroTextHover emojis={makeEmojis} hoverClass="group-hover/hero:text-primary">
                  做一些，
                </HeroTextHover>
                <br />
                让每次出行都
                <HeroTextHover emojis={planEmojis} className="text-primary">
                  有规划
                </HeroTextHover>
                的东西
              </h1>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                你好，我是小泽（慢慢），一个东北版 ISTJ 的蓝老头，我的攻略都是简单粗暴很丐很丐的版本，留足
                buffer 让路上一切变化，随时有 planB 兜底
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <ShiningButton onClick={scrollToGuides}>浏览全部攻略</ShiningButton>
                {guides.length > 0 && (
                  <ShiningButton to={`/guide/${guides[0].id}`} variant="outline">
                    最新一篇
                  </ShiningButton>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="home-stats-float">
          <div className="container">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="max-w-sm">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Journeys in Numbers
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
                <MetaItem k="攻略" value={guides.length} suffix="篇" />
                <MetaItem k="已去城市" value={95} suffix="个" />
                <MetaItem k="已自驾行驶" value={20000} suffix="km+" />
                <MetaItem k="距上次出去玩已过去" value={daysSinceLastTrip} suffix="天" />
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="py-12">
        <div className="container">
          <div className="mb-6 flex items-baseline gap-3">
            <h2 className="text-xl font-bold tracking-tight">全部攻略</h2>
            <span className="text-sm text-muted-foreground">
              {guides.length} 篇
            </span>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="ml-auto self-center"
            >
              <Link to="/discover">全部</Link>
            </Button>
          </div>
          {guides.length > 0 ? (
            <div
              id="guides"
              ref={gridRef}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {guides.map((g) => (
                <GuideCard key={g.id} guide={g} />
              ))}
            </div>
          ) : (
            <Empty>
              <EmptyTitle>还没有攻略</EmptyTitle>
              <EmptyDescription>
                把数据文件放进 data/ 并在入口引入即可。
              </EmptyDescription>
            </Empty>
          )}
        </div>
      </section>
    </>
  );
}
