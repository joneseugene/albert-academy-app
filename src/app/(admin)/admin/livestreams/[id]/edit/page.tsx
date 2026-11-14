import { Suspense } from "react";
import type { Metadata } from "next";
import { PencilIcon } from "lucide-react";

import { FormSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";
import { LivestreamForm } from "@/features/livestreams/components/livestream-form";
import { livestreamsService } from "@/features/livestreams/server/service";
import { requirePermission } from "@/server/auth/session";
import { orNotFound } from "@/server/core/page-data";

export const metadata: Metadata = { title: "Edit live stream" };

export default function EditLivestreamPage({ params }: PageProps<"/admin/livestreams/[id]/edit">) {
  return (
    <>
      <PageHeader
        title="Edit live stream"
        icon={PencilIcon}
        back={{ href: routes.livestreams, label: "Live Streams" }}
      />
      <Suspense fallback={<FormSkeleton />}>
        <EditForm params={params} />
      </Suspense>
    </>
  );
}

async function EditForm({ params }: Pick<PageProps<"/admin/livestreams/[id]/edit">, "params">) {
  await requirePermission("livestreams.update");
  const { id } = await params;
  return <LivestreamForm stream={await orNotFound(livestreamsService.get(id))} />;
}
