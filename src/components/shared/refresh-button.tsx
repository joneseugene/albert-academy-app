"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCwIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Re-fetch the current page's data without a full reload: re-renders the
 * Server Components (lists, stats, details) and invalidates client queries.
 * Search, filters and pagination in the URL are kept.
 */
export function RefreshButton({
  label = "Refresh",
  className,
}: {
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const refresh = () =>
    startTransition(async () => {
      router.refresh();
      await queryClient.invalidateQueries();
    });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={label}
          aria-busy={isPending}
          disabled={isPending}
          onClick={refresh}
          className={cn("shrink-0", className)}
        >
          <RefreshCwIcon className={cn(isPending && "animate-spin")} aria-hidden />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{isPending ? "Refreshing…" : label}</TooltipContent>
    </Tooltip>
  );
}
