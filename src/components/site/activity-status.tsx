"use client";

import { useSyncExternalStore } from "react";

import { activityStatus } from "@/features/activities/schemas";
import { cn } from "@/lib/utils";

const LABELS = { upcoming: "Upcoming", ongoing: "Happening now", ended: "Past" } as const;

const noop = () => () => {};

/**
 * Upcoming / happening now / past — worked out in the visitor's browser, so
 * cached pages never show a stale status.
 */
export function ActivityStatus({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string | null;
}) {
  // Today's date only exists on the client; render nothing on the server.
  const today = useSyncExternalStore(
    noop,
    () => new Date().toISOString().slice(0, 10),
    () => null,
  );
  if (!today) return null;
  const status = activityStatus({ startDate, endDate }, today);
  if (status === "ended") return null;
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium",
        status === "ongoing" ? "bg-success/15 text-success" : "bg-warning/20 text-foreground",
      )}
    >
      {LABELS[status]}
    </span>
  );
}
