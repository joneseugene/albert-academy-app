import "server-only";

import { emptyToNull } from "@/lib/validation";
import { createContentService } from "@/server/core/content";
import { defineResource } from "@/server/core/resource";
import { alumnusSchema, type Alumnus, type AlumnusFormValues } from "../schemas";

type AlumnusWrite = Omit<Alumnus, "id" | "createdAt" | "updatedAt">;

export const alumniResource = defineResource<Alumnus, AlumnusWrite, AlumnusWrite>({
  name: "notable_alumni",
  entity: alumnusSchema,
  searchable: ["name", "nickname", "classYear", "position"],
  sortable: ["name", "classYear", "isDeceased", "sortOrder", "createdAt", "updatedAt"],
  filterable: ["isDeceased"],
  defaultSort: [
    { field: "sortOrder", direction: "asc" },
    { field: "name", direction: "asc" },
  ],
  softDelete: true,
});

const crud = createContentService(alumniResource, "alumni");

const toWrite = (v: AlumnusFormValues): AlumnusWrite => ({
  name: v.name,
  nickname: emptyToNull(v.nickname),
  classYear: emptyToNull(v.classYear),
  position: emptyToNull(v.position),
  summary: emptyToNull(v.summary),
  detail: emptyToNull(v.detail),
  photoUrl: emptyToNull(v.photoUrl),
  sortOrder: v.sortOrder,
  isDeceased: v.isDeceased,
  deathYear: v.isDeceased ? v.deathYear : null,
});

export const alumniService = {
  ...crud,
  create: (values: AlumnusFormValues) => crud.create(toWrite(values)),
  update: (id: string, values: AlumnusFormValues) => crud.update(id, toWrite(values)),
};
