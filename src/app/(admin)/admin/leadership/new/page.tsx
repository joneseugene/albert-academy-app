import { Suspense } from "react";
import type { Metadata } from "next";
import { CrownIcon } from "lucide-react";

import { FormSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";
import { LeaderForm } from "@/features/leadership/components/leader-form";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "Add leader" };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Add leader"
        icon={CrownIcon}
        back={{ href: routes.leadership, label: "Leadership" }}
      />
      <Suspense fallback={<FormSkeleton />}>
        <Guarded />
      </Suspense>
    </>
  );
}

async function Guarded() {
  await requirePermission("leadership.create");
  return <LeaderForm />;
}
