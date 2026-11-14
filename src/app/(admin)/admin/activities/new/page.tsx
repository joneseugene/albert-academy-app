import { Suspense } from "react";
import type { Metadata } from "next";
import { CalendarRangeIcon } from "lucide-react";

import { FormSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";
import { ActivityForm } from "@/features/activities/components/activity-form";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "Add activity" };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Add activity"
        icon={CalendarRangeIcon}
        back={{ href: routes.activities, label: "Activities" }}
      />
      <Suspense fallback={<FormSkeleton />}>
        <Guarded />
      </Suspense>
    </>
  );
}

async function Guarded() {
  await requirePermission("activities.create");
  return <ActivityForm />;
}
