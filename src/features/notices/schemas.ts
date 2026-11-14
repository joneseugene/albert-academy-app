import { z } from "zod";

import { richText } from "@/lib/rich-text";
import { requiredText } from "@/lib/validation";

/** A public notice as stored. */
export const noticeSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  isPublished: z.boolean(),
  /** Pop up as a banner when the website loads. */
  showBanner: z.boolean(),
  /** Banner period (null = open-ended on that side). */
  bannerFrom: z.coerce.date().nullable(),
  bannerUntil: z.coerce.date().nullable(),
  publishedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Notice = z.infer<typeof noticeSchema>;

/** "" or "YYYY-MM-DDTHH:mm" from <input type="datetime-local"> (school time, GMT). */
const localDateTime = z
  .string()
  .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v), "Enter a date and time");

export const noticeFormSchema = z
  .object({
    title: requiredText(200),
    body: richText(20_000, { required: true }),
    isPublished: z.boolean(),
    showBanner: z.boolean(),
    bannerFrom: localDateTime,
    bannerUntil: localDateTime,
  })
  .refine((v) => !v.bannerFrom || !v.bannerUntil || v.bannerUntil > v.bannerFrom, {
    path: ["bannerUntil"],
    message: "Must be after the start",
  });
export type NoticeFormValues = z.infer<typeof noticeFormSchema>;

export const updateNoticeSchema = noticeFormSchema.and(z.object({ id: z.string().min(1) }));

/** Where a notice's pop-up banner stands at `now` (admin list + website). */
export function bannerState(
  n: Pick<Notice, "isPublished" | "showBanner" | "bannerFrom" | "bannerUntil">,
  now: Date,
) {
  if (!n.isPublished || !n.showBanner) return "off" as const;
  if (n.bannerFrom && n.bannerFrom > now) return "scheduled" as const;
  if (n.bannerUntil && n.bannerUntil < now) return "ended" as const;
  return "showing" as const;
}

export const BANNER_STATES = {
  showing: "Pop-up showing",
  scheduled: "Pop-up scheduled",
  ended: "Pop-up period ended",
  off: "No pop-up",
} as const;
