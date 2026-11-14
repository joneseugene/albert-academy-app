"use client";

import { ExternalLinkIcon } from "lucide-react";

import { NewButton } from "@/components/shared/crud/new-button";
import { useCrudActions } from "@/components/shared/crud/use-crud-actions";
import { DataView, type DataColumn } from "@/components/shared/data-view";
import { RelativeTime } from "@/components/shared/relative-time";
import { Thumbnail } from "@/components/shared/thumbnail";
import { routes } from "@/config/routes";
import type { Paginated } from "@/lib/data/query";
import { htmlToText } from "@/lib/rich-text";
import { deleteResourceAction } from "../actions";
import type { AcademicResource } from "../schemas";

const hostOf = (url: string) => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

const columns: DataColumn<AcademicResource>[] = [
  {
    id: "title",
    header: "Resource",
    sortable: true,
    hideInCard: true,
    cell: (r) => (
      <span className="flex items-center gap-3">
        <Thumbnail src={r.photoUrl} alt="" className="bg-background object-contain p-1" />
        <span className="flex min-w-0 flex-col">
          <span className="max-w-md truncate">{r.title}</span>
          {r.description && (
            <span className="max-w-md truncate text-xs font-normal text-muted-foreground">
              {htmlToText(r.description)}
            </span>
          )}
        </span>
      </span>
    ),
  },
  {
    id: "url",
    header: "Link",
    cell: (r) => (
      <a
        href={r.url}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-1 text-primary hover:underline"
      >
        {hostOf(r.url)} <ExternalLinkIcon className="size-3" aria-hidden />
      </a>
    ),
  },
  {
    id: "updatedAt",
    header: "Last edited",
    sortable: true,
    cell: (r) => <RelativeTime value={r.updatedAt} />,
  },
];

export function ResourcesView({ data }: { data: Paginated<AcademicResource> }) {
  const { actions, dialogs } = useCrudActions<AcademicResource>({
    basePath: routes.resources,
    module: "resources",
    remove: deleteResourceAction,
    noun: "resource",
    getId: (r) => r.id,
    getLabel: (r) => r.title,
  });

  return (
    <>
      <DataView
        data={data}
        columns={columns}
        card={{ title: (r) => r.title, subtitle: (r) => htmlToText(r.description) }}
        getRowId={(r) => r.id}
        rowHref={(r) => `${routes.resources}/${r.id}/edit`}
        actions={actions}
        searchPlaceholder="Search resources…"
        emptyTitle="No academic resources yet"
        emptyDescription="Link past papers, syllabuses, reading lists and e-learning sites."
        toolbar={
          <NewButton
            href={`${routes.resources}/new`}
            label="Add resource"
            permission="resources.create"
          />
        }
      />
      {dialogs}
    </>
  );
}
