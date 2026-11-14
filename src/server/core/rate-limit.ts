import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";

import { backend } from "@/server/backend";
import { AppError } from "./errors";
import { logger } from "./logger";

/**
 * Per-IP limits for public, abuse-prone actions. Fixed windows, counted in
 * the shared store (all app instances see the same numbers). Each account
 * also has its own lockout after repeated wrong passwords.
 */
export const RATE_LIMITS = {
  /** Sign-in attempts, any accounts. */
  signIn: { limit: 20, windowSeconds: 15 * 60 },
  /** "Forgot password" requests from one network. */
  resetRequest: { limit: 10, windowSeconds: 15 * 60 },
  /** Codes emailed to one address (keyed by the address), so inboxes can't be flooded. */
  resetRequestEmail: { limit: 3, windowSeconds: 15 * 60 },
  /** Code checks from one network. */
  resetConfirm: { limit: 20, windowSeconds: 15 * 60 },
  /** Contact-form enquiries from one network. */
  enquiry: { limit: 5, windowSeconds: 60 * 60 },
} as const;

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Throws RATE_LIMITED when this IP (or `key`, e.g. an email address) is over
 * the limit for `name`.
 */
export async function enforceRateLimit(name: keyof typeof RATE_LIMITS, key?: string) {
  const { limit, windowSeconds } = RATE_LIMITS[name];
  // Only a hash of the IP / key is stored.
  const ipHash = createHash("sha256")
    .update(key?.trim().toLowerCase() ?? (await clientIp()))
    .digest("hex")
    .slice(0, 32);

  let result;
  try {
    result = await backend.rateLimits.hit(`${name}:${ipHash}`, limit, windowSeconds);
  } catch (error) {
    // Fail open: the per-account lockout still protects passwords.
    logger.error("Rate limit check failed", {
      name,
      message: error instanceof Error ? error.message : String(error),
    });
    return;
  }

  if (!result.allowed) {
    const minutes = Math.max(1, Math.ceil(result.retryAfterSeconds / 60));
    logger.warn("Rate limit hit", { name, ipHash });
    throw new AppError(
      "RATE_LIMITED",
      key
        ? `Too many requests. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`
        : `Too many attempts from your network. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    );
  }
}
