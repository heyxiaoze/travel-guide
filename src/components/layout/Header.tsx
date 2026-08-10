import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { LogIn, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                title="退出管理员"
              >
                <LogOut className="h-4 w-4" /> 退出
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLoginOpen(true)}
              title="管理员登录"
            >
              <LogIn className="h-4 w-4" /> 登录
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  );
}
