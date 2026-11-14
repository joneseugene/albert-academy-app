import { Suspense } from "react";
import type { Metadata } from "next";
import { PencilIcon } from "lucide-react";

import { FormSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";
import { NoticeForm } from "@/features/notices/components/notice-form";
import { noticesService } from "@/features/notices/server/service";
import { requirePermission } from "@/server/auth/session";
import { orNotFound } from "@/server/core/page-data";

export const metadata: Metadata = { title: "Edit notice" };

export default function EditNoticePage({ params }: PageProps<"/admin/notices/[id]/edit">) {
  return (
    <>
      <PageHeader
        title="Edit notice"
        icon={PencilIcon}
        back={{ href: routes.notices, label: "Public Notices" }}
      />
      <Suspense fallback={<FormSkeleton />}>
        <EditForm params={params} />
      </Suspense>
    </>
  );
}

async function EditForm({ params }: Pick<PageProps<"/admin/notices/[id]/edit">, "params">) {
  await requirePermission("notices.update");
  const { id } = await params;
  return <NoticeForm notice={await orNotFound(noticesService.get(id))} />;
}
