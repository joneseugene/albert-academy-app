"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MicVocalIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  RotateCwIcon,
  Volume2Icon,
  VolumeXIcon,
} from "lucide-react";

import { LogoMark } from "@/components/brand/logo";
import { activeLine, formatClock, isSynced, lineTimes, parseLyrics } from "@/lib/lyrics";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  credits?: string | null;
  audioUrl?: string | null;
  lyrics?: string | null;
  /** Open with the lyrics panel showing. */
  defaultShowLyrics?: boolean;
  className?: string;
};

/** Pause auto-scrolling this long after the listener scrolls the lyrics themselves. */
const USER_SCROLL_GRACE_MS = 3000;

export function SongPlayer({
  title,
  credits,
  audioUrl,
  lyrics,
  defaultShowLyrics = false,
  className,
}: Props) {
  const audio = useRef<HTMLAudioElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const userScrolledAt = useRef(0);

  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [showLyrics, setShowLyrics] = useState(defaultShowLyrics);

  const lines = useMemo(() => parseLyrics(lyrics), [lyrics]);
  const synced = isSynced(lines);
  const times = useMemo(() => lineTimes(lines, duration), [lines, duration]);
  const current = audioUrl && (playing || time > 0) ? activeLine(times, time) : -1;
  const hasAudio = Boolean(audioUrl);

  // Smooth clock while playing (timeupdate only fires ~4×/s).
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const tick = () => {
      if (audio.current) setTime(audio.current.currentTime);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  // Keep the line being sung in the middle of the lyrics panel.
  useEffect(() => {
    if (!showLyrics || current < 0) return;
    if (Date.now() - userScrolledAt.current < USER_SCROLL_GRACE_MS) return;
    const box = panel.current;
    const el = lineRefs.current[current];
    if (!box || !el) return;
    box.scrollTo({
      top: el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2,
      behavior: "smooth",
    });
  }, [current, showLyrics]);

  const toggle = () => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) void a.play();
    else a.pause();
  };
  const seek = (to: number) => {
    const a = audio.current;
    if (!a) return;
    a.currentTime = Math.min(Math.max(0, to), duration || a.duration || 0);
    setTime(a.currentTime);
    userScrolledAt.current = 0; // follow the new position
  };

  const pct = duration ? (time / duration) * 100 : 0;

  return (
    <div className={cn("overflow-hidden rounded-3xl border bg-card", className)}>
      {hasAudio && (
        <audio
          ref={audio}
          src={audioUrl!}
          preload="metadata"
          muted={muted}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onDurationChange={(e) => setDuration(e.currentTarget.duration)}
          onTimeUpdate={(e) => !playing && setTime(e.currentTarget.currentTime)}
        />
      )}

      <div className="grid gap-6 p-5 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8 sm:p-8">
        {/* Artwork */}
        <div className="relative mx-auto flex aspect-square w-44 items-center justify-center overflow-hidden rounded-2xl border bg-linear-to-br from-accent via-background to-muted sm:w-48">
          <LogoMark
            className={cn("h-28 transition-transform duration-700", playing && "scale-105")}
            title=""
          />
          <div className="absolute right-3 bottom-3 flex h-5 items-end gap-0.5" aria-hidden>
            {[0, 0.2, 0.45, 0.1].map((delay, i) => (
              <span
                key={i}
                className={cn(
                  "w-1 origin-bottom rounded-full bg-primary",
                  playing ? "h-full animate-eq" : "h-1.5",
                )}
                style={{ animationDelay: `${delay}s` }}
              />
            ))}
          </div>
        </div>

        {/* Details + controls */}
        <div className="grid min-w-0 gap-5">
          <div className="grid gap-1 text-center sm:text-left">
            <p className="text-xs font-medium tracking-wider text-primary uppercase">
              {playing ? "Now playing" : "School song"}
            </p>
            <h3 className="font-serif text-2xl font-medium tracking-tight text-balance">{title}</h3>
            {credits && <p className="text-sm text-muted-foreground">{credits}</p>}
          </div>

          {/* Seek bar */}
          <div className="grid gap-1.5">
            <div className="group relative h-1.5 rounded-full bg-muted">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-primary"
                style={{ width: `${pct}%` }}
              />
              <div
                className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
                style={{ left: `${pct}%` }}
              />
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={time}
                disabled={!hasAudio}
                onChange={(e) => seek(Number(e.target.value))}
                aria-label="Seek"
                className="absolute inset-x-0 -inset-y-2 w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
              <span>{formatClock(time)}</span>
              <span>{duration ? formatClock(duration) : "--:--"}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              disabled={!hasAudio}
              className="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeXIcon className="size-5" /> : <Volume2Icon className="size-5" />}
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => seek(time - 10)}
                disabled={!hasAudio}
                className="inline-flex size-11 items-center justify-center rounded-full hover:bg-muted disabled:opacity-40"
                aria-label="Back 10 seconds"
              >
                <RotateCcwIcon className="size-5" />
              </button>
              <button
                type="button"
                onClick={toggle}
                disabled={!hasAudio}
                className="inline-flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? (
                  <PauseIcon className="size-7" fill="currentColor" />
                ) : (
                  <PlayIcon className="ml-1 size-7" fill="currentColor" />
                )}
              </button>
              <button
                type="button"
                onClick={() => seek(time + 10)}
                disabled={!hasAudio}
                className="inline-flex size-11 items-center justify-center rounded-full hover:bg-muted disabled:opacity-40"
                aria-label="Forward 10 seconds"
              >
                <RotateCwIcon className="size-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowLyrics((s) => !s)}
              disabled={!lines.length}
              aria-pressed={showLyrics}
              className={cn(
                "inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors disabled:opacity-40",
                showLyrics
                  ? "border-primary bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <MicVocalIcon className="size-4" />
              <span className="hidden sm:inline">Lyrics</span>
            </button>
          </div>

          {!hasAudio && (
            <p className="text-center text-sm text-muted-foreground sm:text-left">
              The recording is coming soon{lines.length ? ". The lyrics are below." : "."}
            </p>
          )}
        </div>
      </div>

      {/* Scrolling lyrics */}
      {showLyrics && lines.length > 0 && (
        <div className="relative border-t bg-muted/30">
          <div
            ref={panel}
            onWheel={() => (userScrolledAt.current = Date.now())}
            onTouchMove={() => (userScrolledAt.current = Date.now())}
            className="max-h-88 overflow-y-auto scroll-smooth mask-[linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)] px-5 py-24 sm:px-10"
          >
            <ol className="mx-auto grid max-w-xl gap-1 text-center">
              {lines.map((line, i) => (
                <li key={i} className={cn(line.label && i > 0 && "mt-6")}>
                  {line.label && (
                    <p
                      className={cn(
                        "mb-1 text-[11px] font-medium tracking-[0.2em] uppercase",
                        line.section === "chorus" ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {line.label}
                    </p>
                  )}
                  <button
                    ref={(el) => {
                      lineRefs.current[i] = el;
                    }}
                    type="button"
                    disabled={!hasAudio}
                    onClick={() => {
                      seek(times[i]);
                      if (audio.current?.paused) void audio.current.play();
                    }}
                    className={cn(
                      "w-full rounded-lg px-2 py-1.5 text-lg leading-snug transition-all duration-300 sm:text-2xl",
                      line.section === "chorus" && "italic",
                      !hasAudio || current < 0
                        ? "text-foreground/80"
                        : i === current
                          ? "scale-[1.03] font-semibold text-foreground"
                          : i < current
                            ? "text-muted-foreground/60"
                            : "text-muted-foreground",
                      hasAudio && "hover:text-primary",
                    )}
                  >
                    {line.text}
                  </button>
                </li>
              ))}
            </ol>
          </div>
          {hasAudio && !synced && (
            <p className="border-t px-5 py-2 text-center text-[11px] text-muted-foreground">
              Lyric timing is approximate.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
