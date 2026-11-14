import { z } from "zod";

import { dateSpanSchema, datePrecisionSchema, formatDateSpan } from "@/lib/date-span";
import { richText } from "@/lib/rich-text";
import { imageUrlSchema, requiredText } from "@/lib/validation";

/** Activity categories. Add one here to offer it everywhere (forms, filters, badges). */
export const ACTIVITY_CATEGORIES = {
  academic: "Academic",
  sports: "Sports",
  entertainment: "Entertainment",
  cultural: "Cultural",
  religious: "Religious",
  clubs: "Clubs & Societies",
  community: "Community Service",
  other: "Other",
} as const;
export type ActivityCategory = keyof typeof ACTIVITY_CATEGORIES;
const CATEGORY_KEYS = Object.keys(ACTIVITY_CATEGORIES) as [ActivityCategory, ...ActivityCategory[]];

export const categoryLabel = (key: string) => ACTIVITY_CATEGORIES[key as ActivityCategory] ?? key;

export const activitySchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  description: z.string().nullable(),
  photoUrl: z.string().nullable(),
  /** "day": exact dates; "year": whole years (start 1 Jan, end 31 Dec). */
  datePrecision: datePrecisionSchema.default("day"),
  /** YYYY-MM-DD */
  startDate: z.string(),
  /** YYYY-MM-DD; null = a one-day activity. */
  endDate: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Activity = z.infer<typeof activitySchema>;

export const activityFormSchema = z.object({
  title: requiredText(200),
  category: z.enum(CATEGORY_KEYS, { error: "Choose a category" }),
  description: richText(5000),
  photoUrl: imageUrlSchema,
  /** Single date, date range, year or year range. */
  when: dateSpanSchema(),
});
export type ActivityFormValues = z.infer<typeof activityFormSchema>;

export const updateActivitySchema = activityFormSchema.extend({ id: z.string().min(1) });

/** "12–14 Mar 2026", "2019", "2019 – 2021"… */
export const activityPeriod = (a: Pick<Activity, "datePrecision" | "startDate" | "endDate">) =>
  formatDateSpan({ precision: a.datePrecision, start: a.startDate, end: a.endDate });

/** Upcoming / ongoing / ended, relative to today. */
export function activityStatus(a: Pick<Activity, "startDate" | "endDate">, today = isoToday()) {
  const end = a.endDate ?? a.startDate;
  if (a.startDate > today) return "upcoming" as const;
  if (end < today) return "ended" as const;
  return "ongoing" as const;
}

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}
