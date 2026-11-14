import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRightIcon, ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/*
 * Building blocks for the public site: a calm, minimal look — lots of white,
 * big tight headlines, pill buttons, large rounded panels with hairline
 * borders (never shadows).
 */

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>{children}</div>;
}

export function Section({
  id,
  className,
  children,
  muted,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
  /** Soft grey band to separate sections. */
  muted?: boolean;
}) {
  return (
    <section id={id} className={cn("py-14 sm:py-20", muted && "bg-muted/50", className)}>
      <Container>{children}</Container>
    </section>
  );
}

/** Small pill label above a heading. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  center,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** e.g. a "View all" link, shown on the right. */
  action?: ReactNode;
  center?: boolean;
}) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 sm:mb-10",
        center ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between",
      )}
    >
      <div className={cn("grid max-w-2xl gap-3", center && "justify-items-center")}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="font-serif text-3xl font-medium tracking-tight text-balance sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="text-base text-pretty text-muted-foreground sm:text-lg">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

const pill =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none [&_svg]:size-4";

export function PillLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "light";
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        pill,
        size === "sm" && "h-10 px-5",
        variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "outline" && "border bg-background hover:bg-muted",
        variant === "light" && "bg-white text-primary hover:bg-white/90",
        className,
      )}
    >
      {children}
    </Link>
  );
}

/** "View all →" text link. */
export function MoreLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
    >
      {children}
      <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

/** Uploaded image with a calm placeholder when there is none. */
export function Media({
  src,
  alt,
  className,
  fallback,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallback?: ReactNode;
}) {
  if (!src) {
    return (
      <div
        className={cn("flex items-center justify-center bg-muted text-muted-foreground", className)}
        aria-hidden={!alt}
      >
        {fallback ?? <ImageIcon className="size-8 opacity-40" />}
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" className={cn("object-cover", className)} />;
}

/**
 * Admin-written rich text. `html` must already be sanitized — the public
 * queries (src/features/site/server/queries.ts) do that for every rich field.
 */
export function Prose({
  html,
  className,
}: {
  html: string | null | undefined;
  className?: string;
}) {
  if (!html) return null;
  return (
    <div
      className={cn("rich-text text-base leading-relaxed text-pretty sm:text-lg", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** Page title block for inner pages. */
export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="aura overflow-hidden border-b pt-14 pb-12 sm:pt-20 sm:pb-16">
      <Container className="grid gap-4">
        {eyebrow && <Eyebrow className="justify-self-start">{eyebrow}</Eyebrow>}
        <h1 className="max-w-3xl font-serif text-4xl font-medium tracking-tight text-balance sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-lg text-pretty text-muted-foreground">{description}</p>
        )}
        {children}
      </Container>
    </section>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-3xl border border-dashed px-6 py-16 text-center text-muted-foreground">
      {children}
    </p>
  );
}
