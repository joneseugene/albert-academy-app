import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, UserIcon } from "lucide-react";

import { AlumnusCard } from "@/components/site/cards";
import { DetailSkeleton } from "@/components/site/detail";
import { Container, Media, Prose, Section, SectionHeading } from "@/components/site/primitives";
import { site } from "@/config/routes";
import { lateLabel } from "@/features/alumni/schemas";
import { getAlumni, getAlumnus } from "@/features/site/server/queries";
import { excerpt } from "@/lib/rich-text";

export async function generateMetadata({ params }: PageProps<"/alumni/[id]">): Promise<Metadata> {
  const item = await getAlumnus((await params).id);
  if (!item) notFound(); // a real 404 status (the page body streams later)
  return { title: item.name, description: excerpt(item.summary, 300) ?? undefined };
}

export default function AlumnusPage({ params }: PageProps<"/alumni/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Alumnus params={params} />
    </Suspense>
  );
}

async function Alumnus({ params }: Pick<PageProps<"/alumni/[id]">, "params">) {
  const { id } = await params;
  const [item, all] = await Promise.all([getAlumnus(id), getAlumni(8)]);
  if (!item) notFound();
  const others = all.filter((a) => a.id !== item.id).slice(0, 4);

  return (
    <>
      <article className="py-10 sm:py-16">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="grid content-start gap-6">
            <Link
              href={site.alumni}
              className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeftIcon className="size-4" /> All alumni
            </Link>
            <div className="overflow-hidden rounded-4xl border bg-muted">
              <Media
                src={item.photoUrl}
                alt={item.name}
                className={item.isDeceased ? "aspect-4/5 w-full grayscale" : "aspect-4/5 w-full"}
                fallback={<UserIcon className="size-16 opacity-30" />}
              />
            </div>
          </div>
          <div className="grid content-start gap-5 lg:pt-12">
            <div className="flex flex-wrap gap-2">
              {item.classYear && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Class of {item.classYear}
                </span>
              )}
              {item.isDeceased && (
                <span className="rounded-full bg-foreground/80 px-3 py-1 text-xs font-medium text-background">
                  {lateLabel(item)}
                </span>
              )}
              {item.nickname && (
                <span className="rounded-full border px-3 py-1 text-xs">“{item.nickname}”</span>
              )}
            </div>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-balance sm:text-5xl">
              {item.name}
            </h1>
            {item.position && (
              <p className="text-lg text-muted-foreground sm:text-xl">{item.position}</p>
            )}
            {item.summary && (
              <Prose html={item.summary} className="border-l-2 border-primary pl-4" />
            )}
            <Prose html={item.detail} />
          </div>
        </Container>
      </article>

      {others.length > 0 && (
        <Section muted>
          <SectionHeading title="More notable alumni" />
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {others.map((a) => (
              <AlumnusCard key={a.id} item={a} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
