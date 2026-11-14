"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { SearchIcon, XIcon } from "lucide-react";

import { site } from "@/config/routes";
import { newsDate, type News } from "@/features/news/schemas";
import { htmlToText } from "@/lib/rich-text";
import { cn } from "@/lib/utils";
import { Media } from "./primitives";

const PAGE = 9;

/** The year a story belongs to: when it happened if set, else when it was published. */
const yearOf = (n: News) =>
  n.eventStart ? Number(n.eventStart.slice(0, 4)) : (n.publishedAt?.getFullYear() ?? null);
const timeOf = (n: News) =>
  n.eventStart ? new Date(n.eventStart).getTime() : (n.publishedAt?.getTime() ?? 0);

/** All news with instant search, year filter, sort and "show more". */
export function NewsBrowser({ news }: { news: News[] }) {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState<number | null>(null);
  const [order, setOrder] = useState<"newest" | "oldest">("newest");
  const [shown, setShown] = useState(PAGE);
  const q = useDeferredValue(query.trim().toLowerCase());

  const years = useMemo(
    () =>
      [...new Set(news.map(yearOf).filter((y): y is number => y !== null))].sort((a, b) => b - a),
    [news],
  );

  const results = useMemo(() => {
    const list = news.filter((n) => {
      if (year !== null && yearOf(n) !== year) return false;
      if (!q) return true;
      return `${n.title} ${htmlToText(n.summary)}`.toLowerCase().includes(q);
    });
    return list.sort((a, b) =>
      order === "newest" ? timeOf(b) - timeOf(a) : timeOf(a) - timeOf(b),
    );
  }, [news, q, year, order]);

  const filtering = Boolean(q) || year !== null || order !== "newest";
  // The newest story is featured on its own until the visitor filters.
  const lead: News | undefined = filtering ? undefined : results[0];
  const rest = filtering ? results : results.slice(1);
  const visible = rest.slice(0, shown);

  const reset = () => {
    setQuery("");
    setYear(null);
    setOrder("newest");
    setShown(PAGE);
  };

  return (
    <div className="grid gap-10">
      {/* ---------- Filters ---------- */}
      <div className="grid gap-4 border-b pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-0 flex-1 sm:max-w-sm">
            <span className="sr-only">Search news</span>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShown(PAGE);
              }}
              placeholder="Search news"
              className="h-10 w-full rounded-full border bg-background pr-4 pl-10 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 sm:text-sm"
            />
          </label>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value as "newest" | "oldest")}
            aria-label="Sort"
            className="h-10 rounded-full border bg-background px-4 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/30 sm:text-sm"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          {filtering && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-4" /> Clear
            </button>
          )}
        </div>

        {years.length > 1 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by year">
            <Chip active={year === null} onClick={() => setYear(null)}>
              All years
            </Chip>
            {years.map((y) => (
              <Chip
                key={y}
                active={year === y}
                onClick={() => {
                  setYear(year === y ? null : y);
                  setShown(PAGE);
                }}
              >
                {y}
              </Chip>
            ))}
          </div>
        )}

        <p className="text-sm text-muted-foreground" aria-live="polite">
          {results.length === news.length
            ? `${news.length} ${news.length === 1 ? "story" : "stories"}`
            : `${results.length} of ${news.length} stories`}
        </p>
      </div>

      {results.length === 0 && (
        <p className="py-16 text-center text-muted-foreground">
          No stories match.{" "}
          <button onClick={reset} className="text-primary underline">
            Clear the filters
          </button>
        </p>
      )}

      {/* ---------- Featured (only when not filtering) ---------- */}
      {lead && (
        <Link
          href={`${site.news}/${lead.id}`}
          className="group grid gap-6 lg:grid-cols-12 lg:items-center lg:gap-10"
        >
          <div className="overflow-hidden rounded-2xl border bg-muted lg:col-span-7">
            <Media
              src={lead.photoUrl}
              alt=""
              className="aspect-16/9 w-full transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </div>
          <div className="grid gap-3 lg:col-span-5">
            <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">Latest</p>
            <h2 className="font-serif text-3xl leading-tight font-medium text-balance group-hover:text-primary sm:text-4xl">
              {lead.title}
            </h2>
            <p className="text-sm text-muted-foreground">{newsDate(lead)}</p>
            {lead.summary && (
              <p className="line-clamp-3 text-pretty text-muted-foreground">
                {htmlToText(lead.summary)}
              </p>
            )}
          </div>
        </Link>
      )}

      {/* ---------- Grid ---------- */}
      {visible.length > 0 && (
        <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((n) => (
            <li key={n.id}>
              <Link href={`${site.news}/${n.id}`} className="group grid gap-4">
                <div className="overflow-hidden rounded-xl border bg-muted">
                  <Media
                    src={n.photoUrl}
                    alt=""
                    className="aspect-16/10 w-full transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="grid gap-1.5">
                  <p className="text-xs text-muted-foreground">{newsDate(n)}</p>
                  <h3 className="font-serif text-xl leading-snug font-medium text-balance group-hover:text-primary">
                    {n.title}
                  </h3>
                  {n.summary && (
                    <p className="line-clamp-2 text-sm text-pretty text-muted-foreground">
                      {htmlToText(n.summary)}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {rest.length > shown && (
        <button
          type="button"
          onClick={() => setShown((s) => s + PAGE)}
          className="mx-auto inline-flex h-11 items-center rounded-full border bg-background px-6 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
        >
          Show more stories
        </button>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-8 rounded-full border px-3.5 text-sm tabular-nums transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "bg-background text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
