import { cn } from "@/lib/utils";

const BLADES = 12;

/**
 * Classic "blade" activity spinner: twelve rounded bars around a circle, each
 * fading in turn. Inherits the text colour; size with `size-*`.
 */
export function BladeSpinner({
  className,
  label = "Loading",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn("relative inline-block size-4", className)}
    >
      {Array.from({ length: BLADES }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className="absolute top-0 left-[44%] h-[30%] w-[12%] origin-[50%_166.67%] animate-blade rounded-full bg-current"
          style={{
            transform: `rotate(${(360 / BLADES) * i}deg)`,
            animationDelay: `${-((BLADES - i) / BLADES)}s`,
          }}
        />
      ))}
    </span>
  );
}
