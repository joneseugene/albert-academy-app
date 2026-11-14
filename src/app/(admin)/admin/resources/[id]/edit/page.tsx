import { Suspense } from "react";
import type { Metadata } from "next";
import { PencilIcon } from "lucide-react";

import { FormSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";
import { ResourceForm } from "@/features/resources/components/resource-form";
import { resourcesService } from "@/features/resources/server/service";
import { orNotFound } from "@/server/core/page-data";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "Edit resource" };

export default function Page({ params }: PageProps<"/admin/resources/[id]/edit">) {
  return (
    <>
      <PageHeader
        title="Edit resource"
        icon={PencilIcon}
        back={{ href: routes.resources, label: "Academic Resources" }}
      />
      <Suspense fallback={<FormSkeleton />}>
        <EditForm params={params} />
      </Suspense>
    </>
  );
}

async function EditForm({ params }: Pick<PageProps<"/admin/resources/[id]/edit">, "params">) {
  await requirePermission("resources.update");
  const { id } = await params;
  return <ResourceForm resource={await orNotFound(resourcesService.get(id))} />;
}
