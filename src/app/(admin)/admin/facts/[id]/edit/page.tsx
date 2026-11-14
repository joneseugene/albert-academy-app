import { Suspense } from "react";
import type { Metadata } from "next";
import { PencilIcon } from "lucide-react";

import { FormSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";
import { FactForm } from "@/features/facts/components/fact-form";
import { factsService } from "@/features/facts/server/service";
import { requirePermission } from "@/server/auth/session";
import { orNotFound } from "@/server/core/page-data";

export const metadata: Metadata = { title: "Edit fact" };

export default function EditFactPage({ params }: PageProps<"/admin/facts/[id]/edit">) {
  return (
    <>
      <PageHeader
        title="Edit fact"
        icon={PencilIcon}
        back={{ href: routes.facts, label: "Did You Know?" }}
      />
      <Suspense fallback={<FormSkeleton />}>
        <EditForm params={params} />
      </Suspense>
    </>
  );
}

async function EditForm({ params }: Pick<PageProps<"/admin/facts/[id]/edit">, "params">) {
  await requirePermission("facts.update");
  const { id } = await params;
  return <FactForm fact={await orNotFound(factsService.get(id))} />;
}
