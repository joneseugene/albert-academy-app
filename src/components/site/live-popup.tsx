"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Maximize2Icon, PlayIcon, XIcon } from "lucide-react";

import { site } from "@/config/routes";
import type { PlayerOptions } from "@/lib/livestream";
import { LiveBadge } from "./live";
import { LivePlayer } from "./live-player";

export type LivePopupStream = {
  id: string;
  title: string;
  sourceUrl: string;
  options: PlayerOptions;
};

/*
 * While a stream is live, a player opens in the corner as soon as the site
 * loads (a bottom sheet on phones). Closing it leaves a small "LIVE" button
 * that reopens it. The choice lasts for this browser tab's visit.
 */

const EVENT = "aa-live-popup";
const key = (id: string) => `aa-live-closed:${id}`;

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readClosed(id: string) {
  try {
    return sessionStorage.getItem(key(id)) === "1";
  } catch {
    return false;
  }
}

function setClosed(id: string, closed: boolean) {
  try {
    if (closed) sessionStorage.setItem(key(id), "1");
    else sessionStorage.removeItem(key(id));
  } catch {
    // Storage blocked (private mode): the state still changes for this page.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function LivePopup({ stream }: { stream: LivePopupStream }) {
  const pathname = usePathname();
  // Server render: closed (just the button); the browser then opens it if wanted.
  const closed = useSyncExternalStore(
    subscribe,
    () => readClosed(stream.id),
    () => true,
  );

  // The /live pages already show the full player.
  if (pathname?.startsWith(site.live)) return null;

  if (closed) {
    return (
      <button
        type="button"
        onClick={() => setClosed(stream.id, false)}
        className="fixed right-4 bottom-4 z-50 inline-flex h-11 max-w-[calc(100vw-2rem)] items-center gap-2.5 rounded-full bg-red-600 pr-4 pl-2 text-sm font-medium text-white transition-transform hover:scale-[1.03] active:scale-95"
        aria-label={`Watch live: ${stream.title}`}
      >
        <LiveBadge className="bg-white/20" />
        <span className="max-w-56 truncate">{stream.title}</span>
        <PlayIcon className="size-4 shrink-0" fill="currentColor" />
      </button>
    );
  }

  return (
    <section
      aria-label="Live stream"
      className="fixed inset-x-0 bottom-0 z-50 overflow-hidden rounded-t-2xl border border-foreground/10 bg-background sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-[26rem] sm:rounded-2xl"
    >
      <header className="flex items-center gap-2 border-b px-3 py-2">
        <LiveBadge />
        <p className="min-w-0 flex-1 truncate text-sm font-medium">{stream.title}</p>
        <Link
          href={`${site.live}/${stream.id}`}
          className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Open the full stream page"
          title="Open the full stream page"
        >
          <Maximize2Icon className="size-4" />
        </Link>
        <button
          type="button"
          onClick={() => setClosed(stream.id, true)}
          className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close the player"
          title="Close (reopen from the LIVE button)"
        >
          <XIcon className="size-4" />
        </button>
      </header>
      <LivePlayer
        sourceUrl={stream.sourceUrl}
        title={stream.title}
        options={{ ...stream.options, showChat: false }}
        className="[&>div]:rounded-none [&>div]:border-0"
      />
    </section>
  );
}
