"use client";

import { NewButton } from "@/components/shared/crud/new-button";
import { useCrudActions } from "@/components/shared/crud/use-crud-actions";
import { DataView, type DataColumn } from "@/components/shared/data-view";
import { RelativeTime } from "@/components/shared/relative-time";
import { Thumbnail } from "@/components/shared/thumbnail";
import { routes } from "@/config/routes";
import type { Paginated } from "@/lib/data/query";
import { htmlToText } from "@/lib/rich-text";
import { deleteGalleryItemAction } from "../actions";
import type { GalleryItem } from "../schemas";

const columns: DataColumn<GalleryItem>[] = [
  {
    id: "title",
    header: "Photo",
    sortable: true,
    hideInCard: true,
    cell: (g) => (
      <span className="flex items-center gap-3">
        <Thumbnail src={g.photoUrl} alt="" className="h-12 w-16" />
        <span className="flex min-w-0 flex-col">
          <span className="max-w-md truncate">{g.title}</span>
          {g.description && (
            <span className="max-w-md truncate text-xs font-normal text-muted-foreground">
              {htmlToText(g.description)}
            </span>
          )}
        </span>
      </span>
    ),
  },
  {
    id: "createdAt",
    header: "Added",
    sortable: true,
    cell: (g) => <RelativeTime value={g.createdAt} />,
  },
];

export function GalleryView({ data }: { data: Paginated<GalleryItem> }) {
  const { actions, dialogs } = useCrudActions<GalleryItem>({
    basePath: routes.gallery,
    module: "gallery",
    remove: deleteGalleryItemAction,
    noun: "photo",
    getId: (g) => g.id,
    getLabel: (g) => g.title,
  });

  return (
    <>
      <DataView
        data={data}
        columns={columns}
        card={{
          title: (g) => (
            <span className="flex items-center gap-3">
              <Thumbnail src={g.photoUrl} alt="" className="h-12 w-16" />
              <span className="truncate">{g.title}</span>
            </span>
          ),
          subtitle: (g) => htmlToText(g.description),
        }}
        getRowId={(g) => g.id}
        rowHref={(g) => `${routes.gallery}/${g.id}/edit`}
        actions={actions}
        searchPlaceholder="Search photos…"
        emptyTitle="The gallery is empty"
        emptyDescription="Add photos from school life: events, sports and ceremonies."
        toolbar={
          <NewButton href={`${routes.gallery}/new`} label="Add photo" permission="gallery.create" />
        }
      />
      {dialogs}
    </>
  );
}
