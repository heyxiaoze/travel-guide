import { Card } from "@/components/ui/card";
import { RichText } from "@/components/RichText";
import type { GalleryBlock, GalleryItem } from "@/types/guide";

function GalleryCard({ item }: { item: GalleryItem }) {
  const label = item.title ?? item.label;
  if (item.src) {
    return (
      <Card className="overflow-hidden">
        <div className="aspect-[4/3] w-full bg-muted">
          <img
            src={item.src}
            alt={label ?? ""}
            className="size-full object-cover"
            loading="lazy"
          />
        </div>
        {label && (
          <div className="px-3 py-2 text-sm font-medium">
            <RichText value={label} />
          </div>
        )}
      </Card>
    );
  }
  return (
    <Card className="overflow-hidden">
      <div
        className="flex aspect-[4/3] items-center justify-center p-3"
        style={{
          background:
            item.gradient ?? "linear-gradient(135deg,#cbd5e1 0%,#94a3b8 100%)",
        }}
      >
        {label && (
          <span className="text-center text-sm font-semibold text-white drop-shadow">
            <RichText value={label} />
          </span>
        )}
      </div>
    </Card>
  );
}

export function GalleryView({ block }: { block: GalleryBlock }) {
  return (
    <div className="flex flex-col gap-3">
      {block.caption && (
        <p className="text-sm text-muted-foreground">
          <RichText value={block.caption} />
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(block.items ?? []).map((it, i) => (
          <GalleryCard key={i} item={it} />
        ))}
      </div>
    </div>
  );
}
