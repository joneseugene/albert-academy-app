"use client";

import { EyeIcon, EyeOffIcon, MegaphoneIcon } from "lucide-react";

import { NewButton } from "@/components/shared/crud/new-button";
import { useCrudActions } from "@/components/shared/crud/use-crud-actions";
import { DataView, type DataColumn } from "@/components/shared/data-view";
import { RelativeTime } from "@/components/shared/relative-time";
import { StatusBadge } from "@/components/shared/status-badge";
import { routes } from "@/config/routes";
import { useServerMutation } from "@/hooks/use-server-action";
import type { Paginated } from "@/lib/data/query";
import { formatStreamTime } from "@/lib/livestream";
import { deleteNoticeAction, setNoticePublishedAction } from "../actions";
import { BANNER_STATES, bannerState, type Notice } from "../schemas";

const published = (n: Notice) => (
  <StatusBadge
    status={n.isPublished ? "published" : "draft"}
    label={n.isPublished ? "Published" : "Draft"}
  />
);

function bannerCell(n: Notice) {
  const state = bannerState(n, new Date());
  const tone = { showing: "ongoing", scheduled: "upcoming", ended: "ended", off: "hidden" }[state];
  const until = state === "showing" && n.bannerUntil ? formatStreamTime(n.bannerUntil) : null;
  return (
    <span className="grid gap-0.5">
      <StatusBadge status={tone} label={BANNER_STATES[state]} />
      {until && <span className="text-xs text-muted-foreground">until {until}</span>}
    </span>
  );
}

const columns: DataColumn<Notice>[] = [
  {
    id: "title",
    header: "Notice",
    sortable: true,
    hideInCard: true,
    cell: (n) => (
      <span className="flex items-center gap-2">
        <MegaphoneIcon className="size-4 shrink-0 text-primary" aria-hidden />
        <span className="line-clamp-1 max-w-md font-medium">{n.title}</span>
      </span>
    ),
  },
  { id: "isPublished", header: "Status", sortable: true, hideInCard: true, cell: published },
  { id: "bannerUntil", header: "Pop-up", sortable: true, cell: bannerCell },
  {
    id: "publishedAt",
    header: "Published",
    sortable: true,
    cell: (n) => <RelativeTime value={n.publishedAt} />,
  },
];

export function NoticesView({ data }: { data: Paginated<Notice> }) {
  const toggle = useServerMutation(setNoticePublishedAction, {
    successMessage: (_, { isPublished }) =>
      isPublished ? "Notice published" : "Notice unpublished",
  });

  const { actions, dialogs } = useCrudActions<Notice>({
    basePath: routes.notices,
    module: "notices",
    remove: deleteNoticeAction,
    noun: "notice",
    getId: (n) => n.id,
    getLabel: (n) => n.title,
    extra: [
      {
        id: "unpublish",
        label: "Unpublish",
        icon: EyeOffIcon,
        permission: "notices.update",
        hidden: (n) => !n.isPublished,
        onSelect: (n) => toggle.mutate({ id: n.id, isPublished: false }),
      },
      {
        id: "publish",
        label: "Publish",
        icon: EyeIcon,
        permission: "notices.update",
        hidden: (n) => n.isPublished,
        onSelect: (n) => toggle.mutate({ id: n.id, isPublished: true }),
      },
    ],
  });

  return (
    <>
      <DataView
        data={data}
        columns={columns}
        card={{
          title: (n) => n.title,
          subtitle: (n) => BANNER_STATES[bannerState(n, new Date())],
          badge: published,
        }}
        getRowId={(n) => n.id}
        rowHref={(n) => `${routes.notices}/${n.id}/edit`}
        actions={actions}
        searchPlaceholder="Search notices…"
        filters={[
          {
            id: "status",
            label: "Status",
            options: [
              { value: "published", label: "Published" },
              { value: "draft", label: "Draft" },
            ],
          },
        ]}
        emptyTitle="No notices yet"
        emptyDescription="Post announcements for parents, students and the public."
        toolbar={
          <NewButton
            href={`${routes.notices}/new`}
            label="Add notice"
            permission="notices.create"
          />
        }
      />
      {dialogs}
    </>
  );
}
