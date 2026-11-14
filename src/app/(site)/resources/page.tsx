import type { Metadata } from "next";
import { ArrowUpRightIcon } from "lucide-react";

import { EmptyState, PageHero, Section } from "@/components/site/primitives";
import { ResourceThumb } from "@/components/site/resource-thumb";
import { getResources } from "@/features/site/server/queries";
import { htmlToText } from "@/lib/rich-text";

export const metadata: Metadata = {
  title: "Academic resources",
  description: "Past papers, syllabuses and learning material for Albert Academy students.",
};

const hostOf = (url: string) => {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export default async function ResourcesPage() {
  const resources = await getResources();
  return (
    <>
      <PageHero
        eyebrow="Academic resources"
        title="Learn anywhere."
        description="Useful links for students and parents, chosen by the school."
      />
      <Section>
        {resources.length === 0 ? (
          <EmptyState>Resources will appear here soon.</EmptyState>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((r) => (
              <li key={r.id}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group flex h-full items-start gap-4 rounded-2xl border bg-card p-4 transition-colors hover:border-primary/40"
                >
                  <ResourceThumb src={r.photoUrl} />
                  <div className="grid min-w-0 flex-1 gap-1">
                    <p className="flex items-start justify-between gap-2 font-semibold tracking-tight group-hover:text-primary">
                      {r.title}
                      <ArrowUpRightIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                    </p>
                    {r.description && (
                      <p className="line-clamp-3 text-sm text-pretty text-muted-foreground">
                        {htmlToText(r.description)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">{hostOf(r.url)}</p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
