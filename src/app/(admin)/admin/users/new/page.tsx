import { Suspense } from "react";
import type { Metadata } from "next";
import { UserPlusIcon } from "lucide-react";

import { FormSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";
import { UserForm } from "@/features/users/components/user-form";
import { usersService } from "@/features/users/server/service";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "Add user" };

export default function NewUserPage() {
  return (
    <>
      <PageHeader
        title="Add user"
        description="Create an account and set its first password"
        icon={UserPlusIcon}
        back={{ href: routes.users, label: "Users" }}
      />
      <Suspense fallback={<FormSkeleton />}>
        <Guarded />
      </Suspense>
    </>
  );
}

async function Guarded() {
  await requirePermission("users.create");
  return <UserForm roles={await usersService.roleChoices()} />;
}
