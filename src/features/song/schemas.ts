import { z } from "zod";

import { optionalText } from "@/lib/validation";

export const songSchema = z.object({
  songTitle: z.string().nullable(),
  songCredits: z.string().nullable(),
  songAudioUrl: z.string().nullable(),
  songLyrics: z.string().nullable(),
});
export type Song = z.infer<typeof songSchema>;

export const songFormSchema = z.object({
  songTitle: optionalText(150),
  songCredits: optionalText(300),
  songAudioUrl: z.string().trim().max(1000),
  songVerses: z.array(z.object({ text: optionalText(4000) })).max(30, "At most 30 verses"),
  songChorus: optionalText(4000),
  /** true: chorus after every verse; false: once, after the last verse. */
  songRepeatChorus: z.boolean(),
  /** Seconds per sung line (from "Sync lyrics"); [] = not synced. */
  songTimings: z.array(z.number().min(0).nullable()).max(2000),
});
export type SongFormValues = z.infer<typeof songFormSchema>;

export const AUDIO_ACCEPT =
  "audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/aac,audio/ogg,audio/wav,audio/webm";
export const MAX_AUDIO_BYTES = 30 * 1024 * 1024;

export const audioUploadSchema = z.object({
  fileName: z.string().max(300),
  contentType: z.string().regex(/^audio\//, "Choose an audio file"),
  size: z.number().int().positive().max(MAX_AUDIO_BYTES, "Use a file under 30 MB"),
});
