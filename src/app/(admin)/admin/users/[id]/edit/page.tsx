import { Suspense } from "react";
import type { Metadata } from "next";
import { PencilIcon } from "lucide-react";

import { FormSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";
import { UserForm } from "@/features/users/components/user-form";
import { usersService } from "@/features/users/server/service";
import { requirePermission } from "@/server/auth/session";
import { orNotFound } from "@/server/core/page-data";

export const metadata: Metadata = { title: "Edit user" };

export default function EditUserPage({ params }: PageProps<"/admin/users/[id]/edit">) {
  return (
    <>
      <PageHeader
        title="Edit user"
        icon={PencilIcon}
        back={{ href: routes.users, label: "Users" }}
      />
      <Suspense fallback={<FormSkeleton />}>
        <EditForm params={params} />
      </Suspense>
    </>
  );
}

async function EditForm({ params }: Pick<PageProps<"/admin/users/[id]/edit">, "params">) {
  await requirePermission("users.update");
  const { id } = await params;
  const [user, roles] = await Promise.all([
    orNotFound(usersService.get(id)),
    usersService.roleChoices(),
  ]);
  return <UserForm user={user} roles={roles} />;
}
