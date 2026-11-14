import { Badge } from "@/components/ui/badge";

type Tone = "success" | "warning" | "destructive" | "secondary" | "outline";

const TONES: Record<string, Tone> = {
  active: "success",
  blocked: "destructive",
  published: "success",
  draft: "secondary",
  hidden: "secondary",
  current: "success",
  past: "secondary",
  upcoming: "warning",
  ongoing: "success",
  ended: "secondary",
  live: "destructive",
  scheduled: "warning",
  new: "warning",
  read: "secondary",
  replied: "success",
};

/** Consistent colour for status values across the app. */
export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return (
    <Badge variant={TONES[status] ?? "outline"} className="capitalize">
      {label ?? status}
    </Badge>
  );
}
