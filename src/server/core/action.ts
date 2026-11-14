import "server-only";
import { refresh, revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import type { z } from "zod";

import type { Permission } from "@/config/permissions";
import type { CurrentUser } from "@/lib/auth/access";
import type { ActionResult } from "@/lib/data/result";
import { assertPermission, assertUser } from "@/server/auth/session";
import { AppError, toActionError } from "./errors";
import { logger } from "./logger";

type Schema = z.ZodType | undefined;
type ParsedInput<S extends Schema> = S extends z.ZodType ? z.output<S> : undefined;
type RawInput<S extends Schema> = S extends z.ZodType ? z.input<S> : void;

type ActionContext<Public extends boolean> = {
  user: Public extends true ? CurrentUser | null : CurrentUser;
};

type ActionConfig<S extends Schema, TOut, Public extends boolean> = {
  /** Zod schema for the input. Validation errors become field errors on the client. */
  input?: S;
  /** Skip the session check (login, password reset, ...). Default false. */
  public?: Public;
  /** All listed permissions are required. */
  permissions?: Permission[];
  handler: (input: ParsedInput<S>, ctx: ActionContext<Public>) => Promise<TOut>;
  /** Paths to revalidate after success. */
  revalidatePaths?: string[];
  /** Refresh the client router after success (re-renders server components). */
  refresh?: boolean;
};

/**
 * Build a server action with auth, permission, validation and error handling
 * done once. Use from a "use server" file:
 *
 *   export const createRole = defineAction({
 *     input: roleFormSchema,
 *     permissions: ["roles.create"],
 *     handler: (input) => rolesService.create(input),
 *     refresh: true,
 *   });
 *
 * Always resolves to ActionResult — domain errors never throw on the client.
 * Next.js control flow (redirect, notFound) is re-thrown untouched.
 */
export function defineAction<
  S extends Schema = undefined,
  TOut = void,
  Public extends boolean = false,
>(config: ActionConfig<S, TOut, Public>): (input: RawInput<S>) => Promise<ActionResult<TOut>> {
  return async (rawInput) => {
    try {
      let user: CurrentUser | null = null;
      if (!config.public) {
        user = config.permissions?.length
          ? await assertPermission(...config.permissions)
          : await assertUser();
      }

      const input = (
        config.input ? await config.input.parseAsync(rawInput) : undefined
      ) as ParsedInput<S>;
      const data = await config.handler(input, { user } as ActionContext<Public>);

      config.revalidatePaths?.forEach((path) => revalidatePath(path));
      if (config.refresh) refresh();

      return { ok: true, data };
    } catch (error) {
      unstable_rethrow(error);
      if (!(error instanceof AppError) || error.code === "INTERNAL") {
        logger.error("Server action failed", {
          error:
            error instanceof Error
              ? { name: error.name, message: error.message, cause: error.cause }
              : error,
        });
      }
      return { ok: false, error: toActionError(error) };
    }
  };
}
