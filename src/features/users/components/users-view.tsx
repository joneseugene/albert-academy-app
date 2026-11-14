"use client";

import { NewButton } from "@/components/shared/crud/new-button";
import { useCrudActions } from "@/components/shared/crud/use-crud-actions";
import { DataView, type DataColumn } from "@/components/shared/data-view";
import type { Option } from "@/components/shared/options";
import { RelativeTime } from "@/components/shared/relative-time";
import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/routes";
import { USER_STATUSES } from "@/lib/auth/access";
import type { Paginated } from "@/lib/data/query";
import { useCurrentUser } from "@/providers/session-provider";
import { deleteUserAction } from "../actions";
import { USER_STATUS_LABELS, type User } from "../schemas";

const columns: DataColumn<User>[] = [
  {
    id: "firstName",
    header: "Name",
    sortable: true,
    hideInCard: true,
    cell: (u) => (
      <span className="flex items-center gap-3">
        <UserAvatar firstName={u.firstName} lastName={u.lastName} avatarUrl={u.avatarUrl} />
        <span className="flex min-w-0 flex-col">
          <span className="truncate">
            {u.firstName} {u.lastName}
          </span>
          <span className="truncate text-xs font-normal text-muted-foreground">{u.email}</span>
        </span>
      </span>
    ),
  },
  {
    id: "role",
    header: "Role",
    cell: (u) =>
      u.roleName ? (
        <Badge variant="outline">{u.roleName}</Badge>
      ) : (
        <span className="text-muted-foreground">No role</span>
      ),
  },
  {
    id: "status",
    header: "Status",
    sortable: true,
    hideInCard: true,
    cell: (u) => <StatusBadge status={u.status} />,
  },
  {
    id: "lastLoginAt",
    header: "Last sign-in",
    sortable: true,
    cell: (u) => <RelativeTime value={u.lastLoginAt} fallback="Never" />,
  },
];

export function UsersView({ data, roleOptions }: { data: Paginated<User>; roleOptions: Option[] }) {
  const me = useCurrentUser();
  const { actions, dialogs } = useCrudActions<User>({
    basePath: routes.users,
    module: "users",
    remove: deleteUserAction,
    noun: "user",
    getId: (u) => u.id,
    getLabel: (u) => `${u.firstName} ${u.lastName}`,
  });
  // You can't delete yourself.
  const rowActions = actions.map((a) =>
    a.id === "delete" ? { ...a, hidden: (u: User) => u.id === me.id } : a,
  );

  return (
    <>
      <DataView
        data={data}
        columns={columns}
        card={{
          title: (u) => `${u.firstName} ${u.lastName}`,
          subtitle: (u) => u.email,
          badge: (u) => <StatusBadge status={u.status} />,
        }}
        getRowId={(u) => u.id}
        rowHref={(u) => `${routes.users}/${u.id}/edit`}
        actions={rowActions}
        searchPlaceholder="Search name or email…"
        filters={[
          {
            id: "status",
            label: "Statuses",
            options: USER_STATUSES.map((s) => ({ value: s, label: USER_STATUS_LABELS[s] })),
          },
          { id: "role", label: "Roles", options: roleOptions },
        ]}
        emptyTitle="No users yet"
        emptyDescription="Add the people who manage the school website."
        toolbar={
          <NewButton href={`${routes.users}/new`} label="Add user" permission="users.create" />
        }
      />
      {dialogs}
    </>
  );
}
