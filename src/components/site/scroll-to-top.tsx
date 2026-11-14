"use client";

import { useSyncExternalStore } from "react";
import { ArrowUpIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Show the button after this much scrolling (px). */
const SHOW_AFTER = 600;
const RADIUS = 21;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  window.addEventListener("resize", onChange);
  return () => {
    window.removeEventListener("scroll", onChange);
    window.removeEventListener("resize", onChange);
  };
}

/** Scroll progress in 1% steps (keeps re-renders rare). */
function progress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (window.scrollY < SHOW_AFTER || max <= 0) return -1;
  return Math.round((window.scrollY / max) * 100);
}

/**
 * "Back to top": fades in after scrolling, with a ring that fills as you read
 * down the page. `raised` lifts it above the live-stream button.
 */
export function ScrollToTop({ raised = false }: { raised?: boolean }) {
  const pct = useSyncExternalStore(subscribe, progress, () => -1);
  const visible = pct >= 0;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      className={cn(
        "fixed right-4 z-40 flex size-12 items-center justify-center rounded-full border bg-background/90 text-foreground backdrop-blur transition-all duration-500 hover:text-primary",
        raised ? "bottom-18" : "bottom-4",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <svg viewBox="0 0 48 48" className="absolute inset-0 size-full -rotate-90" aria-hidden>
        <circle
          cx="24"
          cy="24"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary transition-[stroke-dashoffset] duration-200"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - Math.max(pct, 0) / 100)}
          strokeLinecap="round"
        />
      </svg>
      <ArrowUpIcon className="size-4" />
    </button>
  );
}
