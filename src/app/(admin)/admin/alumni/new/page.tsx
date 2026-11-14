import { Suspense } from "react";
import type { Metadata } from "next";
import { StarIcon } from "lucide-react";

import { FormSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";
import { AlumnusForm } from "@/features/alumni/components/alumnus-form";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "Add alumnus" };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Add alumnus"
        icon={StarIcon}
        back={{ href: routes.alumni, label: "Notable Alumni" }}
      />
      <Suspense fallback={<FormSkeleton />}>
        <Guarded />
      </Suspense>
    </>
  );
}

async function Guarded() {
  await requirePermission("alumni.create");
  return <AlumnusForm />;
}
