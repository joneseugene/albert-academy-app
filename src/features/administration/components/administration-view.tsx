"use client";

import { NewButton } from "@/components/shared/crud/new-button";
import { useCrudActions } from "@/components/shared/crud/use-crud-actions";
import { DataView, type DataColumn } from "@/components/shared/data-view";
import { Thumbnail } from "@/components/shared/thumbnail";
import { routes } from "@/config/routes";
import type { Paginated } from "@/lib/data/query";
import { deleteAdministratorAction } from "../actions";
import type { Administrator } from "../schemas";

const columns: DataColumn<Administrator>[] = [
  {
    id: "name",
    header: "Name",
    sortable: true,
    hideInCard: true,
    cell: (a) => (
      <span className="flex items-center gap-3">
        <Thumbnail src={a.photoUrl} alt="" className="rounded-full" />
        <span className="truncate">{a.name}</span>
      </span>
    ),
  },
  { id: "position", header: "Position", sortable: true, cell: (a) => a.position },
  { id: "sortOrder", header: "Order", sortable: true, cell: (a) => a.sortOrder },
];

export function AdministrationView({ data }: { data: Paginated<Administrator> }) {
  const { actions, dialogs } = useCrudActions<Administrator>({
    basePath: routes.administration,
    module: "administration",
    remove: deleteAdministratorAction,
    noun: "staff member",
    getId: (a) => a.id,
    getLabel: (a) => a.name,
  });

  return (
    <>
      <DataView
        data={data}
        columns={columns}
        card={{ title: (a) => a.name, subtitle: (a) => a.position }}
        getRowId={(a) => a.id}
        rowHref={(a) => `${routes.administration}/${a.id}/edit`}
        actions={actions}
        searchPlaceholder="Search name or position…"
        emptyTitle="No administration staff yet"
        emptyDescription="Add the vice principals, bursar, registrar and others."
        toolbar={
          <NewButton
            href={`${routes.administration}/new`}
            label="Add staff member"
            permission="administration.create"
          />
        }
      />
      {dialogs}
    </>
  );
}
