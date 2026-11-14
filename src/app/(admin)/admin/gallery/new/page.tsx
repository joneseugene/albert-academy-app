import { Suspense } from "react";
import type { Metadata } from "next";
import { ImagesIcon } from "lucide-react";

import { FormSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";
import { GalleryItemForm } from "@/features/gallery/components/gallery-item-form";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "Add photo" };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Add photo"
        icon={ImagesIcon}
        back={{ href: routes.gallery, label: "Gallery" }}
      />
      <Suspense fallback={<FormSkeleton />}>
        <Guarded />
      </Suspense>
    </>
  );
}

async function Guarded() {
  await requirePermission("gallery.create");
  return <GalleryItemForm />;
}
