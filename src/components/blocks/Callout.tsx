import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import { RichText } from "@/components/RichText";
import type { CalloutBlock } from "@/types/guide";

const TONE: Record<string, "info" | "warning" | "success" | "default"> = {
  info: "info",
  warn: "warning",
  tip: "success",
};

export function CalloutView({ block }: { block: CalloutBlock }) {
  const variant = TONE[block.tone ?? "info"] ?? "info";
  return (
    <Alert variant={variant} className="[&>svg]:size-4">
      {block.title && (
        <AlertTitle>
          <RichText value={block.title} />
        </AlertTitle>
      )}
      <AlertDescription>
        <RichText value={block.s} />
      </AlertDescription>
    </Alert>
  );
}
