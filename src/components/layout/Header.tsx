import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { LoginModal } from "./LoginModal";
import { useAuth } from "@/lib/auth";
import RollText from "@/animata/text/roll-text";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const { isAdmin, logout } = useAuth();

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

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <>
              <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> 管理员
              </span>
              <button
                type="button"
                onClick={() => logout()}
                title="LOGOUT"
                className={navClass({ isActive: false })}
              >
                <RollText
                  groupHover
                  stagger="character"
                  staggerMs={28}
                  durationMs={320}
                  text="LOGOUT"
                  className="pointer-events-none"
                />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              title="LOGIN"
              className={navClass({ isActive: false })}
            >
              <RollText
                groupHover
                stagger="character"
                staggerMs={28}
                durationMs={320}
                text="LOGIN"
                className="pointer-events-none"
              />
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  );
}
