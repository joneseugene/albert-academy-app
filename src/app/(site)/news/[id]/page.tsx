import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NewsCard } from "@/components/site/cards";
import { DetailHeader, DetailSkeleton } from "@/components/site/detail";
import { Container, Media, Prose, Section, SectionHeading } from "@/components/site/primitives";
import { site } from "@/config/routes";
import { newsDate } from "@/features/news/schemas";
import { getNews, getNewsItem } from "@/features/site/server/queries";
import { excerpt, htmlToText } from "@/lib/rich-text";

export async function generateMetadata({ params }: PageProps<"/news/[id]">): Promise<Metadata> {
  const item = await getNewsItem((await params).id);
  if (!item) notFound(); // a real 404 status (the page body streams later)
  return { title: item.title, description: excerpt(item.summary, 300) ?? undefined };
}

export default function NewsArticlePage({ params }: PageProps<"/news/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Article params={params} />
    </Suspense>
  );
}

async function Article({ params }: Pick<PageProps<"/news/[id]">, "params">) {
  const { id } = await params;
  const [item, more] = await Promise.all([getNewsItem(id), getNews(4)]);
  if (!item) notFound();
  const others = more.filter((n) => n.id !== item.id).slice(0, 3);

  return (
    <>
      <article className="pb-16">
        <DetailHeader
          back={{ href: site.news, label: "All news" }}
          meta={<span className="text-muted-foreground">{newsDate(item)}</span>}
          title={item.title}
          lead={htmlToText(item.summary) || undefined}
        />
        {item.photoUrl && (
          <Container className="mt-10 max-w-5xl">
            <Media src={item.photoUrl} alt="" className="aspect-16/9 w-full rounded-4xl border" />
          </Container>
        )}
        <Container className="mt-10 max-w-3xl">
          <Prose html={item.content} />
        </Container>
      </article>

      {others.length > 0 && (
        <Section muted>
          <SectionHeading title="More news" />
          <div className="grid gap-8 sm:grid-cols-3">
            {others.map((n) => (
              <NewsCard key={n.id} item={n} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
