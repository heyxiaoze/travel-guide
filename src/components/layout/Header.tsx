import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import RollText from "@/animata/text/roll-text";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "group/roll rounded-md px-3 py-2 text-sm font-medium transition-colors",
      isActive
        ? "text-foreground"
        : "text-muted-foreground hover:text-foreground"
    );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur",
        scrolled && "shadow-sm"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <nav className="flex items-center gap-1">
          <NavLink to="/" className={navClass} end>
            <RollText
              groupHover
              stagger="character"
              staggerMs={28}
              durationMs={320}
              text="Home"
              className="pointer-events-none"
            />
          </NavLink>
          <NavLink to="/discover" className={navClass}>
            <RollText
              groupHover
              stagger="character"
              staggerMs={28}
              durationMs={320}
              text="Discover Guides"
              className="pointer-events-none"
            />
          </NavLink>
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}
