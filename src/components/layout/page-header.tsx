import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeftIcon, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type PageBackLink = { href: string; label: string };

/** "← Back to …" link to a page's parent. Use via `PageHeader back` or on custom headers. */
export function BackLink({ href, label }: PageBackLink) {
  return (
    <Link
      href={href}
      className="inline-flex w-fit items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <ArrowLeftIcon className="size-4" aria-hidden />
      <span className="max-w-[60vw] truncate">Back to {label}</span>
    </Link>
  );
}

/** Standard page heading: back link, icon, title, description and an actions slot. */
export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  back,
  className,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  /** Parent page to return to, e.g. `{ href: "/universities", label: "Universities" }`. */
  back?: PageBackLink;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3", className)}>
      {back && <BackLink {...back} />}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden />
            </span>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
