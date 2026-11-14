import { z } from "zod";

import { richText } from "@/lib/rich-text";
import { requiredText } from "@/lib/validation";

export const galleryItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  photoUrl: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type GalleryItem = z.infer<typeof galleryItemSchema>;

export const galleryItemFormSchema = z.object({
  title: requiredText(200),
  description: richText(2000),
  /** A gallery entry is a photo, so it's required here. */
  photoUrl: z.string().trim().min(1, "Upload a photo").max(1000),
});
export type GalleryItemFormValues = z.infer<typeof galleryItemFormSchema>;

export const updateGalleryItemSchema = galleryItemFormSchema.extend({ id: z.string().min(1) });
