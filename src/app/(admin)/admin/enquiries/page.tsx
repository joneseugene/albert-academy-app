import { Suspense } from "react";
import type { Metadata } from "next";
import { InboxIcon } from "lucide-react";

import { ListSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { EnquiriesView } from "@/features/enquiries/components/enquiries-view";
import { ENQUIRY_STATUSES, ENQUIRY_TOPICS } from "@/features/enquiries/schemas";
import { enquiriesService } from "@/features/enquiries/server/service";
import type { Filter } from "@/lib/data/query";
import { loadListWithFilters, toListQuery } from "@/lib/data/search-params";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "Enquiries" };

export default function EnquiriesPage({ searchParams }: PageProps<"/admin/enquiries">) {
  return (
    <>
      <PageHeader
        title="Enquiries"
        description="Messages sent from the website's contact form"
        icon={InboxIcon}
      />
      <Suspense fallback={<ListSkeleton />}>
        <EnquiriesList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function EnquiriesList({
  searchParams,
}: Pick<PageProps<"/admin/enquiries">, "searchParams">) {
  await requirePermission("enquiries.read");
  const { list, filters } = await loadListWithFilters(searchParams, ["status", "topic"]);
  const queryFilters: Filter[] = [];
  if (filters.status && filters.status in ENQUIRY_STATUSES) {
    queryFilters.push({ field: "status", op: "eq", value: filters.status });
  }
  if (filters.topic && filters.topic in ENQUIRY_TOPICS) {
    queryFilters.push({ field: "topic", op: "eq", value: filters.topic });
  }
  const data = await enquiriesService.list(toListQuery(list, { filters: queryFilters }));
  return <EnquiriesView data={data} />;
}
