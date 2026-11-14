import "server-only";

import { emptyToNull } from "@/lib/validation";
import { createContentService } from "@/server/core/content";
import { defineResource } from "@/server/core/resource";
import { administratorSchema, type Administrator, type AdministratorFormValues } from "../schemas";

type AdministratorWrite = Omit<Administrator, "id" | "createdAt" | "updatedAt">;

export const administratorsResource = defineResource<
  Administrator,
  AdministratorWrite,
  AdministratorWrite
>({
  name: "administrators",
  entity: administratorSchema,
  searchable: ["name", "position"],
  sortable: ["name", "position", "sortOrder", "createdAt"],
  defaultSort: [
    { field: "sortOrder", direction: "asc" },
    { field: "name", direction: "asc" },
  ],
  softDelete: true,
});

const crud = createContentService(administratorsResource, "administration");

const toWrite = (v: AdministratorFormValues): AdministratorWrite => ({
  name: v.name,
  position: v.position,
  photoUrl: emptyToNull(v.photoUrl),
  sortOrder: v.sortOrder,
});

export const administrationService = {
  ...crud,
  create: (values: AdministratorFormValues) => crud.create(toWrite(values)),
  update: (id: string, values: AdministratorFormValues) => crud.update(id, toWrite(values)),
};
