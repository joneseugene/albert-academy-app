"use server";

import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { idSchema } from "@/lib/validation";
import { defineAction } from "@/server/core/action";
import { galleryItemFormSchema, updateGalleryItemSchema } from "./schemas";
import { galleryService } from "./server/service";

export const createGalleryItemAction = defineAction({
  input: galleryItemFormSchema,
  handler: async (values) => {
    await galleryService.create(values);
    redirect(routes.gallery);
  },
});

export const updateGalleryItemAction = defineAction({
  input: updateGalleryItemSchema,
  handler: async ({ id, ...values }) => {
    await galleryService.update(id, values);
    redirect(routes.gallery);
  },
});

export const deleteGalleryItemAction = defineAction({
  input: idSchema,
  handler: ({ id }) => galleryService.remove(id),
  refresh: true,
});
