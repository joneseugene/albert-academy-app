import { Suspense } from "react";
import type { Metadata } from "next";
import { MegaphoneIcon } from "lucide-react";

import { ListSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { NoticesView } from "@/features/notices/components/notices-view";
import { noticesService } from "@/features/notices/server/service";
import type { Filter } from "@/lib/data/query";
import { loadListWithFilters, toListQuery } from "@/lib/data/search-params";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "Public notices" };

export default function NoticesPage({ searchParams }: PageProps<"/admin/notices">) {
  return (
    <>
      <PageHeader
        title="Public Notices"
        description="Announcements that can pop up when the website loads"
        icon={MegaphoneIcon}
      />
      <Suspense fallback={<ListSkeleton />}>
        <NoticesList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function NoticesList({ searchParams }: Pick<PageProps<"/admin/notices">, "searchParams">) {
  await requirePermission("notices.read");
  const { list, filters } = await loadListWithFilters(searchParams, ["status"]);
  const queryFilters: Filter[] = [];
  if (filters.status === "published" || filters.status === "draft") {
    queryFilters.push({ field: "isPublished", op: "eq", value: filters.status === "published" });
  }
  const data = await noticesService.list(toListQuery(list, { filters: queryFilters }));
  return <NoticesView data={data} />;
}
