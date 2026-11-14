import { Suspense } from "react";
import type { Metadata } from "next";
import { SchoolIcon } from "lucide-react";

import { FormSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { SchoolInfoForm } from "@/features/school/components/school-info-form";
import { schoolService } from "@/features/school/server/service";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "School info" };

export default function SchoolPage() {
  return (
    <>
      <PageHeader
        title="School Info"
        description="Vision, mission, about, contacts and social media"
        icon={SchoolIcon}
      />
      <Suspense fallback={<FormSkeleton />}>
        <SchoolDetails />
      </Suspense>
    </>
  );
}

async function SchoolDetails() {
  await requirePermission("school.read");
  return <SchoolInfoForm info={await schoolService.get()} />;
}
