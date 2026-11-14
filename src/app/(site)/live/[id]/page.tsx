import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DetailHeader, DetailSkeleton } from "@/components/site/detail";
import { StreamCard, StreamWhen } from "@/components/site/live";
import { LivePlayer, PlatformMark } from "@/components/site/live-player";
import { Container, Prose, Section, SectionHeading } from "@/components/site/primitives";
import { site } from "@/config/routes";
import { getLivestream, getLivestreams } from "@/features/site/server/queries";
import { formatStreamTime, STREAM_PLATFORMS } from "@/lib/livestream";
import { excerpt } from "@/lib/rich-text";

export async function generateMetadata({ params }: PageProps<"/live/[id]">): Promise<Metadata> {
  const item = await getLivestream((await params).id);
  if (!item) notFound();
  return { title: item.title, description: excerpt(item.description, 300) ?? undefined };
}

export default function LiveStreamPage({ params }: PageProps<"/live/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Stream params={params} />
    </Suspense>
  );
}

async function Stream({ params }: Pick<PageProps<"/live/[id]">, "params">) {
  const { id } = await params;
  const [item, all] = await Promise.all([getLivestream(id), getLivestreams()]);
  if (!item) notFound();
  const others = all.filter((s) => s.id !== item.id && s.status !== "ended").slice(0, 3);

  return (
    <>
      <article className="pb-16">
        <DetailHeader
          back={{ href: site.live, label: "All live streams" }}
          meta={
            <>
              <StreamWhen stream={item} />
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <PlatformMark platform={item.platform} /> {STREAM_PLATFORMS[item.platform]}
              </span>
            </>
          }
          title={item.title}
        />
        <Container className="mt-8 max-w-6xl">
          <LivePlayer sourceUrl={item.sourceUrl} title={item.title} options={item} />
          {item.status === "scheduled" && item.startsAt && (
            <p className="mt-3 text-sm text-muted-foreground">
              Starts {formatStreamTime(item.startsAt)} (school time). The video plays here once the
              broadcast begins.
            </p>
          )}
        </Container>
        {item.description && (
          <Container className="mt-10 max-w-3xl">
            <Prose html={item.description} />
          </Container>
        )}
      </article>

      {others.length > 0 && (
        <Section muted>
          <SectionHeading title="More live streams" />
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-3">
            {others.map((s) => (
              <StreamCard key={s.id} stream={s} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
