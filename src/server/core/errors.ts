import "server-only";
import { z } from "zod";

import type { ActionError, ErrorCode, FieldErrors } from "@/lib/data/result";

/**
 * The only error type that crosses layer boundaries. Adapters translate
 * vendor errors (PostgREST codes, HTTP statuses, ...) into AppError so the
 * rest of the app never sees backend-specific errors.
 */
export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly options: { fieldErrors?: FieldErrors; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "AppError";
  }

  static validation(message = "Invalid input", fieldErrors?: FieldErrors) {
    return new AppError("VALIDATION", message, { fieldErrors });
  }
  static unauthenticated(message = "You must be signed in") {
    return new AppError("UNAUTHENTICATED", message);
  }
  static forbidden(message = "You do not have permission to do this") {
    return new AppError("FORBIDDEN", message);
  }
  static notFound(message = "Not found") {
    return new AppError("NOT_FOUND", message);
  }
  static conflict(message = "This conflicts with existing data") {
    return new AppError("CONFLICT", message);
  }
  static internal(message = "Something went wrong", cause?: unknown) {
    return new AppError("INTERNAL", message, { cause });
  }
}

export function fieldErrorsFromZod(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_root";
    (out[key] ??= []).push(issue.message);
  }
  return out;
}

/** Convert anything thrown into a client-safe ActionError (no stack/internals leak). */
export function toActionError(error: unknown): ActionError {
  if (error instanceof AppError) {
    return {
      code: error.code,
      // Internal messages may contain vendor details; keep them server-side.
      message: error.code === "INTERNAL" ? "Something went wrong" : error.message,
      fieldErrors: error.options.fieldErrors,
    };
  }
  if (error instanceof z.ZodError) {
    return { code: "VALIDATION", message: "Invalid input", fieldErrors: fieldErrorsFromZod(error) };
  }
  return { code: "INTERNAL", message: "Something went wrong" };
}
