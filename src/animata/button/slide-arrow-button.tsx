import { ArrowRight } from "lucide-react";
import type React from "react";

interface SlideArrowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

/**
 * Slide-arrow CTA: a pill button where a filled circle (showing a right-arrow)
 * sits on the left by default and expands to fill the whole pill on hover,
 * while the label slides slightly left. Colors are theme-aware so it reads
 * well on both the light hero and the dark theme.
 *
 * Adapted from https://animata.design/docs/button/slide-arrow-button
 */
export default function SlideArrowButton({
  text = "Get Started",
  className = "",
  ...props
}: SlideArrowButtonProps) {
  return (
    <button
      type="button"
      className={`group/slide relative inline-flex items-center overflow-hidden rounded-full bg-transparent p-2 text-base font-semibold text-foreground ${className}`}
      {...props}
    >
      <div className="absolute left-0 top-0 flex h-full w-11 items-center justify-end rounded-full bg-primary transition-all duration-200 ease-in-out group-hover/slide:w-full">
        <span className="mr-3 text-primary-foreground">
          <ArrowRight size={20} />
        </span>
      </div>
      <span className="relative left-4 z-10 whitespace-nowrap px-8 font-semibold transition-all duration-200 ease-in-out group-hover/slide:-left-3 group-hover/slide:text-white">
        {text}
      </span>
    </button>
  );
}
