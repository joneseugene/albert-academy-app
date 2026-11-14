import { Suspense } from "react";
import type { Metadata } from "next";
import { NewspaperIcon } from "lucide-react";

import { FormSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";
import { NewsForm } from "@/features/news/components/news-form";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "New article" };

export default function NewNewsPage() {
  return (
    <>
      <PageHeader
        title="New article"
        icon={NewspaperIcon}
        back={{ href: routes.news, label: "News" }}
      />
      <Suspense fallback={<FormSkeleton />}>
        <Guarded />
      </Suspense>
    </>
  );
}

async function Guarded() {
  await requirePermission("news.create");
  return <NewsForm />;
}
