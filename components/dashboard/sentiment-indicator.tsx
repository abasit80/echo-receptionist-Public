import { Badge } from "@/components/ui/badge";
import type { Sentiment } from "@/lib/types";

const map: Record<
  Sentiment,
  { label: string; variant: "success" | "muted" | "danger" | "warning"; hint: string }
> = {
  positive: { label: "Happy", variant: "success", hint: "Caller was satisfied" },
  neutral: { label: "Neutral", variant: "muted", hint: "Informational tone" },
  negative: { label: "Annoyed", variant: "danger", hint: "Frustration detected" },
  urgent: { label: "Urgent", variant: "warning", hint: "Needs immediate action" },
};

export function SentimentIndicator({
  sentiment,
}: {
  sentiment: Sentiment | null;
}) {
  if (!sentiment) {
    return <Badge variant="muted">No signal</Badge>;
  }

  const item = map[sentiment];
  return (
    <div className="flex flex-col gap-1">
      <Badge variant={item.variant}>{item.label}</Badge>
      <span className="hidden text-[11px] text-muted-foreground xl:block">
        {item.hint}
      </span>
    </div>
  );
}
