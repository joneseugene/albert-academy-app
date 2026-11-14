"use client";

import { NewButton } from "@/components/shared/crud/new-button";
import { useCrudActions } from "@/components/shared/crud/use-crud-actions";
import { DataView, type DataColumn } from "@/components/shared/data-view";
import { Thumbnail } from "@/components/shared/thumbnail";
import { routes } from "@/config/routes";
import type { Paginated } from "@/lib/data/query";
import { deleteAlumnusAction } from "../actions";
import { lateLabel, type Alumnus } from "../schemas";

const dash = null;

const columns: DataColumn<Alumnus>[] = [
  {
    id: "name",
    header: "Name",
    sortable: true,
    hideInCard: true,
    cell: (a) => (
      <span className="flex items-center gap-3">
        <Thumbnail
          src={a.photoUrl}
          alt=""
          className={a.isDeceased ? "rounded-full grayscale" : "rounded-full"}
        />
        <span className="flex min-w-0 flex-col">
          <span className="truncate">
            {a.name}
            {a.isDeceased && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">{lateLabel(a)}</span>
            )}
          </span>
          {a.nickname && (
            <span className="truncate text-xs font-normal text-muted-foreground">
              &ldquo;{a.nickname}&rdquo;
            </span>
          )}
        </span>
      </span>
    ),
  },
  { id: "classYear", header: "Class", sortable: true, cell: (a) => a.classYear ?? dash },
  {
    id: "position",
    header: "Position",
    cell: (a) => <span className="line-clamp-1 max-w-xs">{a.position ?? dash}</span>,
  },
  { id: "sortOrder", header: "Order", sortable: true, cell: (a) => a.sortOrder },
];

export function AlumniView({ data }: { data: Paginated<Alumnus> }) {
  const { actions, dialogs } = useCrudActions<Alumnus>({
    basePath: routes.alumni,
    module: "alumni",
    remove: deleteAlumnusAction,
    noun: "alumnus",
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
        rowHref={(a) => `${routes.alumni}/${a.id}/edit`}
        actions={actions}
        searchPlaceholder="Search name, nickname, class…"
        emptyTitle="No notable alumni yet"
        emptyDescription="Add old students the school is proud of."
        toolbar={
          <NewButton href={`${routes.alumni}/new`} label="Add alumnus" permission="alumni.create" />
        }
      />
      {dialogs}
    </>
  );
}
