import { Suspense } from "react";
import type { Metadata } from "next";
import { PencilIcon } from "lucide-react";

import { FormSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";
import { AdministratorForm } from "@/features/administration/components/administrator-form";
import { administrationService } from "@/features/administration/server/service";
import { orNotFound } from "@/server/core/page-data";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "Edit staff member" };

export default function Page({ params }: PageProps<"/admin/administration/[id]/edit">) {
  return (
    <>
      <PageHeader
        title="Edit staff member"
        icon={PencilIcon}
        back={{ href: routes.administration, label: "Administration" }}
      />
      <Suspense fallback={<FormSkeleton />}>
        <EditForm params={params} />
      </Suspense>
    </>
  );
}

async function EditForm({ params }: Pick<PageProps<"/admin/administration/[id]/edit">, "params">) {
  await requirePermission("administration.update");
  const { id } = await params;
  return <AdministratorForm administrator={await orNotFound(administrationService.get(id))} />;
}
