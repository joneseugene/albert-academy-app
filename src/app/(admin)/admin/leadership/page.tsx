import { Suspense } from "react";
import type { Metadata } from "next";
import { CrownIcon } from "lucide-react";

import { ListSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { LeadershipView } from "@/features/leadership/components/leadership-view";
import { leadershipService } from "@/features/leadership/server/service";
import type { Filter } from "@/lib/data/query";
import { loadListWithFilters, toListQuery } from "@/lib/data/search-params";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "Leadership" };

export default function Page({ searchParams }: PageProps<"/admin/leadership">) {
  return (
    <>
      <PageHeader title="Leadership" description="Current and past principals" icon={CrownIcon} />
      <Suspense fallback={<ListSkeleton />}>
        <List searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function List({ searchParams }: Pick<PageProps<"/admin/leadership">, "searchParams">) {
  await requirePermission("leadership.read");
  const { list, filters } = await loadListWithFilters(searchParams, ["term"]);
  const queryFilters: Filter[] = [];
  if (filters.term === "current") queryFilters.push({ field: "toYear", op: "isNull", value: true });
  if (filters.term === "past") queryFilters.push({ field: "toYear", op: "isNull", value: false });
  const data = await leadershipService.list(toListQuery(list, { filters: queryFilters }));
  return <LeadershipView data={data} />;
}
