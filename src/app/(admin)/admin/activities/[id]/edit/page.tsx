import { Suspense } from "react";
import type { Metadata } from "next";
import { PencilIcon } from "lucide-react";

import { FormSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";
import { ActivityForm } from "@/features/activities/components/activity-form";
import { activitiesService } from "@/features/activities/server/service";
import { orNotFound } from "@/server/core/page-data";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "Edit activity" };

export default function Page({ params }: PageProps<"/admin/activities/[id]/edit">) {
  return (
    <>
      <PageHeader
        title="Edit activity"
        icon={PencilIcon}
        back={{ href: routes.activities, label: "Activities" }}
      />
      <Suspense fallback={<FormSkeleton />}>
        <EditForm params={params} />
      </Suspense>
    </>
  );
}

async function EditForm({ params }: Pick<PageProps<"/admin/activities/[id]/edit">, "params">) {
  await requirePermission("activities.update");
  const { id } = await params;
  return <ActivityForm activity={await orNotFound(activitiesService.get(id))} />;
}
