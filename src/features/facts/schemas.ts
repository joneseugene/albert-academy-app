import { z } from "zod";

/** Facts should read in one breath on the website. */
export const FACT_MAX_LENGTH = 280;

export const factSchema = z.object({
  id: z.string(),
  fact: z.string(),
  isPublished: z.boolean(),
  sortOrder: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Fact = z.infer<typeof factSchema>;

export const factFormSchema = z.object({
  fact: z
    .string()
    .trim()
    .min(1, "Write the fact")
    .max(FACT_MAX_LENGTH, `Keep it short: at most ${FACT_MAX_LENGTH} characters`),
  isPublished: z.boolean(),
  sortOrder: z.number({ error: "Enter a number" }).int().min(0).max(9999),
});
export type FactFormValues = z.infer<typeof factFormSchema>;

export const updateFactSchema = factFormSchema.extend({ id: z.string().min(1) });

export const FACT_VISIBILITY = { published: "Shown", hidden: "Hidden" } as const;
export const visibilityOf = (f: Pick<Fact, "isPublished">) =>
  f.isPublished ? ("published" as const) : ("hidden" as const);
