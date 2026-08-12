import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy, MapPin } from "lucide-react";
import { copyToClipboard } from "@/lib/copy";
import { RichText } from "@/components/RichText";
import type { Place, PlaceBlock, PlacesBlock } from "@/types/guide";

export function PlaceChip({ place }: { place: Place }) {
  const [copied, setCopied] = useState(false);
  const copy = place.copy ?? place.name;
  const onClick = () => {
    copyToClipboard(copy).then(() => {
      setCopied(true);
      toast.success("已复制：" + copy);
      setTimeout(() => setCopied(false), 1600);
    });
  };
  return (
    <button
      type="button"
      onClick={onClick}
      title="点击复制地点"
      className="group inline-flex items-start gap-2 rounded-md border bg-card px-2.5 py-1.5 text-left text-sm shadow-xs transition-colors hover:border-primary hover:bg-accent"
    >
      <span className="flex flex-col items-start gap-1">
        <span className="flex items-center gap-1.5">
          <MapPin className="size-3.5 shrink-0 text-primary" />
          <span className="font-medium">{place.name}</span>
        </span>
        {place.sub && (
          <span className="pl-5 text-xs text-muted-foreground">
            <RichText value={place.sub} />
          </span>
        )}
      </span>
      <span className="ml-auto self-center">
        {copied ? (
          <Check className="size-3.5 shrink-0 text-success" />
        ) : (
          <Copy className="size-3.5 shrink-0 text-muted-foreground opacity-60 transition-opacity group-hover:opacity-100" />
        )}
      </span>
    </button>
  );
}

export function PlaceBlockView({ block }: { block: PlaceBlock }) {
  return (
    <div className="flex flex-wrap gap-2">
      <PlaceChip place={block} />
    </div>
  );
}

export function PlacesBlockView({ block }: { block: PlacesBlock }) {
  return (
    <div className="flex flex-wrap gap-2">
      {(block.items ?? []).map((p, i) => (
        <PlaceChip key={i} place={p} />
      ))}
    </div>
  );
}
