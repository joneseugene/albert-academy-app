"use client";

import { useEffect, useState } from "react";

import { formatDateTime, formatRelative } from "@/lib/format";

type RelativeTimeProps = {
  value: Date | string | null | undefined;
  /** Shown when there is no value. */
  fallback?: string;
  className?: string;
};

/**
 * Friendly date ("2 mins ago", "yesterday") that keeps itself fresh.
 * Hover shows the exact date and time.
 */
export function RelativeTime({ value, fallback = "", className }: RelativeTimeProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!value) return <>{fallback}</>;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return <>{fallback}</>;

  return (
    // Server and browser clocks/time zones can differ; the client value wins.
    <time
      dateTime={date.toISOString()}
      title={formatDateTime(date)}
      className={className}
      suppressHydrationWarning
    >
      {formatRelative(date, now)}
    </time>
  );
}
