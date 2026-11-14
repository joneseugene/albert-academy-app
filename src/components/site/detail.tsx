import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "./primitives";

/** Shared frame for detail pages: back link, meta, title, lead, body. */
export function DetailHeader({
  back,
  meta,
  title,
  lead,
}: {
  back: { href: string; label: string };
  meta?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
}) {
  return (
    <Container className="grid max-w-3xl gap-5 pt-10 sm:pt-16">
      <Link
        href={back.href}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" /> {back.label}
      </Link>
      {meta && <div className="flex flex-wrap items-center gap-2 text-sm">{meta}</div>}
      <h1 className="text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
        {title}
      </h1>
      {lead && <p className="text-xl text-pretty text-muted-foreground">{lead}</p>}
    </Container>
  );
}

export function DetailSkeleton() {
  return (
    <Container className="grid max-w-3xl gap-5 py-16">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="aspect-video w-full rounded-3xl" />
      <Skeleton className="h-40 w-full" />
    </Container>
  );
}
