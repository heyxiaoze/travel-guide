import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { RemoteImage } from "./remote-image";

interface ImageBannerProps {
  images: string[];
  alt?: string;
  className?: string;
  /** Tailwind height utility, e.g. "h-56". */
  heightClass?: string;
  /** Corner radius utility, e.g. "rounded-xl". */
  rounded?: string;
  autoPlay?: boolean;
  /** Autoplay interval in ms (only used when autoPlay + >1 image). */
  interval?: number;
}

/**
 * Swipeable image banner (carousel).
 * - Slides via a translateX track (CSS transition).
 * - Prev/next arrow buttons + dot indicators.
 * - Touch swipe (drag) on mobile.
 * - Left/Right arrow keys when focused.
 * - Optional autoplay.
 * For a single image it just renders that image (no controls).
 */
export function ImageBanner({
  images,
  alt = "",
  className,
  heightClass = "h-56",
  rounded = "rounded-xl",
  autoPlay = false,
  interval = 5000,
}: ImageBannerProps) {
  const count = images.length;
  const [index, setIndex] = useState(0);
  const [touchX, setTouchX] = useState<number | null>(null);
  const timer = useRef<number | null>(null);

  const go = useCallback(
    (i: number) => setIndex(((i % count) + count) % count),
    [count]
  );
  const prev = useCallback(() => go(index - 1), [go, index]);
  const next = useCallback(() => go(index + 1), [go, index]);

  useEffect(() => {
    if (!autoPlay || count <= 1) return;
    timer.current = window.setInterval(() => go(index + 1), interval);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [autoPlay, count, interval, index, go]);

  if (count === 0) return null;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        rounded,
        heightClass,
        className
      )}
      role="region"
      aria-roledescription="carousel"
      aria-label={alt || "图片轮播"}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
      }}
    >
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
        onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX == null) return;
          const dx = e.changedTouches[0].clientX - touchX;
          if (dx > 40) prev();
          else if (dx < -40) next();
          setTouchX(null);
        }}
      >
        {images.map((src, i) => (
          <div className="relative h-full w-full shrink-0" key={i}>
            <RemoteImage src={src} alt={`${alt} ${i + 1}`} className="h-full w-full" />
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="上一张"
            className="absolute left-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-background/70 text-foreground shadow-sm backdrop-blur transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="下一张"
            className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-background/70 text-foreground shadow-sm backdrop-blur transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`第 ${i + 1} 张`}
                className={cn(
                  "size-2 rounded-full transition-colors",
                  i === index
                    ? "bg-white"
                    : "bg-white/50 hover:bg-white/80"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
