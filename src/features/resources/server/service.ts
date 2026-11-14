import "server-only";

import { emptyToNull } from "@/lib/validation";
import { createContentService } from "@/server/core/content";
import { defineResource } from "@/server/core/resource";
import { resourceSchema, type AcademicResource, type ResourceFormValues } from "../schemas";

type ResourceWrite = Omit<AcademicResource, "id" | "createdAt" | "updatedAt">;

export const academicResourcesResource = defineResource<
  AcademicResource,
  ResourceWrite,
  ResourceWrite
>({
  name: "academic_resources",
  entity: resourceSchema,
  searchable: ["title", "description", "url"],
  sortable: ["title", "createdAt", "updatedAt"],
  defaultSort: [{ field: "createdAt", direction: "desc" }],
  softDelete: true,
});

const crud = createContentService(academicResourcesResource, "resources");

const toWrite = (v: ResourceFormValues): ResourceWrite => ({
  title: v.title,
  description: emptyToNull(v.description),
  url: v.url,
  photoUrl: emptyToNull(v.photoUrl),
});

export const resourcesService = {
  ...crud,
  create: (values: ResourceFormValues) => crud.create(toWrite(values)),
  update: (id: string, values: ResourceFormValues) => crud.update(id, toWrite(values)),
};
