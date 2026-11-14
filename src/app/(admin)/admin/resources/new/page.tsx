import { Suspense } from "react";
import type { Metadata } from "next";
import { BookOpenIcon } from "lucide-react";

import { FormSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";
import { ResourceForm } from "@/features/resources/components/resource-form";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "Add resource" };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Add resource"
        icon={BookOpenIcon}
        back={{ href: routes.resources, label: "Academic Resources" }}
      />
      <Suspense fallback={<FormSkeleton />}>
        <Guarded />
      </Suspense>
    </>
  );
}

async function Guarded() {
  await requirePermission("resources.create");
  return <ResourceForm />;
}
