import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarIcon } from "lucide-react";

import { ActivityStatus } from "@/components/site/activity-status";
import { ActivityCard, activityPeriod } from "@/components/site/cards";
import { DetailHeader, DetailSkeleton } from "@/components/site/detail";
import { Container, Media, Prose, Section, SectionHeading } from "@/components/site/primitives";
import { site } from "@/config/routes";
import { categoryLabel } from "@/features/activities/schemas";
import { getActivities, getActivity } from "@/features/site/server/queries";

export async function generateMetadata({
  params,
}: PageProps<"/activities/[id]">): Promise<Metadata> {
  const item = await getActivity((await params).id);
  if (!item) notFound(); // a real 404 status (the page body streams later)
  return { title: item.title };
}

export default function ActivityPage({ params }: PageProps<"/activities/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Activity params={params} />
    </Suspense>
  );
}

async function Activity({ params }: Pick<PageProps<"/activities/[id]">, "params">) {
  const { id } = await params;
  const [item, all] = await Promise.all([getActivity(id), getActivities(12)]);
  if (!item) notFound();
  const related = all
    .filter((a) => a.id !== item.id)
    .sort((a, b) => Number(b.category === item.category) - Number(a.category === item.category))
    .slice(0, 3);

  return (
    <>
      <article className="pb-16">
        <DetailHeader
          back={{ href: site.activities, label: "All activities" }}
          meta={
            <>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {categoryLabel(item.category)}
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <CalendarIcon className="size-4" /> {activityPeriod(item)}
              </span>
              <ActivityStatus startDate={item.startDate} endDate={item.endDate} />
            </>
          }
          title={item.title}
        />
        {item.photoUrl && (
          <Container className="mt-10 max-w-5xl">
            <Media src={item.photoUrl} alt="" className="aspect-16/9 w-full rounded-4xl border" />
          </Container>
        )}
        <Container className="mt-10 max-w-3xl">
          <Prose html={item.description} />
        </Container>
      </article>

      {related.length > 0 && (
        <Section muted>
          <SectionHeading title="More activities" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <ActivityCard key={a.id} item={a} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
