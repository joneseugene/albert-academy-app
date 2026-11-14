import { Suspense } from "react";
import type { Metadata } from "next";
import { RadioIcon } from "lucide-react";

import { FormSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";
import { LivestreamForm } from "@/features/livestreams/components/livestream-form";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "Add live stream" };

export default function NewLivestreamPage() {
  return (
    <>
      <PageHeader
        title="Add live stream"
        icon={RadioIcon}
        back={{ href: routes.livestreams, label: "Live Streams" }}
      />
      <Suspense fallback={<FormSkeleton />}>
        <Guarded />
      </Suspense>
    </>
  );
}

async function Guarded() {
  await requirePermission("livestreams.create");
  return <LivestreamForm />;
}
