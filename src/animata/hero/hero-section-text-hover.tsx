import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface HeroHoverEmoji {
  emoji: string;
  /** Tailwind classes for static placement + group-hover float/rotate. */
  position: string;
}

export function HeroTextHover({
  children,
  emojis,
  className,
  hoverClass,
}: {
  children: ReactNode;
  emojis: HeroHoverEmoji[];
  /** Base text styles (e.g. a constant `text-primary`). */
  className?: string;
  /** Hover color shift applied via `group-hover/hero:` (e.g. `text-primary`). */
  hoverClass?: string;
}) {
  return (
    <span className="group/hero relative inline-flex items-center">
      <span className={cn("transition-colors duration-300", className, hoverClass)}>
        {children}
      </span>
      <span className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover/hero:opacity-100">
        {emojis.map((e, i) => (
          <span
            key={i}
            className={cn(
              "absolute text-xl transition-transform duration-300 [transition-timing-function:cubic-bezier(0.5,1.8,0.4,1)] group-hover/hero:scale-110 md:text-3xl",
              e.position
            )}
          >
            {e.emoji}
          </span>
        ))}
      </span>
    </span>
  );
}
