import type { Metadata } from "next";

import { GalleryGrid } from "@/components/site/gallery-grid";
import { EmptyState, PageHero, Section } from "@/components/site/primitives";
import { getGallery } from "@/features/site/server/queries";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos from life at Albert Academy.",
};

export default async function GalleryPage() {
  const items = await getGallery();
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Moments from school life."
        description="Tap a photo to see it full size."
      />
      <Section>
        {items.length === 0 ? (
          <EmptyState>Photos will appear here soon.</EmptyState>
        ) : (
          <GalleryGrid items={items} />
        )}
      </Section>
    </>
  );
}
