import "server-only";

import { AppError } from "@/server/core/errors";

type PostgrestLikeError = { code?: string; message: string; details?: string | null };
type AuthLikeError = { code?: string; status?: number; message: string };

/** Translate PostgREST / Postgres errors into AppError. */
export function fromPostgrestError(error: PostgrestLikeError): AppError {
  switch (error.code) {
    case "PGRST116": // .single() found no rows
      return AppError.notFound();
    case "23505": // unique_violation
      return AppError.conflict("A record with these details already exists");
    case "TP409": // app-defined conflict raised by our triggers (message is user-safe)
      return AppError.conflict(error.message);
    case "23503": // foreign_key_violation
      return AppError.conflict("This record is referenced by other data");
    case "23502": // not_null_violation
    case "23514": // check_violation
    case "22P02": // invalid_text_representation (e.g. bad uuid)
      return AppError.validation(error.message);
    case "42501": // insufficient_privilege (RLS)
    case "PGRST301": // JWT invalid
      return AppError.forbidden();
    default:
      return AppError.internal("Database request failed", error);
  }
}

/** Translate Supabase Auth errors into AppError. */
export function fromAuthError(error: AuthLikeError): AppError {
  switch (error.code) {
    case "invalid_credentials":
      return new AppError("UNAUTHENTICATED", "Invalid email or password");
    case "email_not_confirmed":
      return new AppError("UNAUTHENTICATED", "Please confirm your email address first");
    case "user_banned":
      return AppError.forbidden("This account has been deactivated");
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return new AppError("RATE_LIMITED", "Too many attempts. Please try again later");
    case "weak_password":
      return AppError.validation(error.message, { password: [error.message] });
    case "email_exists":
    case "user_already_exists":
      return AppError.conflict("A user with this email already exists");
    default:
      if (error.status === 401) return AppError.unauthenticated();
      if (error.status === 403) return AppError.forbidden();
      return AppError.internal("Authentication request failed", error);
  }
}
