import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { toggle, isDark } = useTheme();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={isDark ? "切换到亮色模式" : "切换到暗色模式"}
      title={isDark ? "切换到亮色模式" : "切换到暗色模式"}
      onClick={toggle}
      className={cn(
        "relative size-9 rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        className
      )}
    >
      <Sun
        className={cn(
          "absolute size-[18px] rotate-0 scale-100 transition-transform duration-200",
          isDark && "-rotate-90 scale-0"
        )}
      />
      <Moon
        className={cn(
          "absolute size-[18px] rotate-90 scale-0 transition-transform duration-200",
          isDark && "rotate-0 scale-100"
        )}
      />
    </Button>
  );
}
