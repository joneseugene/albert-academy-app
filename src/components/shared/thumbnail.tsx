import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * An uploaded image (or a placeholder when there is none). Plain <img>:
 * images come from Supabase Storage at their final size, so Next's image
 * optimizer would add a hop without saving anything.
 */
export function Thumbnail({
  src,
  alt,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground",
          className,
        )}
      >
        <ImageIcon className="size-4" aria-hidden />
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cn("size-10 shrink-0 rounded-md border bg-muted object-cover", className)}
    />
  );
}
