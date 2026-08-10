import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ShiningButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  to?: string;
  className?: string;
  variant?: "primary" | "outline";
};

export function ShiningButton({
  children,
  onClick,
  to,
  className,
  variant = "primary",
}: ShiningButtonProps) {
  const isOutline = variant === "outline";

  const inner = (
    <div
      className={cn(
        "relative flex items-center justify-center gap-2 overflow-hidden rounded-lg px-6 py-3.5 text-sm font-bold transition-colors duration-500 sm:text-base",
        isOutline
          ? "border border-primary bg-transparent text-primary"
          : "bg-primary text-primary-foreground"
      )}
    >
      <span>{children}</span>
      <ArrowRight className="transition-all duration-700 ease-in-out group-hover/shine:translate-x-2 group-hover/shine:scale-125" />
      <div
        className={cn(
          "pointer-events-none absolute -left-16 top-0 h-full w-12 rotate-[30deg] scale-y-150 bg-white/20 transition-all duration-700 ease-in-out group-hover/shine:left-[calc(100%+1rem)]",
          isOutline && "bg-primary/30"
        )}
      />
    </div>
  );

  const wrap = cn(
    "group/shine inline-flex cursor-pointer rounded-xl border-2 border-primary/0 p-1 transition-colors duration-500 hover:border-primary/60",
    className
  );

  if (to) {
    return (
      <Link to={to} className={wrap}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={wrap}>
      {inner}
    </button>
  );
}
