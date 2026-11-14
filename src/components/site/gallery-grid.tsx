"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { GalleryItem } from "@/features/gallery/schemas";
import { cn } from "@/lib/utils";

/** Photo grid; clicking a photo opens it full size with its title and description. */
export function GalleryGrid({ items, compact }: { items: GalleryItem[]; compact?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const current = open === null ? null : items[open];

  const go = useCallback(
    (delta: number) => setOpen((i) => (i === null ? i : (i + delta + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  return (
    <>
      <ul
        className={cn(
          "grid gap-3 sm:gap-4",
          compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
        )}
      >
        {items.map((g, i) => (
          <li key={g.id} className={cn(compact && i === 0 && "col-span-2 row-span-2")}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group relative block size-full overflow-hidden rounded-2xl border bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:rounded-3xl"
              aria-label={`Open photo: ${g.title}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={g.photoUrl}
                alt={g.title}
                loading="lazy"
                className="aspect-square size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-3 text-left text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                {g.title}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={current !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[min(64rem,calc(100%-2rem))] gap-0 overflow-hidden p-0 sm:max-w-[min(64rem,calc(100%-2rem))]"
        >
          {current && (
            <>
              <div className="relative bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={current.photoUrl}
                  alt={current.title}
                  className="mx-auto max-h-[70vh] w-auto object-contain"
                />
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  className="absolute top-3 right-3 inline-flex size-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                  aria-label="Close"
                >
                  <XIcon className="size-4" />
                </button>
                {items.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => go(-1)}
                      className="absolute top-1/2 left-3 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                      aria-label="Previous photo"
                    >
                      <ChevronLeftIcon className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(1)}
                      className="absolute top-1/2 right-3 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                      aria-label="Next photo"
                    >
                      <ChevronRightIcon className="size-5" />
                    </button>
                  </>
                )}
              </div>
              <div className="grid gap-1 p-5">
                <DialogTitle className="text-lg">{current.title}</DialogTitle>
                {current.description ? (
                  <DialogDescription asChild>
                    <div
                      className="rich-text text-sm"
                      dangerouslySetInnerHTML={{ __html: current.description }}
                    />
                  </DialogDescription>
                ) : (
                  <DialogDescription className="sr-only">{current.title}</DialogDescription>
                )}
                <p className="text-xs text-muted-foreground tabular-nums">
                  {open! + 1} / {items.length}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
