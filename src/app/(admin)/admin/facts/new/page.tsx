import { Suspense } from "react";
import type { Metadata } from "next";
import { LightbulbIcon } from "lucide-react";

import { FormSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";
import { FactForm } from "@/features/facts/components/fact-form";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "Add fact" };

export default function NewFactPage() {
  return (
    <>
      <PageHeader
        title="Add fact"
        icon={LightbulbIcon}
        back={{ href: routes.facts, label: "Did You Know?" }}
      />
      <Suspense fallback={<FormSkeleton />}>
        <Guarded />
      </Suspense>
    </>
  );
}

async function Guarded() {
  await requirePermission("facts.create");
  return <FactForm />;
}
