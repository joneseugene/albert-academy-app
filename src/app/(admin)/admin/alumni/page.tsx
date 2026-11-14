import { Suspense } from "react";
import type { Metadata } from "next";
import { StarIcon } from "lucide-react";

import { ListSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { AlumniView } from "@/features/alumni/components/alumni-view";
import { alumniService } from "@/features/alumni/server/service";

import { loadListWithFilters, toListQuery } from "@/lib/data/search-params";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "Notable Alumni" };

export default function Page({ searchParams }: PageProps<"/admin/alumni">) {
  return (
    <>
      <PageHeader
        title="Notable Alumni"
        description="Old students the school is proud of"
        icon={StarIcon}
      />
      <Suspense fallback={<ListSkeleton />}>
        <List searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function List({ searchParams }: Pick<PageProps<"/admin/alumni">, "searchParams">) {
  await requirePermission("alumni.read");
  const { list } = await loadListWithFilters(searchParams, []);
  const data = await alumniService.list(toListQuery(list));
  return <AlumniView data={data} />;
}
