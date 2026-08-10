import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-8 border-t py-10 text-center text-sm text-muted-foreground">
      <div className="container flex flex-col gap-1.5">
        <div>
          用{" "}
          <Heart className="mx-1 inline size-3.5 text-rose-500 align-[-2px]" />
          {" "}写的很丐很丐的旅行攻略
        </div>
        <div className="font-mono text-xs text-muted-foreground/70">
          Content curated &amp; planned by xiaoze · No unauthorized reposting
        </div>
      </div>
    </footer>
  );
}
