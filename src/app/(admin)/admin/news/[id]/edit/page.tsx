import { Suspense } from "react";
import type { Metadata } from "next";
import { PencilIcon } from "lucide-react";

import { FormSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";
import { NewsForm } from "@/features/news/components/news-form";
import { newsService } from "@/features/news/server/service";
import { requirePermission } from "@/server/auth/session";
import { orNotFound } from "@/server/core/page-data";

export const metadata: Metadata = { title: "Edit article" };

export default function EditNewsPage({ params }: PageProps<"/admin/news/[id]/edit">) {
  return (
    <>
      <PageHeader
        title="Edit article"
        icon={PencilIcon}
        back={{ href: routes.news, label: "News" }}
      />
      <Suspense fallback={<FormSkeleton />}>
        <EditForm params={params} />
      </Suspense>
    </>
  );
}

async function EditForm({ params }: Pick<PageProps<"/admin/news/[id]/edit">, "params">) {
  await requirePermission("news.update");
  const { id } = await params;
  return <NewsForm news={await orNotFound(newsService.get(id))} />;
}
