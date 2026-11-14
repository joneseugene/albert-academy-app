import { Suspense } from "react";
import type { Metadata } from "next";
import { PencilIcon } from "lucide-react";

import { FormSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";
import { LeaderForm } from "@/features/leadership/components/leader-form";
import { leadershipService } from "@/features/leadership/server/service";
import { orNotFound } from "@/server/core/page-data";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "Edit leader" };

export default function Page({ params }: PageProps<"/admin/leadership/[id]/edit">) {
  return (
    <>
      <PageHeader
        title="Edit leader"
        icon={PencilIcon}
        back={{ href: routes.leadership, label: "Leadership" }}
      />
      <Suspense fallback={<FormSkeleton />}>
        <EditForm params={params} />
      </Suspense>
    </>
  );
}

async function EditForm({ params }: Pick<PageProps<"/admin/leadership/[id]/edit">, "params">) {
  await requirePermission("leadership.update");
  const { id } = await params;
  return <LeaderForm leader={await orNotFound(leadershipService.get(id))} />;
}
