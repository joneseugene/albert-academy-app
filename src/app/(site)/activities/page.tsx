import type { Metadata } from "next";

import { ActivityCard } from "@/components/site/cards";
import { EmptyState, PageHero, Section } from "@/components/site/primitives";
import { ACTIVITY_CATEGORIES, type ActivityCategory } from "@/features/activities/schemas";
import { getActivities } from "@/features/site/server/queries";

export const metadata: Metadata = {
  title: "Activities",
  description: "Academic, sports, entertainment and cultural activities at Albert Academy.",
};

export default async function ActivitiesPage() {
  const activities = await getActivities();
  // Group by category, in the configured category order.
  const groups = (Object.keys(ACTIVITY_CATEGORIES) as ActivityCategory[])
    .map((key) => ({ key, items: activities.filter((a) => a.category === key) }))
    .filter((g) => g.items.length);

  return (
    <>
      <PageHero
        eyebrow="School life"
        title="Activities"
        description="Life at Albert Academy goes well beyond the classroom."
      >
        {groups.length > 1 && (
          <nav aria-label="Categories" className="mt-4 flex flex-wrap gap-2">
            {groups.map((g) => (
              <a
                key={g.key}
                href={`#${g.key}`}
                className="rounded-full border bg-background px-3.5 py-1.5 text-sm hover:bg-muted"
              >
                {ACTIVITY_CATEGORIES[g.key]}{" "}
                <span className="text-muted-foreground tabular-nums">{g.items.length}</span>
              </a>
            ))}
          </nav>
        )}
      </PageHero>
      {groups.length === 0 ? (
        <Section>
          <EmptyState>No activities yet. Check back soon.</EmptyState>
        </Section>
      ) : (
        groups.map((g, i) => (
          <Section key={g.key} id={g.key} muted={i % 2 === 1} className="scroll-mt-16">
            <h2 className="mb-8 font-serif text-2xl font-medium tracking-tight sm:text-3xl">
              {ACTIVITY_CATEGORIES[g.key]}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((a) => (
                <ActivityCard key={a.id} item={a} />
              ))}
            </div>
          </Section>
        ))
      )}
    </>
  );
}
