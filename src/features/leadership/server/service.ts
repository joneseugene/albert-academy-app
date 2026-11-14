import "server-only";

import { emptyToNull } from "@/lib/validation";
import { createContentService } from "@/server/core/content";
import { defineResource } from "@/server/core/resource";
import { leaderSchema, type Leader, type LeaderFormOutput } from "../schemas";

type LeaderWrite = Omit<Leader, "id" | "createdAt" | "updatedAt">;

export const leadersResource = defineResource<Leader, LeaderWrite, LeaderWrite>({
  name: "leaders",
  entity: leaderSchema,
  searchable: ["name", "title"],
  sortable: ["name", "fromYear", "toYear", "createdAt"],
  filterable: ["toYear"],
  defaultSort: [{ field: "fromYear", direction: "desc" }],
  softDelete: true,
});

const crud = createContentService(leadersResource, "leadership");

const toWrite = (v: LeaderFormOutput): LeaderWrite => ({
  name: v.name,
  title: v.title,
  photoUrl: emptyToNull(v.photoUrl),
  fromYear: v.fromYear,
  toYear: v.toYear ?? null,
  summary: emptyToNull(v.summary),
});

export const leadershipService = {
  ...crud,
  create: (values: LeaderFormOutput) => crud.create(toWrite(values)),
  update: (id: string, values: LeaderFormOutput) => crud.update(id, toWrite(values)),
};
