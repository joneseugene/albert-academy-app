/** Shared counters for rate limiting (must work across app instances). */
export interface RateLimitStore {
  /** Count one hit for `key`; allowed while hits ≤ `limit` within the window. */
  hit(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<{ allowed: boolean; retryAfterSeconds: number }>;
}
