import type { Metadata } from "next";

import { NewsBrowser } from "@/components/site/news-browser";
import { EmptyState, PageHero, Section } from "@/components/site/primitives";
import { getNews } from "@/features/site/server/queries";

export const metadata: Metadata = {
  title: "News",
  description: "News and announcements from Albert Academy.",
};

export default async function NewsPage() {
  const news = await getNews();
  return (
    <>
      <PageHero eyebrow="News" title="News & announcements" />
      <Section className="pt-10 sm:pt-12">
        {news.length === 0 ? (
          <EmptyState>No news yet. Check back soon.</EmptyState>
        ) : (
          <NewsBrowser news={news} />
        )}
      </Section>
    </>
  );
}
