import { iconFor, dotColor } from "@/lib/icons";

const MARKER_RE = /(\{\{icon:[a-z0-9-]+\}\}|\{\{dot:[a-z]+\}\})/g;

/**
 * Renders rich-text strings from the migrated guide data. The original markup
 * used inline `<i class="ph ...">` icons and `<b>`/`<br>` tags; icons were
 * converted to `{{icon:name}}` / `{{dot:color}}` markers during migration.
 * Markers become React icon elements; remaining HTML is passed through.
 */
export function RichText({
  value,
  className,
  iconClassName,
}: {
  value: string;
  className?: string;
  iconClassName?: string;
}) {
  if (!value) return null;
  const parts = value.split(MARKER_RE);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (!part) return null;
        const iconMatch = part.match(/^\{\{icon:([a-z0-9-]+)\}\}$/);
        if (iconMatch) {
          const Icon = iconFor(iconMatch[1]);
          return (
            <Icon
              key={i}
              className={iconClassName ?? "inline-block size-4 align-[-2px]"}
            />
          );
        }
        const dotMatch = part.match(/^\{\{dot:([a-z]+)\}\}$/);
        if (dotMatch) {
          return (
            <span
              key={i}
              className="mr-1 inline-block size-2 rounded-full align-middle"
              style={{ background: dotColor(dotMatch[1]) }}
            />
          );
        }
        return (
          <span key={i} dangerouslySetInnerHTML={{ __html: part }} />
        );
      })}
    </span>
  );
}
