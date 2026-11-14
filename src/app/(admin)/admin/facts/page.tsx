import { Suspense } from "react";
import type { Metadata } from "next";
import { LightbulbIcon } from "lucide-react";

import { ListSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { FactsView } from "@/features/facts/components/facts-view";
import { factsService } from "@/features/facts/server/service";
import type { Filter } from "@/lib/data/query";
import { loadListWithFilters, toListQuery } from "@/lib/data/search-params";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "Did you know?" };

export default function FactsPage({ searchParams }: PageProps<"/admin/facts">) {
  return (
    <>
      <PageHeader
        title="Did You Know?"
        description="Short facts about the school for the public"
        icon={LightbulbIcon}
      />
      <Suspense fallback={<ListSkeleton />}>
        <FactsList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function FactsList({ searchParams }: Pick<PageProps<"/admin/facts">, "searchParams">) {
  await requirePermission("facts.read");
  const { list, filters } = await loadListWithFilters(searchParams, ["visibility"]);
  const queryFilters: Filter[] = [];
  if (filters.visibility === "published" || filters.visibility === "hidden") {
    queryFilters.push({
      field: "isPublished",
      op: "eq",
      value: filters.visibility === "published",
    });
  }
  const data = await factsService.list(toListQuery(list, { filters: queryFilters }));
  return <FactsView data={data} />;
}
