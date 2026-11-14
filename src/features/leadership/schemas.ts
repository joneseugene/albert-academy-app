import { z } from "zod";

import { richText } from "@/lib/rich-text";
import { imageUrlSchema, optionalYearSchema, requiredText, yearSchema } from "@/lib/validation";

export const leaderSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** e.g. "Principal", "Acting Principal". */
  title: z.string(),
  photoUrl: z.string().nullable(),
  fromYear: z.number(),
  /** Null while in office. */
  toYear: z.number().nullable(),
  summary: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Leader = z.infer<typeof leaderSchema>;

export const LEADER_TERMS = ["current", "past"] as const;
export type LeaderTerm = (typeof LEADER_TERMS)[number];
export const LEADER_TERM_LABELS: Record<LeaderTerm, string> = {
  current: "Current",
  past: "Past",
};
export const termOf = (leader: Pick<Leader, "toYear">): LeaderTerm =>
  leader.toYear === null ? "current" : "past";

export const leaderFormSchema = z
  .object({
    name: requiredText(150),
    title: requiredText(100),
    photoUrl: imageUrlSchema,
    fromYear: yearSchema,
    toYear: optionalYearSchema,
    summary: richText(2000),
  })
  .refine((v) => v.toYear == null || v.toYear >= v.fromYear, {
    path: ["toYear"],
    message: "Must be the same as or after the start year",
  });
export type LeaderFormValues = z.input<typeof leaderFormSchema>;
export type LeaderFormOutput = z.output<typeof leaderFormSchema>;

export const updateLeaderSchema = leaderFormSchema.and(z.object({ id: z.string().min(1) }));
