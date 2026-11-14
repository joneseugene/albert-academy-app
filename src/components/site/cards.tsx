import Link from "next/link";
import { ArrowUpRightIcon, UserIcon } from "lucide-react";

import { site } from "@/config/routes";
import { activityPeriod, categoryLabel, type Activity } from "@/features/activities/schemas";
import { lateLabel, type Alumnus } from "@/features/alumni/schemas";
import { newsDate, type News } from "@/features/news/schemas";
import { htmlToText } from "@/lib/rich-text";
import { ActivityStatus } from "./activity-status";
import { Media } from "./primitives";

export { activityPeriod };

const cardLink =
  "group grid content-start gap-4 rounded-3xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

export function NewsCard({ item, large }: { item: News; large?: boolean }) {
  return (
    <Link href={`${site.news}/${item.id}`} className={cardLink}>
      <div className="overflow-hidden rounded-3xl border bg-muted">
        <Media
          src={item.photoUrl}
          alt=""
          className={
            large
              ? "aspect-16/10 w-full transition-transform duration-500 group-hover:scale-[1.03]"
              : "aspect-16/10 w-full transition-transform duration-500 group-hover:scale-[1.03]"
          }
        />
      </div>
      <div className="grid gap-2 px-1">
        <p className="text-xs font-medium text-muted-foreground">{newsDate(item)}</p>
        <h3
          className={
            large
              ? "font-serif text-2xl font-medium tracking-tight text-balance group-hover:text-primary sm:text-3xl"
              : "text-lg font-semibold tracking-tight text-balance group-hover:text-primary"
          }
        >
          {item.title}
        </h3>
        {item.summary && (
          <p className="line-clamp-2 text-sm text-pretty text-muted-foreground">
            {htmlToText(item.summary)}
          </p>
        )}
      </div>
    </Link>
  );
}

export function ActivityCard({ item }: { item: Activity }) {
  return (
    <Link
      href={`${site.activities}/${item.id}`}
      className={`${cardLink} overflow-hidden border bg-card p-3 transition-colors hover:border-primary/40`}
    >
      <div className="overflow-hidden rounded-2xl">
        <Media src={item.photoUrl} alt="" className="aspect-16/10 w-full" />
      </div>
      <div className="grid gap-2 px-2 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {categoryLabel(item.category)}
          </span>
          <ActivityStatus startDate={item.startDate} endDate={item.endDate} />
        </div>
        <h3 className="text-lg font-semibold tracking-tight group-hover:text-primary">
          {item.title}
        </h3>
        <p className="text-sm text-muted-foreground">{activityPeriod(item)}</p>
      </div>
    </Link>
  );
}

export function AlumnusCard({ item }: { item: Alumnus }) {
  return (
    <Link href={`${site.alumni}/${item.id}`} className={cardLink}>
      <div className="relative overflow-hidden rounded-3xl border bg-muted">
        <Media
          src={item.photoUrl}
          alt=""
          className={`aspect-4/5 w-full transition-transform duration-500 group-hover:scale-[1.03] ${item.isDeceased ? "grayscale" : ""}`}
          fallback={<UserIcon className="size-12 opacity-30" />}
        />
        {item.classYear && (
          <span className="absolute top-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur">
            Class of {item.classYear}
          </span>
        )}
        <span className="absolute right-3 bottom-3 inline-flex size-9 items-center justify-center rounded-full bg-background/90 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          <ArrowUpRightIcon className="size-4" />
        </span>
      </div>
      <div className="grid gap-1 px-1">
        <h3 className="font-semibold tracking-tight group-hover:text-primary">
          {item.name}
          {item.nickname && (
            <span className="font-normal text-muted-foreground"> “{item.nickname}”</span>
          )}
        </h3>
        {item.position && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{item.position}</p>
        )}
        {item.isDeceased && <p className="text-xs text-muted-foreground">{lateLabel(item)}</p>}
      </div>
    </Link>
  );
}

/** Staff / leader portrait (no detail page). */
export function PersonCard({
  name,
  role,
  photoUrl,
  note,
}: {
  name: string;
  role: string;
  photoUrl: string | null;
  note?: string | null;
}) {
  return (
    <div className="grid content-start gap-3">
      <div className="overflow-hidden rounded-3xl border bg-muted">
        <Media
          src={photoUrl}
          alt=""
          className="aspect-4/5 w-full"
          fallback={<UserIcon className="size-12 opacity-30" />}
        />
      </div>
      <div className="grid gap-0.5 px-1">
        <p className="font-semibold tracking-tight">{name}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
        {note && <p className="mt-1 line-clamp-4 text-sm text-pretty">{note}</p>}
      </div>
    </div>
  );
}
