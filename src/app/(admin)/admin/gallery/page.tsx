import { Suspense } from "react";
import type { Metadata } from "next";
import { ImagesIcon } from "lucide-react";

import { ListSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { GalleryView } from "@/features/gallery/components/gallery-view";
import { galleryService } from "@/features/gallery/server/service";

import { loadListWithFilters, toListQuery } from "@/lib/data/search-params";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "Gallery" };

export default function Page({ searchParams }: PageProps<"/admin/gallery">) {
  return (
    <>
      <PageHeader title="Gallery" description="Photos from school life" icon={ImagesIcon} />
      <Suspense fallback={<ListSkeleton />}>
        <List searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function List({ searchParams }: Pick<PageProps<"/admin/gallery">, "searchParams">) {
  await requirePermission("gallery.read");
  const { list } = await loadListWithFilters(searchParams, []);
  const data = await galleryService.list(toListQuery(list));
  return <GalleryView data={data} />;
}
