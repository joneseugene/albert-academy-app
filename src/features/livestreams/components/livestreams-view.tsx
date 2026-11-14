"use client";

import { CircleStopIcon, RadioIcon, RotateCcwIcon } from "lucide-react";

import { NewButton } from "@/components/shared/crud/new-button";
import { useCrudActions } from "@/components/shared/crud/use-crud-actions";
import { DataView, type DataColumn } from "@/components/shared/data-view";
import { StatusBadge } from "@/components/shared/status-badge";
import { PlatformMark } from "@/components/site/live-player";
import { routes } from "@/config/routes";
import { useServerMutation } from "@/hooks/use-server-action";
import type { Paginated } from "@/lib/data/query";
import { formatStreamTime, STREAM_PLATFORMS, STREAM_STATUSES } from "@/lib/livestream";
import { deleteLivestreamAction, setLivestreamStatusAction } from "../actions";
import type { Livestream } from "../schemas";

const badge = (s: Livestream) => (
  <StatusBadge status={s.status} label={STREAM_STATUSES[s.status]} />
);

const columns: DataColumn<Livestream>[] = [
  {
    id: "title",
    header: "Stream",
    sortable: true,
    hideInCard: true,
    cell: (s) => (
      <span className="flex items-center gap-2">
        <PlatformMark platform={s.platform} className="shrink-0" />
        <span className="line-clamp-1 max-w-md font-medium">{s.title}</span>
      </span>
    ),
  },
  { id: "status", header: "Status", sortable: true, hideInCard: true, cell: badge },
  {
    id: "startsAt",
    header: "Starts",
    sortable: true,
    cell: (s) => formatStreamTime(s.startsAt) ?? "",
  },
  {
    id: "isFeatured",
    header: "Home page",
    cell: (s) => (s.isFeatured ? "Announced" : ""),
  },
];

export function LivestreamsView({ data }: { data: Paginated<Livestream> }) {
  const setStatus = useServerMutation(setLivestreamStatusAction, {
    successMessage: (_, { status }) =>
      status === "live"
        ? "You're live on the website"
        : status === "ended"
          ? "Stream ended"
          : "Stream set to upcoming",
  });

  const { actions, dialogs } = useCrudActions<Livestream>({
    basePath: routes.livestreams,
    module: "livestreams",
    remove: deleteLivestreamAction,
    noun: "live stream",
    getId: (s) => s.id,
    getLabel: (s) => s.title,
    extra: [
      {
        id: "go-live",
        label: "Go live",
        icon: RadioIcon,
        permission: "livestreams.update",
        hidden: (s) => s.status === "live",
        onSelect: (s) => setStatus.mutate({ id: s.id, status: "live" }),
      },
      {
        id: "end",
        label: "End stream",
        icon: CircleStopIcon,
        permission: "livestreams.update",
        hidden: (s) => s.status !== "live",
        onSelect: (s) => setStatus.mutate({ id: s.id, status: "ended" }),
      },
      {
        id: "upcoming",
        label: "Mark as upcoming",
        icon: RotateCcwIcon,
        permission: "livestreams.update",
        hidden: (s) => s.status !== "ended",
        onSelect: (s) => setStatus.mutate({ id: s.id, status: "scheduled" }),
      },
    ],
  });

  return (
    <>
      <DataView
        data={data}
        columns={columns}
        card={{
          title: (s) => (
            <span className="flex items-center gap-2">
              <PlatformMark platform={s.platform} className="shrink-0" /> {s.title}
            </span>
          ),
          subtitle: (s) => formatStreamTime(s.startsAt) ?? STREAM_PLATFORMS[s.platform],
          badge,
        }}
        getRowId={(s) => s.id}
        rowHref={(s) => `${routes.livestreams}/${s.id}/edit`}
        actions={actions}
        searchPlaceholder="Search live streams…"
        filters={[
          {
            id: "status",
            label: "Status",
            options: Object.entries(STREAM_STATUSES).map(([value, label]) => ({ value, label })),
          },
          {
            id: "platform",
            label: "Platform",
            options: Object.entries(STREAM_PLATFORMS).map(([value, label]) => ({ value, label })),
          },
        ]}
        emptyTitle="No live streams yet"
        emptyDescription="Paste a YouTube or Facebook live link to show it on the website."
        toolbar={
          <NewButton
            href={`${routes.livestreams}/new`}
            label="Add live stream"
            permission="livestreams.create"
          />
        }
      />
      {dialogs}
    </>
  );
}
