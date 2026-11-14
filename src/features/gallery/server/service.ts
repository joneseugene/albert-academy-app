import "server-only";

import { emptyToNull } from "@/lib/validation";
import { createContentService } from "@/server/core/content";
import { defineResource } from "@/server/core/resource";
import { galleryItemSchema, type GalleryItem, type GalleryItemFormValues } from "../schemas";

type GalleryWrite = Omit<GalleryItem, "id" | "createdAt" | "updatedAt">;

export const galleryResource = defineResource<GalleryItem, GalleryWrite, GalleryWrite>({
  name: "gallery_items",
  entity: galleryItemSchema,
  searchable: ["title", "description"],
  sortable: ["title", "createdAt", "updatedAt"],
  defaultSort: [{ field: "createdAt", direction: "desc" }],
  softDelete: true,
});

const crud = createContentService(galleryResource, "gallery");

const toWrite = (v: GalleryItemFormValues): GalleryWrite => ({
  title: v.title,
  description: emptyToNull(v.description),
  photoUrl: v.photoUrl,
});

export const galleryService = {
  ...crud,
  create: (values: GalleryItemFormValues) => crud.create(toWrite(values)),
  update: (id: string, values: GalleryItemFormValues) => crud.update(id, toWrite(values)),
};
