import { Suspense } from "react";
import type { Metadata } from "next";
import { NewspaperIcon } from "lucide-react";

import { ListSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { NewsView } from "@/features/news/components/news-view";
import { newsService } from "@/features/news/server/service";
import type { Filter } from "@/lib/data/query";
import { loadListWithFilters, toListQuery } from "@/lib/data/search-params";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "News" };

export default function NewsPage({ searchParams }: PageProps<"/admin/news">) {
  return (
    <>
      <PageHeader title="News" description="News and announcements" icon={NewspaperIcon} />
      <Suspense fallback={<ListSkeleton />}>
        <NewsList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function NewsList({ searchParams }: Pick<PageProps<"/admin/news">, "searchParams">) {
  await requirePermission("news.read");
  const { list, filters } = await loadListWithFilters(searchParams, ["status"]);
  const queryFilters: Filter[] = [];
  if (filters.status) queryFilters.push({ field: "status", op: "eq", value: filters.status });
  const data = await newsService.list(toListQuery(list, { filters: queryFilters }));
  return <NewsView data={data} />;
}
