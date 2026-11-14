import { Suspense } from "react";
import type { Metadata } from "next";
import { MegaphoneIcon } from "lucide-react";

import { FormSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";
import { NoticeForm } from "@/features/notices/components/notice-form";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "Add notice" };

export default function NewNoticePage() {
  return (
    <>
      <PageHeader
        title="Add notice"
        icon={MegaphoneIcon}
        back={{ href: routes.notices, label: "Public Notices" }}
      />
      <Suspense fallback={<FormSkeleton />}>
        <Guarded />
      </Suspense>
    </>
  );
}

async function Guarded() {
  await requirePermission("notices.create");
  return <NoticeForm />;
}
