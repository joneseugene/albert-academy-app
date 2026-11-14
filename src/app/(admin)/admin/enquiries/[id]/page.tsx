import { Suspense } from "react";
import type { Metadata } from "next";
import { InboxIcon } from "lucide-react";

import { FormSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";
import { EnquiryDetail } from "@/features/enquiries/components/enquiry-detail";
import { enquiriesService } from "@/features/enquiries/server/service";
import { hasPermission } from "@/lib/auth/access";
import { getCurrentUser, requirePermission } from "@/server/auth/session";
import { orNotFound } from "@/server/core/page-data";

export const metadata: Metadata = { title: "Enquiry" };

export default function EnquiryPage({ params }: PageProps<"/admin/enquiries/[id]">) {
  return (
    <>
      <PageHeader
        title="Enquiry"
        icon={InboxIcon}
        back={{ href: routes.enquiries, label: "Enquiries" }}
      />
      <Suspense fallback={<FormSkeleton />}>
        <Detail params={params} />
      </Suspense>
    </>
  );
}

async function Detail({ params }: Pick<PageProps<"/admin/enquiries/[id]">, "params">) {
  await requirePermission("enquiries.read");
  const { id } = await params;
  let enquiry = await orNotFound(enquiriesService.get(id));
  // Opening a new enquiry marks it as read (for staff who may update it).
  const user = await getCurrentUser();
  if (enquiry.status === "new" && user && hasPermission(user, "enquiries.update")) {
    enquiry = await enquiriesService.setStatus(id, "read");
  }
  return <EnquiryDetail enquiry={enquiry} />;
}
