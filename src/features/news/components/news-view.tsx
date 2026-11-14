"use client";

import { useCrudActions } from "@/components/shared/crud/use-crud-actions";
import { NewButton } from "@/components/shared/crud/new-button";
import { DataView, type DataColumn } from "@/components/shared/data-view";
import { RelativeTime } from "@/components/shared/relative-time";
import { StatusBadge } from "@/components/shared/status-badge";
import { Thumbnail } from "@/components/shared/thumbnail";
import { routes } from "@/config/routes";
import type { Paginated } from "@/lib/data/query";
import { formatDate } from "@/lib/format";
import { htmlToText } from "@/lib/rich-text";
import { deleteNewsAction } from "../actions";
import { NEWS_STATUS_LABELS, NEWS_STATUSES, type News } from "../schemas";

const columns: DataColumn<News>[] = [
  {
    id: "title",
    header: "Article",
    sortable: true,
    hideInCard: true,
    cell: (n) => (
      <span className="flex items-center gap-3">
        <Thumbnail src={n.photoUrl} alt="" className="h-10 w-14" />
        <span className="flex min-w-0 flex-col">
          <span className="max-w-md truncate">{n.title}</span>
          {n.summary && (
            <span className="max-w-md truncate text-xs font-normal text-muted-foreground">
              {htmlToText(n.summary)}
            </span>
          )}
        </span>
      </span>
    ),
  },
  {
    id: "status",
    header: "Status",
    sortable: true,
    hideInCard: true,
    cell: (n) => <StatusBadge status={n.status} />,
  },
  {
    id: "publishedAt",
    header: "Published",
    sortable: true,
    cell: (n) => formatDate(n.publishedAt),
  },
  {
    id: "updatedAt",
    header: "Last edited",
    sortable: true,
    cell: (n) => <RelativeTime value={n.updatedAt} />,
  },
];

export function NewsView({ data }: { data: Paginated<News> }) {
  const { actions, dialogs } = useCrudActions<News>({
    basePath: routes.news,
    module: "news",
    remove: deleteNewsAction,
    noun: "article",
    getId: (n) => n.id,
    getLabel: (n) => n.title,
  });

  return (
    <>
      <DataView
        data={data}
        columns={columns}
        card={{
          title: (n) => n.title,
          subtitle: (n) => htmlToText(n.summary),
          badge: (n) => <StatusBadge status={n.status} />,
        }}
        getRowId={(n) => n.id}
        rowHref={(n) => `${routes.news}/${n.id}/edit`}
        actions={actions}
        searchPlaceholder="Search articles…"
        filters={[
          {
            id: "status",
            label: "Statuses",
            options: NEWS_STATUSES.map((s) => ({ value: s, label: NEWS_STATUS_LABELS[s] })),
          },
        ]}
        emptyTitle="No news yet"
        emptyDescription="Write the first article for the school website."
        toolbar={
          <NewButton href={`${routes.news}/new`} label="New article" permission="news.create" />
        }
      />
      {dialogs}
    </>
  );
}
