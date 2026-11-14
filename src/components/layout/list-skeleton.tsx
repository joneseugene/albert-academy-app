import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder for a DataView while the server fetches the list. */
export function ListSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="flex gap-2">
        <Skeleton className="h-9 w-full sm:w-72" />
        <Skeleton className="hidden h-9 w-48 sm:block" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="grid gap-6">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
