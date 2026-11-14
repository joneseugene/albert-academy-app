import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { LiveBadge, StreamCard } from "@/components/site/live";
import { LivePlayer } from "@/components/site/live-player";
import { EmptyState, PageHero, Prose, Section, SectionHeading } from "@/components/site/primitives";
import { site } from "@/config/routes";
import { getLivestreams } from "@/features/site/server/queries";

export const metadata: Metadata = {
  title: "Live",
  description: "Watch Albert Academy events live, see what's coming up and catch up on replays.",
};

export default async function LivePage() {
  const streams = await getLivestreams();
  const live = streams.filter((s) => s.status === "live");
  const upcoming = streams.filter((s) => s.status === "scheduled");
  const replays = streams.filter((s) => s.status === "ended");
  const [now, ...otherLive] = live;

  return (
    <>
      <PageHero
        eyebrow="Live"
        title="Watch live"
        description="School events streamed as they happen, with replays when you miss them."
      />

      {streams.length === 0 && (
        <Section>
          <EmptyState>Nothing is streaming right now. Check back for upcoming events.</EmptyState>
        </Section>
      )}

      {now && (
        <Section className="pb-8 sm:pb-12">
          <div className="grid gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="grid gap-2">
                <LiveBadge className="w-fit" />
                <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                  {now.title}
                </h2>
              </div>
              <Link
                href={`${site.live}/${now.id}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Open stream page <ArrowRightIcon className="size-4" />
              </Link>
            </div>
            <LivePlayer sourceUrl={now.sourceUrl} title={now.title} options={now} />
            {now.description && (
              <Prose
                html={now.description}
                className="max-w-3xl text-muted-foreground sm:text-base"
              />
            )}
          </div>
        </Section>
      )}

      {otherLive.length > 0 && (
        <Section className="pt-0 sm:pt-0">
          <SectionHeading title="Also live" />
          <Grid streams={otherLive} />
        </Section>
      )}

      {upcoming.length > 0 && (
        <Section muted>
          <SectionHeading title="Coming up" description="Times are in school time (GMT)." />
          <Grid streams={upcoming} />
        </Section>
      )}

      {replays.length > 0 && (
        <Section>
          <SectionHeading title="Replays" />
          <Grid streams={replays} />
        </Section>
      )}
    </>
  );
}

function Grid({ streams }: { streams: Awaited<ReturnType<typeof getLivestreams>> }) {
  return (
    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {streams.map((s) => (
        <StreamCard key={s.id} stream={s} />
      ))}
    </div>
  );
}
