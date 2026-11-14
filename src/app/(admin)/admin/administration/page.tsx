import { Suspense } from "react";
import type { Metadata } from "next";
import { BriefcaseIcon } from "lucide-react";

import { ListSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { AdministrationView } from "@/features/administration/components/administration-view";
import { administrationService } from "@/features/administration/server/service";

import { loadListWithFilters, toListQuery } from "@/lib/data/search-params";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "Administration" };

export default function Page({ searchParams }: PageProps<"/admin/administration">) {
  return (
    <>
      <PageHeader
        title="Administration"
        description="The school's administration staff"
        icon={BriefcaseIcon}
      />
      <Suspense fallback={<ListSkeleton />}>
        <List searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function List({ searchParams }: Pick<PageProps<"/admin/administration">, "searchParams">) {
  await requirePermission("administration.read");
  const { list } = await loadListWithFilters(searchParams, []);
  const data = await administrationService.list(toListQuery(list));
  return <AdministrationView data={data} />;
}
