import "server-only";

import { toDateSpan } from "@/lib/date-span";
import { emptyToNull } from "@/lib/validation";
import { createContentService } from "@/server/core/content";
import { defineResource } from "@/server/core/resource";
import { activitySchema, type Activity, type ActivityFormValues } from "../schemas";

type ActivityWrite = Omit<Activity, "id" | "createdAt" | "updatedAt">;

export const activitiesResource = defineResource<Activity, ActivityWrite, ActivityWrite>({
  name: "activities",
  entity: activitySchema,
  searchable: ["title", "description"],
  sortable: ["title", "category", "startDate", "endDate", "createdAt"],
  filterable: ["category"],
  defaultSort: [{ field: "startDate", direction: "desc" }],
  softDelete: true,
});

const crud = createContentService(activitiesResource, "activities");

const toWrite = (v: ActivityFormValues): ActivityWrite => {
  const span = toDateSpan(v.when);
  return {
    title: v.title,
    category: v.category,
    description: emptyToNull(v.description),
    photoUrl: emptyToNull(v.photoUrl),
    datePrecision: span.precision ?? "day",
    startDate: span.start!,
    endDate: span.end,
  };
};

export const activitiesService = {
  ...crud,
  create: (values: ActivityFormValues) => crud.create(toWrite(values)),
  update: (id: string, values: ActivityFormValues) => crud.update(id, toWrite(values)),
};
