import { z } from "zod";

import { richText } from "@/lib/rich-text";
import { imageUrlSchema, optionalText, requiredText } from "@/lib/validation";

export const alumnusSchema = z.object({
  id: z.string(),
  name: z.string(),
  nickname: z.string().nullable(),
  /** Class / set, e.g. "2009/2010" or "Class of 1985" (free text: not every record has one). */
  classYear: z.string().nullable(),
  position: z.string().nullable(),
  summary: z.string().nullable(),
  detail: z.string().nullable(),
  photoUrl: z.string().nullable(),
  /** Late (deceased): photos show in grey scale on the website. */
  isDeceased: z.boolean().default(false),
  deathYear: z.number().nullable().default(null),
  sortOrder: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Alumnus = z.infer<typeof alumnusSchema>;

export const alumnusFormSchema = z.object({
  name: requiredText(150),
  nickname: optionalText(100),
  classYear: optionalText(50),
  position: optionalText(200),
  summary: richText(600),
  detail: richText(20_000),
  photoUrl: imageUrlSchema,
  sortOrder: z.number({ error: "Enter a number" }).int().min(0).max(9999),
  isDeceased: z.boolean(),
  /** Optional; ignored (saved empty) unless the person is marked late. */
  deathYear: z
    .number({ error: "Enter a year" })
    .int("Enter a whole year")
    .min(1800, "Enter a year from 1800")
    .max(2100, "Enter a real year")
    .nullable(),
});
export type AlumnusFormValues = z.infer<typeof alumnusFormSchema>;

export const updateAlumnusSchema = alumnusFormSchema.extend({ id: z.string().min(1) });

/** "Late" or "Late · died 1998". */
export const lateLabel = (a: Pick<Alumnus, "isDeceased" | "deathYear">) =>
  a.isDeceased ? (a.deathYear ? `Late · died ${a.deathYear}` : "Late") : null;
