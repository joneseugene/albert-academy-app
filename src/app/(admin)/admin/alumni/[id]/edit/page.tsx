import { Suspense } from "react";
import type { Metadata } from "next";
import { PencilIcon } from "lucide-react";

import { FormSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";
import { AlumnusForm } from "@/features/alumni/components/alumnus-form";
import { alumniService } from "@/features/alumni/server/service";
import { orNotFound } from "@/server/core/page-data";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "Edit alumnus" };

export default function Page({ params }: PageProps<"/admin/alumni/[id]/edit">) {
  return (
    <>
      <PageHeader
        title="Edit alumnus"
        icon={PencilIcon}
        back={{ href: routes.alumni, label: "Notable Alumni" }}
      />
      <Suspense fallback={<FormSkeleton />}>
        <EditForm params={params} />
      </Suspense>
    </>
  );
}

async function EditForm({ params }: Pick<PageProps<"/admin/alumni/[id]/edit">, "params">) {
  await requirePermission("alumni.update");
  const { id } = await params;
  return <AlumnusForm alumnus={await orNotFound(alumniService.get(id))} />;
}
