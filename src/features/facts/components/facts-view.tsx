"use client";

import { EyeIcon, EyeOffIcon, LightbulbIcon } from "lucide-react";

import { NewButton } from "@/components/shared/crud/new-button";
import { useCrudActions } from "@/components/shared/crud/use-crud-actions";
import { DataView, type DataColumn } from "@/components/shared/data-view";
import { RelativeTime } from "@/components/shared/relative-time";
import { StatusBadge } from "@/components/shared/status-badge";
import { routes } from "@/config/routes";
import { useServerMutation } from "@/hooks/use-server-action";
import type { Paginated } from "@/lib/data/query";
import { deleteFactAction, setFactPublishedAction } from "../actions";
import { FACT_VISIBILITY, visibilityOf, type Fact } from "../schemas";

const badge = (f: Fact) => (
  <StatusBadge status={visibilityOf(f)} label={FACT_VISIBILITY[visibilityOf(f)]} />
);

const columns: DataColumn<Fact>[] = [
  {
    id: "fact",
    header: "Fact",
    hideInCard: true,
    cell: (f) => (
      <span className="flex items-start gap-2">
        <LightbulbIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <span className="line-clamp-2 max-w-xl whitespace-normal">{f.fact}</span>
      </span>
    ),
  },
  { id: "isPublished", header: "On website", sortable: true, hideInCard: true, cell: badge },
  { id: "sortOrder", header: "Order", sortable: true, cell: (f) => f.sortOrder },
  {
    id: "updatedAt",
    header: "Last edited",
    sortable: true,
    cell: (f) => <RelativeTime value={f.updatedAt} />,
  },
];

export function FactsView({ data }: { data: Paginated<Fact> }) {
  const toggle = useServerMutation(setFactPublishedAction, {
    successMessage: (_, { isPublished }) =>
      isPublished ? "Fact shown on the website" : "Fact hidden from the website",
  });

  const { actions, dialogs } = useCrudActions<Fact>({
    basePath: routes.facts,
    module: "facts",
    remove: deleteFactAction,
    noun: "fact",
    getId: (f) => f.id,
    getLabel: (f) => (f.fact.length > 80 ? `${f.fact.slice(0, 80)}…` : f.fact),
    extra: [
      {
        id: "hide",
        label: "Hide from website",
        icon: EyeOffIcon,
        permission: "facts.update",
        hidden: (f) => !f.isPublished,
        onSelect: (f) => toggle.mutate({ id: f.id, isPublished: false }),
      },
      {
        id: "show",
        label: "Show on website",
        icon: EyeIcon,
        permission: "facts.update",
        hidden: (f) => f.isPublished,
        onSelect: (f) => toggle.mutate({ id: f.id, isPublished: true }),
      },
    ],
  });

  return (
    <>
      <DataView
        data={data}
        columns={columns}
        card={{
          title: (f) => <span className="line-clamp-3 whitespace-normal">{f.fact}</span>,
          badge,
        }}
        getRowId={(f) => f.id}
        rowHref={(f) => `${routes.facts}/${f.id}/edit`}
        actions={actions}
        searchPlaceholder="Search facts…"
        filters={[
          {
            id: "visibility",
            label: "Visibility",
            options: Object.entries(FACT_VISIBILITY).map(([value, label]) => ({ value, label })),
          },
        ]}
        emptyTitle="No facts yet"
        emptyDescription="Add short facts the public might like to know about Albert Academy."
        toolbar={
          <NewButton href={`${routes.facts}/new`} label="Add fact" permission="facts.create" />
        }
      />
      {dialogs}
    </>
  );
}
