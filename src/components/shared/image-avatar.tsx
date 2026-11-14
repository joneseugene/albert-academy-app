import type { ReactNode } from "react";
import { Avatar } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * An uploaded image (avatar, logo) with a fallback shown while it loads,
 * when there is none, or if it fails to load.
 */
export function ImageAvatar({
  src,
  alt,
  fallback,
  shape = "circle",
  className,
}: {
  src: string | null | undefined;
  alt: string;
  fallback: ReactNode;
  shape?: "circle" | "square";
  className?: string;
}) {
  return (
    <Avatar.Root
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden bg-primary/10 text-xs font-semibold text-primary",
        shape === "circle" ? "rounded-full" : "rounded-lg",
        className,
      )}
    >
      {src && (
        <Avatar.Image
          src={src}
          alt={alt}
          className={cn("size-full", shape === "circle" ? "object-cover" : "object-contain")}
        />
      )}
      <Avatar.Fallback
        className="flex size-full items-center justify-center"
        delayMs={src ? 300 : 0}
      >
        {fallback}
      </Avatar.Fallback>
    </Avatar.Root>
  );
}
