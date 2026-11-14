import { BookOpenIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Small tile for an academic resource. Resource images are mostly logos and
 * book covers in every shape, so the whole image is shown (contained, with a
 * little breathing room) instead of being cropped to fill.
 */
export function ResourceThumb({
  src,
  size = "md",
  className,
}: {
  src: string | null | undefined;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-background",
        size === "sm" ? "size-12 p-1.5" : "size-16 p-2",
        !src && "bg-accent",
        className,
      )}
      aria-hidden
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" className="size-full rounded-md object-contain" />
      ) : (
        <BookOpenIcon className={cn("text-primary", size === "sm" ? "size-5" : "size-6")} />
      )}
    </span>
  );
}
