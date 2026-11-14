import { cn } from "@/lib/utils";

/**
 * The Albert Academy crest (public/brand/crest.png), cleaned from the
 * school's own logo. Regenerate it and every icon with `pnpm icons`
 * (source: assets/crest-source.jpg).
 */
export function LogoMark({
  className,
  title = "Albert Academy",
}: {
  className?: string;
  title?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/crest.png"
      alt={title}
      width={1084}
      height={1197}
      className={cn("h-8 w-auto shrink-0", className)}
    />
  );
}

/** Crest + wordmark. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark title="" />
      <span className="flex flex-col leading-none">
        <span className="text-sm font-bold tracking-tight">Albert Academy</span>
        <span className="text-[11px] text-muted-foreground">Admin console</span>
      </span>
    </span>
  );
}
