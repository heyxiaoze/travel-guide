import { cn } from "@/lib/utils";

interface BlurryBlobProps extends React.HTMLAttributes<HTMLDivElement> {
  firstBlobColor?: string;
  secondBlobColor?: string;
  thirdBlobColor?: string;
}

/**
 * Animated blurry gradient blobs, adapted from animata's "blurry-blob".
 * Sits behind content (absolute / pointer-events-none) and adapts to dark mode
 * via mix-blend-screen so the glow reads on a dark background too.
 */
export function BlurryBlob({
  className,
  firstBlobColor = "bg-violet-400",
  secondBlobColor = "bg-fuchsia-400",
  thirdBlobColor = "bg-sky-300",
}: BlurryBlobProps) {
  const blob =
    "absolute h-72 w-72 rounded-full opacity-50 blur-3xl mix-blend-multiply filter dark:mix-blend-screen dark:opacity-60";
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      aria-hidden
    >
      <div className="relative mx-auto h-full max-w-5xl">
        <div
          className={cn(
            blob,
            "left-[8%] top-[10%] animate-pop-blob",
            firstBlobColor
          )}
        />
        <div
          className={cn(
            blob,
            "right-[10%] top-[2%] animate-pop-blob [animation-delay:2s]",
            secondBlobColor
          )}
        />
        <div
          className={cn(
            blob,
            "left-[33%] bottom-[2%] animate-pop-blob [animation-delay:4s]",
            thirdBlobColor
          )}
        />
      </div>
    </div>
  );
}
