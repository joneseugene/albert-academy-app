import "server-only";
import { randomUUID } from "node:crypto";
import { updateTag } from "next/cache";

import { PUBLIC_CACHE_TAG } from "@/lib/cache-tags";
import { draftLines, serializeLyrics } from "@/lib/lyrics";
import { emptyToNull } from "@/lib/validation";
import { assertPermission } from "@/server/auth/session";
import { backend } from "@/server/backend";
import { AppError } from "@/server/core/errors";
import { defineResource } from "@/server/core/resource";
import { songSchema, type Song, type SongFormValues } from "../schemas";

/** The song lives on the single school_info row (id = 1). */
const songResource = defineResource<Song, never, Song>({
  name: "school_info",
  entity: songSchema,
  adapters: {
    supabase: { select: "song_title, song_credits, song_audio_url, song_lyrics" },
  },
});

const EXTENSIONS: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/aac": "aac",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/webm": "webm",
};

export const songService = {
  async get(): Promise<Song> {
    await assertPermission("school.read");
    const song = await backend.repository(songResource).getById("1");
    if (!song) throw AppError.internal("school_info row is missing. Run the migrations");
    return song;
  },

  async update(v: SongFormValues) {
    await assertPermission("school.update");
    const lines = draftLines({
      verses: v.songVerses.map((verse) => verse.text),
      chorus: v.songChorus,
      repeatChorus: v.songRepeatChorus,
    });
    // Timings belong to one exact line order; drop them if the lyrics changed shape.
    const times = v.songTimings.length === lines.length ? v.songTimings : undefined;
    await backend.repository(songResource).update("1", {
      songTitle: emptyToNull(v.songTitle),
      songCredits: emptyToNull(v.songCredits),
      songAudioUrl: emptyToNull(v.songAudioUrl),
      songLyrics: lines.length ? serializeLyrics(lines, times) : null,
    });
    updateTag(PUBLIC_CACHE_TAG);
  },

  /** A one-time URL for the browser to upload the recording to directly. */
  async createUpload(contentType: string) {
    await assertPermission("school.update");
    const ext = EXTENSIONS[contentType];
    if (!ext) throw AppError.validation("Use an MP3, M4A, AAC, OGG, WAV or WebM audio file");
    return backend.files.createAudioUpload(`song/${randomUUID()}.${ext}`);
  },
};
