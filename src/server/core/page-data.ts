import "server-only";
import { notFound } from "next/navigation";

import { AppError } from "./errors";

/** For pages: a missing (or soft-deleted) record renders the 404 page instead of an error. */
export async function orNotFound<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof AppError && error.code === "NOT_FOUND") notFound();
    throw error;
  }
}
