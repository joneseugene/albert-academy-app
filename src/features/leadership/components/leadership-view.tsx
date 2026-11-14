"use client";

import { NewButton } from "@/components/shared/crud/new-button";
import { useCrudActions } from "@/components/shared/crud/use-crud-actions";
import { DataView, type DataColumn } from "@/components/shared/data-view";
import { StatusBadge } from "@/components/shared/status-badge";
import { Thumbnail } from "@/components/shared/thumbnail";
import { routes } from "@/config/routes";
import type { Paginated } from "@/lib/data/query";
import { htmlToText } from "@/lib/rich-text";
import { deleteLeaderAction } from "../actions";
import { LEADER_TERM_LABELS, LEADER_TERMS, termOf, type Leader } from "../schemas";

const period = (l: Leader) => `${l.fromYear}–${l.toYear ?? "present"}`;

const columns: DataColumn<Leader>[] = [
  {
    id: "name",
    header: "Name",
    sortable: true,
    hideInCard: true,
    cell: (l) => (
      <span className="flex items-center gap-3">
        <Thumbnail src={l.photoUrl} alt="" className="rounded-full" />
        <span className="flex min-w-0 flex-col">
          <span className="truncate">{l.name}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">{l.title}</span>
        </span>
      </span>
    ),
  },
  { id: "fromYear", header: "Period", sortable: true, cell: period },
  {
    id: "term",
    header: "Term",
    hideInCard: true,
    cell: (l) => <StatusBadge status={termOf(l)} />,
  },
  {
    id: "summary",
    header: "Summary",
    cell: (l) => (
      <span className="line-clamp-1 max-w-sm text-muted-foreground">{htmlToText(l.summary)}</span>
    ),
  },
];

export function LeadershipView({ data }: { data: Paginated<Leader> }) {
  const { actions, dialogs } = useCrudActions<Leader>({
    basePath: routes.leadership,
    module: "leadership",
    remove: deleteLeaderAction,
    noun: "leader",
    getId: (l) => l.id,
    getLabel: (l) => l.name,
  });

  return (
    <>
      <DataView
        data={data}
        columns={columns}
        card={{
          title: (l) => l.name,
          subtitle: (l) => l.title,
          badge: (l) => <StatusBadge status={termOf(l)} />,
        }}
        getRowId={(l) => l.id}
        rowHref={(l) => `${routes.leadership}/${l.id}/edit`}
        actions={actions}
        searchPlaceholder="Search name or title…"
        filters={[
          {
            id: "term",
            label: "Terms",
            options: LEADER_TERMS.map((t) => ({ value: t, label: LEADER_TERM_LABELS[t] })),
          },
        ]}
        emptyTitle="No leaders yet"
        emptyDescription="Add the current principal and those who came before."
        toolbar={
          <NewButton
            href={`${routes.leadership}/new`}
            label="Add leader"
            permission="leadership.create"
          />
        }
      />
      {dialogs}
    </>
  );
}
