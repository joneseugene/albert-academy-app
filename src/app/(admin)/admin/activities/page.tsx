import { Suspense } from "react";
import type { Metadata } from "next";
import { CalendarRangeIcon } from "lucide-react";

import { ListSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { ActivitiesView } from "@/features/activities/components/activities-view";
import { activitiesService } from "@/features/activities/server/service";
import type { Filter } from "@/lib/data/query";
import { loadListWithFilters, toListQuery } from "@/lib/data/search-params";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "Activities" };

export default function Page({ searchParams }: PageProps<"/admin/activities">) {
  return (
    <>
      <PageHeader
        title="Activities"
        description="Academic, sports, entertainment and other activities"
        icon={CalendarRangeIcon}
      />
      <Suspense fallback={<ListSkeleton />}>
        <List searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function List({ searchParams }: Pick<PageProps<"/admin/activities">, "searchParams">) {
  await requirePermission("activities.read");
  const { list, filters } = await loadListWithFilters(searchParams, ["category"]);
  const queryFilters: Filter[] = [];
  if (filters.category) queryFilters.push({ field: "category", op: "eq", value: filters.category });
  const data = await activitiesService.list(toListQuery(list, { filters: queryFilters }));
  return <ActivitiesView data={data} />;
}
