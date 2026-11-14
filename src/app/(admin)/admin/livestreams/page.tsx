import { Suspense } from "react";
import type { Metadata } from "next";
import { RadioIcon } from "lucide-react";

import { ListSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { LivestreamsView } from "@/features/livestreams/components/livestreams-view";
import { livestreamsService } from "@/features/livestreams/server/service";
import type { Filter } from "@/lib/data/query";
import { loadListWithFilters, toListQuery } from "@/lib/data/search-params";
import { STREAM_PLATFORMS, STREAM_STATUSES } from "@/lib/livestream";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "Live streams" };

export default function LivestreamsPage({ searchParams }: PageProps<"/admin/livestreams">) {
  return (
    <>
      <PageHeader
        title="Live Streams"
        description="YouTube and Facebook live streams shown on the website"
        icon={RadioIcon}
      />
      <Suspense fallback={<ListSkeleton />}>
        <LivestreamsList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function LivestreamsList({
  searchParams,
}: Pick<PageProps<"/admin/livestreams">, "searchParams">) {
  await requirePermission("livestreams.read");
  const { list, filters } = await loadListWithFilters(searchParams, ["status", "platform"]);
  const queryFilters: Filter[] = [];
  if (filters.status && filters.status in STREAM_STATUSES) {
    queryFilters.push({ field: "status", op: "eq", value: filters.status });
  }
  if (filters.platform && filters.platform in STREAM_PLATFORMS) {
    queryFilters.push({ field: "platform", op: "eq", value: filters.platform });
  }
  const data = await livestreamsService.list(toListQuery(list, { filters: queryFilters }));
  return <LivestreamsView data={data} />;
}
