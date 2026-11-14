import { z } from "zod";

import { parseStreamUrl, STREAM_STATUSES, type StreamStatus } from "@/lib/livestream";
import { richText } from "@/lib/rich-text";
import { imageUrlSchema, requiredText } from "@/lib/validation";

const STATUS_KEYS = Object.keys(STREAM_STATUSES) as [StreamStatus, ...StreamStatus[]];

/** A live stream as stored. */
export const livestreamSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  platform: z.enum(["youtube", "facebook"]),
  sourceUrl: z.string(),
  status: z.enum(STATUS_KEYS),
  startsAt: z.coerce.date().nullable(),
  endsAt: z.coerce.date().nullable(),
  photoUrl: z.string().nullable(),
  /** Announce it on the home page while upcoming or live. */
  isFeatured: z.boolean(),
  /** Keep it on the website as a replay after it ends. */
  showReplay: z.boolean(),
  autoplay: z.boolean(),
  startMuted: z.boolean(),
  showControls: z.boolean(),
  showChat: z.boolean(),
  privacyMode: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Livestream = z.infer<typeof livestreamSchema>;

/** "" or "YYYY-MM-DDTHH:mm" from <input type="datetime-local"> (school time). */
const localDateTime = z
  .string()
  .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v), "Enter a date and time");

export const livestreamFormSchema = z
  .object({
    title: requiredText(200),
    sourceUrl: z
      .string()
      .trim()
      .max(1000)
      .superRefine((v, ctx) => {
        const parsed = parseStreamUrl(v);
        if (!parsed.ok) ctx.addIssue({ code: "custom", message: parsed.error });
      }),
    status: z.enum(STATUS_KEYS),
    startsAt: localDateTime,
    endsAt: localDateTime,
    description: richText(5000),
    photoUrl: imageUrlSchema,
    isFeatured: z.boolean(),
    showReplay: z.boolean(),
    autoplay: z.boolean(),
    startMuted: z.boolean(),
    showControls: z.boolean(),
    showChat: z.boolean(),
    privacyMode: z.boolean(),
  })
  .refine((v) => v.status !== "scheduled" || v.startsAt !== "", {
    path: ["startsAt"],
    message: "Set the start time for an upcoming stream",
  })
  .refine((v) => !v.startsAt || !v.endsAt || v.endsAt > v.startsAt, {
    path: ["endsAt"],
    message: "Must be after the start time",
  });
export type LivestreamFormValues = z.infer<typeof livestreamFormSchema>;

export const updateLivestreamSchema = livestreamFormSchema.and(z.object({ id: z.string().min(1) }));

/** Live first, then upcoming (soonest first), then replays (newest first). */
export function sortStreams<T extends Pick<Livestream, "status" | "startsAt" | "createdAt">>(
  streams: T[],
) {
  const rank = { live: 0, scheduled: 1, ended: 2 } as const;
  const time = (s: T) => (s.startsAt ?? s.createdAt).getTime();
  return [...streams].sort(
    (a, b) =>
      rank[a.status] - rank[b.status] ||
      (a.status === "ended" ? time(b) - time(a) : time(a) - time(b)),
  );
}
