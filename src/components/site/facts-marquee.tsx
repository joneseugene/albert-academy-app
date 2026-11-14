import { LightbulbIcon } from "lucide-react";

import type { Fact } from "@/features/facts/schemas";

/**
 * "Did you know?" facts drifting across the page (pauses on hover; still
 * for visitors who prefer reduced motion).
 */
export function FactsMarquee({ facts }: { facts: Fact[] }) {
  if (!facts.length) return null;
  // Repeat short lists so the strip is always wider than the screen.
  const base = facts.length < 6 ? [...facts, ...facts, ...facts].slice(0, 6) : facts;
  const items = [...base, ...base]; // two copies → seamless loop at -50%

  return (
    <div
      className="group relative overflow-hidden border-y bg-muted/40 mask-[linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] py-4"
      aria-label="Did you know?"
    >
      <ul className="flex w-max animate-marquee gap-3 group-hover:[animation-play-state:paused]">
        {items.map((f, i) => (
          <li
            key={`${f.id}-${i}`}
            aria-hidden={i >= base.length}
            className="flex max-w-md shrink-0 items-center gap-2.5 rounded-full border bg-background px-4 py-2 text-sm"
          >
            <LightbulbIcon className="size-4 shrink-0 text-primary" aria-hidden />
            <span className="font-medium text-primary">Did you know?</span>
            <span className="truncate text-muted-foreground">{f.fact}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** All facts as cards (used where there is room to read them in full). */
export function FactsGrid({ facts }: { facts: Fact[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {facts.map((f, i) => (
        <li key={f.id} className="grid content-start gap-3 rounded-3xl border bg-card p-6">
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary tabular-nums">
            {String(i + 1).padStart(2, "0")}
          </span>
          <p className="text-pretty">{f.fact}</p>
        </li>
      ))}
    </ul>
  );
}
