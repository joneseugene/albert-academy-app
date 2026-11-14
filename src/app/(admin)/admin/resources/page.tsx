import { Suspense } from "react";
import type { Metadata } from "next";
import { BookOpenIcon } from "lucide-react";

import { ListSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { ResourcesView } from "@/features/resources/components/resources-view";
import { resourcesService } from "@/features/resources/server/service";

import { loadListWithFilters, toListQuery } from "@/lib/data/search-params";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "Academic Resources" };

export default function Page({ searchParams }: PageProps<"/admin/resources">) {
  return (
    <>
      <PageHeader
        title="Academic Resources"
        description="Links to past papers, syllabuses and learning material"
        icon={BookOpenIcon}
      />
      <Suspense fallback={<ListSkeleton />}>
        <List searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function List({ searchParams }: Pick<PageProps<"/admin/resources">, "searchParams">) {
  await requirePermission("resources.read");
  const { list } = await loadListWithFilters(searchParams, []);
  const data = await resourcesService.list(toListQuery(list));
  return <ResourcesView data={data} />;
}
