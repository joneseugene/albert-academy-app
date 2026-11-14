import Link from "next/link";
import { ArrowRightIcon, CalendarClockIcon, PlayIcon, RadioIcon } from "lucide-react";

import { site } from "@/config/routes";
import type { Livestream } from "@/features/livestreams/schemas";
import { formatStreamTime, parseStreamUrl, streamThumbnail } from "@/lib/livestream";
import { cn } from "@/lib/utils";
import { PlatformMark } from "./live-player";
import { Container, Media } from "./primitives";

/** Red "LIVE" pill with a pulsing dot. */
export function LiveBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-white uppercase",
        className,
      )}
    >
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75 motion-reduce:animate-none" />
        <span className="relative inline-flex size-1.5 rounded-full bg-white" />
      </span>
      Live
    </span>
  );
}

/** "Live" / "Upcoming · Sat 20 Nov, 10:00" / "Replay" */
export function StreamWhen({ stream }: { stream: Livestream }) {
  if (stream.status === "live") return <LiveBadge />;
  const time = formatStreamTime(stream.startsAt);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      {stream.status === "scheduled" ? (
        <>
          <CalendarClockIcon className="size-3.5 text-primary" /> {time ?? "Coming soon"}
        </>
      ) : (
        <>
          <PlayIcon className="size-3.5" /> Replay{time ? ` · ${time}` : ""}
        </>
      )}
    </span>
  );
}

export function StreamCard({ stream }: { stream: Livestream }) {
  const thumb = streamThumbnail(parseStreamUrl(stream.sourceUrl), stream.photoUrl);
  return (
    <Link href={`${site.live}/${stream.id}`} className="group grid gap-3">
      <div className="relative overflow-hidden rounded-2xl border bg-muted">
        <Media
          src={thumb}
          alt=""
          className="aspect-video w-full transition-transform duration-500 group-hover:scale-[1.03]"
          fallback={<RadioIcon className="size-8 opacity-40" />}
        />
        <span className="absolute top-3 left-3 flex items-center gap-1.5">
          {stream.status === "live" && <LiveBadge />}
        </span>
        <span className="absolute right-3 bottom-3 inline-flex size-8 items-center justify-center rounded-full bg-background/90 backdrop-blur">
          <PlatformMark platform={stream.platform} />
        </span>
      </div>
      <div className="grid gap-1 px-1">
        {stream.status !== "live" && <StreamWhen stream={stream} />}
        <h3 className="font-semibold tracking-tight text-balance group-hover:text-primary">
          {stream.title}
        </h3>
      </div>
    </Link>
  );
}

/**
 * Home page strip announcing the next featured upcoming stream. (While a
 * stream is live, the floating player in the site layout takes over.)
 */
export function LiveBanner({ streams }: { streams: Livestream[] }) {
  if (streams.some((s) => s.status === "live")) return null;
  const stream = streams.find((s) => s.status === "scheduled" && s.isFeatured);
  if (!stream) return null;

  return (
    <div className="border-b bg-accent/60">
      <Container>
        <Link
          href={`${site.live}/${stream.id}`}
          className="group flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm"
        >
          <span className="inline-flex items-center gap-1.5 font-medium text-primary">
            <CalendarClockIcon className="size-4" /> Upcoming live
          </span>
          <span className="min-w-0 flex-1 truncate font-medium">{stream.title}</span>
          {stream.startsAt && (
            <span className="text-muted-foreground">{formatStreamTime(stream.startsAt)}</span>
          )}
          <span className="inline-flex items-center gap-1 font-medium">
            Details
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </Container>
    </div>
  );
}
