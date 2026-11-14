"use client";

import { useMemo, useSyncExternalStore } from "react";

import { chatUrl, embedUrl, parseStreamUrl, type PlayerOptions } from "@/lib/livestream";
import { cn } from "@/lib/utils";

const noop = () => () => {};

/**
 * Embedded YouTube / Facebook player built from a plain link + the admin's
 * options, with YouTube live chat beside it when enabled.
 */
export function LivePlayer({
  sourceUrl,
  options,
  title,
  className,
}: {
  sourceUrl: string;
  options: PlayerOptions;
  title: string;
  className?: string;
}) {
  const stream = useMemo(() => parseStreamUrl(sourceUrl), [sourceUrl]);
  const src = embedUrl(stream, options);
  // The chat embed must name the site's host, which only the browser knows.
  const host = useSyncExternalStore(
    noop,
    () => window.location.hostname,
    () => null,
  );
  const chat = options.showChat && host ? chatUrl(stream, host) : null;

  if (!src) {
    return (
      <div
        className={cn(
          "flex aspect-video items-center justify-center rounded-2xl border border-dashed bg-muted p-6 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        {stream.ok ? "This stream can't be played." : stream.error}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-3", chat && "lg:grid-cols-[1fr_22rem]", className)}>
      <div className="relative aspect-video overflow-hidden rounded-2xl border bg-black">
        <iframe
          // Re-mount when settings change so the preview updates at once.
          key={src}
          src={src}
          title={title}
          className="absolute inset-0 size-full"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          loading="lazy"
        />
      </div>
      {chat && (
        <div className="h-96 overflow-hidden rounded-2xl border bg-background lg:h-auto">
          <iframe src={chat} title={`${title}: live chat`} className="size-full" loading="lazy" />
        </div>
      )}
    </div>
  );
}

/** Small YouTube / Facebook marks (lucide has no brand icons). */
export function PlatformMark({
  platform,
  className,
}: {
  platform: "youtube" | "facebook";
  className?: string;
}) {
  return platform === "youtube" ? (
    <svg viewBox="0 0 24 24" aria-label="YouTube" role="img" className={cn("size-4", className)}>
      <rect x="1" y="4.5" width="22" height="15" rx="4.5" fill="#FF0000" />
      <path d="M10 8.8v6.4l5.6-3.2z" fill="#fff" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-label="Facebook" role="img" className={cn("size-4", className)}>
      <circle cx="12" cy="12" r="11" fill="#1877F2" />
      <path
        d="M13.4 19v-5.6h1.9l.3-2.2h-2.2V9.8c0-.6.2-1.1 1.1-1.1h1.2v-2c-.2 0-.9-.1-1.7-.1-1.7 0-2.9 1-2.9 3v1.7H9.2v2.2h1.9V19z"
        fill="#fff"
      />
    </svg>
  );
}
