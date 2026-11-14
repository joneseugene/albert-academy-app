import { z } from "zod";

import { dateSpanSchema, datePrecisionSchema, formatDateSpan } from "@/lib/date-span";
import { formatDate } from "@/lib/format";
import { richText } from "@/lib/rich-text";
import { imageUrlSchema, requiredText } from "@/lib/validation";

export const NEWS_STATUSES = ["draft", "published"] as const;
export type NewsStatus = (typeof NEWS_STATUSES)[number];
export const NEWS_STATUS_LABELS: Record<NewsStatus, string> = {
  draft: "Draft",
  published: "Published",
};

/** A news article as stored. */
export const newsSchema = z.object({
  id: z.string(),
  title: z.string(),
  photoUrl: z.string().nullable(),
  summary: z.string().nullable(),
  content: z.string(),
  status: z.enum(NEWS_STATUSES),
  publishedAt: z.coerce.date().nullable(),
  /** When the story happened (optional): precision + YYYY-MM-DD dates. */
  eventPrecision: datePrecisionSchema.nullable().default(null),
  eventStart: z.string().nullable().default(null),
  eventEnd: z.string().nullable().default(null),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type News = z.infer<typeof newsSchema>;

export const newsFormSchema = z.object({
  title: requiredText(200),
  photoUrl: imageUrlSchema,
  summary: richText(500),
  content: richText(50_000, { required: true }),
  status: z.enum(NEWS_STATUSES),
  /** When it happened — optional ("none" = use the publish date). */
  when: dateSpanSchema({ optional: true }),
});
export type NewsFormValues = z.infer<typeof newsFormSchema>;

/** The date shown for an article: when it happened if set, otherwise when it was published. */
export const newsDate = (
  n: Pick<News, "eventPrecision" | "eventStart" | "eventEnd" | "publishedAt">,
) =>
  n.eventStart
    ? formatDateSpan({ precision: n.eventPrecision, start: n.eventStart, end: n.eventEnd })
    : formatDate(n.publishedAt);

export const updateNewsSchema = newsFormSchema.extend({ id: z.string().min(1) });
