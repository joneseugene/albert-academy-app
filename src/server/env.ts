import "server-only";
import { z } from "zod";

/**
 * Server-only environment. Nothing here is ever sent to the browser.
 * Values are optional here and checked by the code that needs them
 * (`requireEnv`), so a missing variable fails with a clear message.
 */
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  /** Signs access tokens for native auth. ≥ 32 random chars. Rotating it signs everyone out. */
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters").optional(),

  // Supabase (data + file storage only; auth is native)
  SUPABASE_URL: z.url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Email (password-reset codes). Set SMTP_* or RESEND_API_KEY; see adapters/mail.
  EMAIL_FROM: z.string().min(3).optional(),
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASSWORD: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const serverEnv: ServerEnv = serverEnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  AUTH_SECRET: process.env.AUTH_SECRET || undefined,
  SUPABASE_URL: process.env.SUPABASE_URL || undefined,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || undefined,
  EMAIL_FROM: process.env.EMAIL_FROM || undefined,
  SMTP_HOST: process.env.SMTP_HOST || undefined,
  SMTP_PORT: process.env.SMTP_PORT || undefined,
  SMTP_USER: process.env.SMTP_USER || undefined,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || undefined,
  RESEND_API_KEY: process.env.RESEND_API_KEY || undefined,
});

/** Read a variable that is optional globally but required by the caller. */
export function requireEnv<K extends keyof ServerEnv>(
  key: K,
  context: string,
): NonNullable<ServerEnv[K]> {
  const value = serverEnv[key];
  if (value === undefined || value === null || value === "") {
    throw new Error(`Missing env ${String(key)} (required by ${context}). See .env.example.`);
  }
  return value as NonNullable<ServerEnv[K]>;
}
