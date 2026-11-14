import "server-only";

import { AppError } from "@/server/core/errors";
import { logger } from "@/server/core/logger";
import type { FileStore } from "@/server/ports/files";
import type { RateLimitStore } from "@/server/ports/rate-limits";
import { getSupabaseClient } from "./client";
import { fromPostgrestError } from "./errors";

/** Public bucket created by the migrations (images only). */
const BUCKET = "media";
const PUBLIC_MARKER = `/storage/v1/object/public/${BUCKET}/`;
/** Public bucket for audio (the school song), up to 30 MB. */
const AUDIO_BUCKET = "audio";

export const supabaseFileStore: FileStore = {
  async upload(key, bytes, contentType) {
    const storage = getSupabaseClient().storage.from(BUCKET);
    const { error } = await storage.upload(key, bytes, {
      contentType,
      cacheControl: "31536000", // keys are never reused
      upsert: false,
    });
    if (error) throw AppError.internal("Upload failed", error);
    return storage.getPublicUrl(key).data.publicUrl;
  },

  async remove(url) {
    const index = url.indexOf(PUBLIC_MARKER);
    if (index < 0) return; // not ours
    const key = decodeURIComponent(url.slice(index + PUBLIC_MARKER.length));
    const { error } = await getSupabaseClient().storage.from(BUCKET).remove([key]);
    // An orphaned image is harmless; never fail the user's action over it.
    if (error) logger.warn("Could not delete stored file", { key, message: error.message });
  },

  async createAudioUpload(key) {
    const storage = getSupabaseClient().storage.from(AUDIO_BUCKET);
    const { data, error } = await storage.createSignedUploadUrl(key);
    if (error || !data) throw AppError.internal("Could not prepare the upload", error);
    return { uploadUrl: data.signedUrl, publicUrl: storage.getPublicUrl(key).data.publicUrl };
  },
};

export const supabaseRateLimitStore: RateLimitStore = {
  async hit(key, limit, windowSeconds) {
    const { data, error } = await getSupabaseClient()
      .rpc("hit_rate_limit", { p_key: key, p_limit: limit, p_window_seconds: windowSeconds })
      .single<{ allowed: boolean; retry_after_seconds: number }>();
    if (error || !data) throw fromPostgrestError(error ?? { message: "No rate limit result" });
    return { allowed: data.allowed, retryAfterSeconds: data.retry_after_seconds };
  },
};
