import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, MegaphoneIcon } from "lucide-react";

import { EmptyState, PageHero, Section } from "@/components/site/primitives";
import { site } from "@/config/routes";
import { getNotices } from "@/features/site/server/queries";
import { formatDate } from "@/lib/format";
import { excerpt } from "@/lib/rich-text";

export const metadata: Metadata = {
  title: "Public notices",
  description: "Official notices and announcements from Albert Academy.",
};

export default async function NoticesPage() {
  const notices = await getNotices();
  return (
    <>
      <PageHero
        eyebrow="Notices"
        title="Public notices"
        description="Official announcements from the school, newest first."
      />
      <Section className="pt-10 sm:pt-12">
        {notices.length === 0 ? (
          <EmptyState>There are no public notices at the moment.</EmptyState>
        ) : (
          <ul className="mx-auto grid max-w-3xl divide-y border-y">
            {notices.map((n) => (
              <li key={n.id}>
                <Link
                  href={`${site.notices}/${n.id}`}
                  className="group grid gap-2 py-6 sm:grid-cols-[8rem_1fr_auto] sm:items-start sm:gap-6"
                >
                  <p className="text-sm text-muted-foreground tabular-nums">
                    {formatDate(n.publishedAt ?? n.createdAt)}
                  </p>
                  <div className="grid gap-1.5">
                    <h2 className="font-serif text-xl leading-snug font-medium text-balance group-hover:text-primary">
                      {n.title}
                    </h2>
                    {excerpt(n.body, 200) && (
                      <p className="line-clamp-2 text-sm text-pretty text-muted-foreground">
                        {excerpt(n.body, 200)}
                      </p>
                    )}
                  </div>
                  <ArrowRightIcon className="hidden size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary sm:mt-1 sm:block" />
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mx-auto mt-6 flex max-w-3xl items-center gap-2 text-xs text-muted-foreground">
          <MegaphoneIcon className="size-3.5" /> New notices may also appear when you open the
          website.
        </p>
      </Section>
    </>
  );
}
