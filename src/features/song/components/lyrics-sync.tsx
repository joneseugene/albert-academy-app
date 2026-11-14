"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, EraserIcon, HandIcon, PlayIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatStamp, type LyricLine } from "@/lib/lyrics";
import { cn } from "@/lib/utils";

/**
 * Tap-to-sync: play the recording and press "Tap" (or Space) as each line
 * begins. Each tap stamps the current time on the next sung line (repeated
 * choruses are tapped each time they are sung).
 */
export function LyricsSync({
  lines,
  times: saved,
  onChange,
  audioRef,
}: {
  lines: LyricLine[];
  times: Array<number | null>;
  onChange: (next: Array<number | null>) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}) {
  const [syncing, setSyncing] = useState(false);
  const [times, setTimes] = useState<number[]>([]);
  const listRef = useRef<HTMLOListElement>(null);
  const next = times.length;

  const start = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setTimes([]);
    setSyncing(true);
    audio.currentTime = 0;
    void audio.play();
  };

  const stop = (save: boolean) => {
    audioRef.current?.pause();
    // Lines not reached keep no stamp (the player then estimates all lines).
    if (save && times.length) onChange(lines.map((_, i) => times[i] ?? null));
    setSyncing(false);
    setTimes([]);
  };

  const tap = () => {
    const audio = audioRef.current;
    if (!audio || next >= lines.length) return;
    setTimes((t) => [...t, audio.currentTime]);
  };

  // Space bar taps while syncing.
  useEffect(() => {
    if (!syncing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        tap();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Keep the next line to tap in view.
  useEffect(() => {
    if (!syncing) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-line="${next}"]`);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [next, syncing]);

  const hasStamps = saved.some((t) => t !== null);
  const matches = saved.length === lines.length;

  if (!syncing) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={!lines.length} onClick={start}>
          <PlayIcon /> {hasStamps ? "Sync again" : "Sync lyrics to the recording"}
        </Button>
        {hasStamps && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange([])}>
            <EraserIcon /> Clear timings
          </Button>
        )}
        <p
          className={cn(
            "w-full text-xs",
            hasStamps && !matches ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {!hasStamps
            ? "Without timings the website still scrolls the lyrics, estimating each line's timing."
            : matches
              ? "Lyrics are synced: the website scrolls them exactly with the song."
              : "Lines were added or removed since the last sync, so those timings won't be saved. Sync again."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 rounded-lg border border-primary/30 bg-accent/40 p-4">
      <p className="text-sm">
        Press <span className="font-semibold">Tap</span> (or the space bar) the moment each line
        starts.
      </p>
      <ol ref={listRef} className="grid max-h-72 gap-1 overflow-y-auto text-sm">
        {lines.map((l, i) => (
          <li key={i} className="grid gap-1">
            {l.label && (
              <span
                className={cn(
                  "px-2 pt-2 text-[11px] font-medium tracking-wider uppercase",
                  l.section === "chorus" ? "text-primary" : "text-muted-foreground",
                )}
              >
                {l.label}
              </span>
            )}
            <span
              data-line={i}
              className={cn(
                "flex gap-3 rounded px-2 py-1",
                i === next && "bg-primary text-primary-foreground",
                i < next && "text-muted-foreground",
              )}
            >
              <span className="w-20 shrink-0 font-mono text-xs leading-5 tabular-nums">
                {times[i] !== undefined ? formatStamp(times[i]) : ""}
              </span>
              <span className={cn(l.section === "chorus" && "italic")}>{l.text}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={tap} disabled={next >= lines.length}>
          <HandIcon /> Tap ({Math.min(next + 1, lines.length)}/{lines.length})
        </Button>
        <Button type="button" variant="outline" onClick={() => stop(true)} disabled={!next}>
          <CheckIcon /> Done
        </Button>
        <Button type="button" variant="ghost" onClick={() => stop(false)}>
          <XIcon /> Cancel
        </Button>
      </div>
    </div>
  );
}
