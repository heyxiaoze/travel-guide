import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * <img> wrapper for hotlinked (free-host) images with a graceful fallback:
 * if the remote image fails to load, we render a neutral muted block instead
 * of a broken-image icon, so the layout never breaks.
 */
export function RemoteImage({
  src,
  alt = "",
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div className={cn("bg-muted", className)} aria-hidden />;
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}
