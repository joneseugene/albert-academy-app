import { z } from "zod";

import { richText } from "@/lib/rich-text";
import { imageUrlSchema, requiredText, urlSchema } from "@/lib/validation";

export const resourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  url: z.string(),
  photoUrl: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type AcademicResource = z.infer<typeof resourceSchema>;

export const resourceFormSchema = z.object({
  title: requiredText(200),
  description: richText(2000),
  url: urlSchema,
  photoUrl: imageUrlSchema,
});
export type ResourceFormValues = z.infer<typeof resourceFormSchema>;

export const updateResourceSchema = resourceFormSchema.extend({ id: z.string().min(1) });
