"use client";

import { NewButton } from "@/components/shared/crud/new-button";
import { useCrudActions } from "@/components/shared/crud/use-crud-actions";
import { DataView, type DataColumn } from "@/components/shared/data-view";
import { StatusBadge } from "@/components/shared/status-badge";
import { Thumbnail } from "@/components/shared/thumbnail";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/routes";
import type { Paginated } from "@/lib/data/query";
import { deleteActivityAction } from "../actions";
import {
  ACTIVITY_CATEGORIES,
  activityPeriod,
  activityStatus,
  categoryLabel,
  type Activity,
} from "../schemas";

const period = (a: Activity) => activityPeriod(a);

const columns: DataColumn<Activity>[] = [
  {
    id: "title",
    header: "Activity",
    sortable: true,
    hideInCard: true,
    cell: (a) => (
      <span className="flex items-center gap-3">
        <Thumbnail src={a.photoUrl} alt="" className="h-10 w-14" />
        <span className="max-w-md truncate">{a.title}</span>
      </span>
    ),
  },
  {
    id: "category",
    header: "Category",
    sortable: true,
    cell: (a) => <Badge variant="outline">{categoryLabel(a.category)}</Badge>,
  },
  { id: "startDate", header: "Period", sortable: true, cell: period },
  {
    id: "status",
    header: "Status",
    hideInCard: true,
    cell: (a) => <StatusBadge status={activityStatus(a)} />,
  },
];

export function ActivitiesView({ data }: { data: Paginated<Activity> }) {
  const { actions, dialogs } = useCrudActions<Activity>({
    basePath: routes.activities,
    module: "activities",
    remove: deleteActivityAction,
    noun: "activity",
    getId: (a) => a.id,
    getLabel: (a) => a.title,
  });

  return (
    <>
      <DataView
        data={data}
        columns={columns}
        card={{
          title: (a) => a.title,
          subtitle: period,
          badge: (a) => <StatusBadge status={activityStatus(a)} />,
        }}
        getRowId={(a) => a.id}
        rowHref={(a) => `${routes.activities}/${a.id}/edit`}
        actions={actions}
        searchPlaceholder="Search activities…"
        filters={[
          {
            id: "category",
            label: "Categories",
            options: Object.entries(ACTIVITY_CATEGORIES).map(([value, label]) => ({
              value,
              label,
            })),
          },
        ]}
        emptyTitle="No activities yet"
        emptyDescription="Add sports meets, debates, cultural days, exams and more."
        toolbar={
          <NewButton
            href={`${routes.activities}/new`}
            label="Add activity"
            permission="activities.create"
          />
        }
      />
      {dialogs}
    </>
  );
}
