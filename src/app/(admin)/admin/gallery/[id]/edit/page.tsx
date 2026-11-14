import { Suspense } from "react";
import type { Metadata } from "next";
import { PencilIcon } from "lucide-react";

import { FormSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";
import { GalleryItemForm } from "@/features/gallery/components/gallery-item-form";
import { galleryService } from "@/features/gallery/server/service";
import { orNotFound } from "@/server/core/page-data";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "Edit photo" };

export default function Page({ params }: PageProps<"/admin/gallery/[id]/edit">) {
  return (
    <>
      <PageHeader
        title="Edit photo"
        icon={PencilIcon}
        back={{ href: routes.gallery, label: "Gallery" }}
      />
      <Suspense fallback={<FormSkeleton />}>
        <EditForm params={params} />
      </Suspense>
    </>
  );
}

async function EditForm({ params }: Pick<PageProps<"/admin/gallery/[id]/edit">, "params">) {
  await requirePermission("gallery.update");
  const { id } = await params;
  return <GalleryItemForm item={await orNotFound(galleryService.get(id))} />;
}
