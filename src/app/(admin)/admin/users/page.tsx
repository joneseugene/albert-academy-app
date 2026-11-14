import { Suspense } from "react";
import type { Metadata } from "next";
import { UsersIcon } from "lucide-react";

import { ListSkeleton } from "@/components/layout/list-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { UsersView } from "@/features/users/components/users-view";
import { usersService } from "@/features/users/server/service";
import type { Filter } from "@/lib/data/query";
import { loadListWithFilters, toListQuery } from "@/lib/data/search-params";
import { requirePermission } from "@/server/auth/session";

export const metadata: Metadata = { title: "Users" };

export default function UsersPage({ searchParams }: PageProps<"/admin/users">) {
  return (
    <>
      <PageHeader title="Users" description="Who can sign in to this console" icon={UsersIcon} />
      <Suspense fallback={<ListSkeleton />}>
        <UsersList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function UsersList({ searchParams }: Pick<PageProps<"/admin/users">, "searchParams">) {
  await requirePermission("users.read");
  const { list, filters } = await loadListWithFilters(searchParams, ["status", "role"]);
  const queryFilters: Filter[] = [];
  if (filters.status) queryFilters.push({ field: "status", op: "eq", value: filters.status });
  if (filters.role) queryFilters.push({ field: "roleId", op: "eq", value: filters.role });

  const [data, roles] = await Promise.all([
    usersService.list(toListQuery(list, { filters: queryFilters })),
    usersService.roleChoices(),
  ]);
  return <UsersView data={data} roleOptions={roles.map((r) => ({ value: r.id, label: r.name }))} />;
}
