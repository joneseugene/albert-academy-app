import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MegaphoneIcon } from "lucide-react";

import { DetailHeader, DetailSkeleton } from "@/components/site/detail";
import { Container, Prose, Section } from "@/components/site/primitives";
import { site } from "@/config/routes";
import { getNotice, getNotices } from "@/features/site/server/queries";
import { formatDate } from "@/lib/format";
import { excerpt } from "@/lib/rich-text";

export async function generateMetadata({ params }: PageProps<"/notices/[id]">): Promise<Metadata> {
  const item = await getNotice((await params).id);
  if (!item) notFound();
  return { title: item.title, description: excerpt(item.body, 300) ?? undefined };
}

export default function NoticePage({ params }: PageProps<"/notices/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <NoticeDetail params={params} />
    </Suspense>
  );
}

async function NoticeDetail({ params }: Pick<PageProps<"/notices/[id]">, "params">) {
  const { id } = await params;
  const [item, all] = await Promise.all([getNotice(id), getNotices()]);
  if (!item) notFound();
  const others = all.filter((n) => n.id !== item.id).slice(0, 4);

  return (
    <>
      <article className="pb-16">
        <DetailHeader
          back={{ href: site.notices, label: "All notices" }}
          meta={
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <MegaphoneIcon className="size-4 text-primary" /> Public notice ·{" "}
              {formatDate(item.publishedAt ?? item.createdAt)}
            </span>
          }
          title={item.title}
        />
        <Container className="mt-10 max-w-3xl">
          <Prose html={item.body} />
        </Container>
      </article>

      {others.length > 0 && (
        <Section muted>
          <Container className="max-w-3xl px-0 sm:px-0">
            <h2 className="mb-4 font-serif text-2xl font-medium">Other notices</h2>
            <ul className="divide-y border-y">
              {others.map((n) => (
                <li key={n.id}>
                  <Link
                    href={`${site.notices}/${n.id}`}
                    className="flex items-baseline justify-between gap-4 py-3.5 hover:text-primary"
                  >
                    <span className="font-medium">{n.title}</span>
                    <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
                      {formatDate(n.publishedAt ?? n.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}
    </>
  );
}
