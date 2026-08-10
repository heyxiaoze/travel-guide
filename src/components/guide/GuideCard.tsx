import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RichText } from "@/components/RichText";
import { RemoteImage } from "@/components/ui/remote-image";
import { guideCover } from "@/lib/guide-images";
import { countDays, countPlaces } from "@/lib/guide-stats";
import type { Guide } from "@/types/guide";

export function GuideCard({ guide }: { guide: Guide }) {
  const days = countDays(guide);
  const places = countPlaces(guide);
  const cover = guideCover(guide.id);
  return (
    <Link to={`/guide/${guide.id}`} className="group block">
      <Card className="flex h-full flex-col overflow-hidden border bg-card transition-colors hover:border-border/80">
        <div className="relative h-32 overflow-hidden">
          {cover && (
            <RemoteImage
              src={cover}
              alt={guide.title}
              className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div
            className="absolute inset-0"
            style={{ background: guide.color, opacity: 0.55 }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <RichText
              value={guide.emoji ?? "{{icon:compass}}"}
              iconClassName="size-9 text-white drop-shadow"
            />
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span>{days} 天</span>
            <span className="size-1 rounded-full bg-border" />
            <span>{places} 地点</span>
          </div>
          <h3 className="text-lg font-bold tracking-tight">{guide.title}</h3>
          {guide.subtitle && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {guide.subtitle}
            </p>
          )}
          {guide.meta && guide.meta.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {guide.meta.slice(0, 3).map((m, i) => (
                <Badge key={i} variant="outline" className="font-normal">
                  {m}
                </Badge>
              ))}
            </div>
          )}
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
            查看攻略
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
