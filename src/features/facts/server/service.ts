import "server-only";

import { createContentService } from "@/server/core/content";
import { defineResource } from "@/server/core/resource";
import { factSchema, type Fact, type FactFormValues } from "../schemas";

type FactWrite = Omit<Fact, "id" | "createdAt" | "updatedAt">;

export const factsResource = defineResource<Fact, FactWrite, Partial<FactWrite>>({
  name: "facts",
  entity: factSchema,
  searchable: ["fact"],
  sortable: ["fact", "sortOrder", "isPublished", "createdAt", "updatedAt"],
  filterable: ["isPublished"],
  defaultSort: [
    { field: "sortOrder", direction: "asc" },
    { field: "createdAt", direction: "desc" },
  ],
  softDelete: true,
});

const crud = createContentService(factsResource, "facts");

export const factsService = {
  ...crud,
  create: (values: FactFormValues) => crud.create(values),
  update: (id: string, values: FactFormValues) => crud.update(id, values),
  /** Show / hide on the website without opening the form. */
  setPublished: (id: string, isPublished: boolean) => crud.update(id, { isPublished }),
};
