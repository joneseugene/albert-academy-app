import type { Metadata } from "next";

import { AlumnusCard } from "@/components/site/cards";
import { EmptyState, PageHero, Section } from "@/components/site/primitives";
import { getAlumni } from "@/features/site/server/queries";

export const metadata: Metadata = {
  title: "Notable alumni",
  description: "Albert Academy old students who have made their mark.",
};

export default async function AlumniPage() {
  const alumni = await getAlumni();
  return (
    <>
      <PageHero
        eyebrow="Notable alumni"
        title="Where our students go."
        description="Old students of Albert Academy who have made their mark at home and around the world."
      />
      <Section>
        {alumni.length === 0 ? (
          <EmptyState>Our notable alumni will appear here soon.</EmptyState>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {alumni.map((a) => (
              <AlumnusCard key={a.id} item={a} />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
