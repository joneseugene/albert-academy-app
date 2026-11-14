import { z } from "zod";

import { imageUrlSchema, requiredText } from "@/lib/validation";

export const administratorSchema = z.object({
  id: z.string(),
  name: z.string(),
  position: z.string(),
  photoUrl: z.string().nullable(),
  sortOrder: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Administrator = z.infer<typeof administratorSchema>;

export const administratorFormSchema = z.object({
  name: requiredText(150),
  position: requiredText(150),
  photoUrl: imageUrlSchema,
  sortOrder: z.number({ error: "Enter a number" }).int().min(0).max(9999),
});
export type AdministratorFormValues = z.infer<typeof administratorFormSchema>;

export const updateAdministratorSchema = administratorFormSchema.extend({
  id: z.string().min(1),
});
