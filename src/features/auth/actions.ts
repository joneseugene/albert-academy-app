"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";

import { routes } from "@/config/routes";
import { RESET_CODE_TTL_MINUTES } from "@/server/auth/native/native-auth";
import { backend } from "@/server/backend";
import { defineAction } from "@/server/core/action";
import { AppError } from "@/server/core/errors";
import { logger } from "@/server/core/logger";
import { enforceRateLimit } from "@/server/core/rate-limit";
import { serverEnv } from "@/server/env";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from "./schemas";
import { resetCodeEmail } from "./server/reset-email";

/** Only allow relative, same-origin redirect targets (blocks open redirects). */
function safeNext(next: string | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : routes.home;
}

export const signInAction = defineAction({
  public: true,
  input: loginSchema,
  handler: async ({ email, password, remember, next }) => {
    await enforceRateLimit("signIn");
    await backend.auth.signIn({ email, password, remember });
    redirect(safeNext(next));
  },
});

export const changePasswordAction = defineAction({
  input: changePasswordSchema,
  handler: ({ currentPassword, newPassword }) =>
    backend.auth.changePassword(currentPassword, newPassword),
});

/**
 * "Forgot password", step 1: email a code if the account exists. The answer is
 * the same either way (and the email is sent after responding), so this can't
 * be used to find out who has an account.
 */
export const requestPasswordResetAction = defineAction({
  public: true,
  input: forgotPasswordSchema,
  handler: async ({ email }) => {
    if (serverEnv.NODE_ENV === "production" && !backend.mailer.configured) {
      throw new AppError(
        "INTEGRATION",
        "Password reset by email isn't set up yet. Ask a Super Admin to reset your password.",
      );
    }
    await enforceRateLimit("resetRequest");
    await enforceRateLimit("resetRequestEmail", email);

    const issued = await backend.auth.passwordReset.request(email);
    if (issued) {
      after(() =>
        backend.mailer
          .send(
            resetCodeEmail({
              to: issued.email,
              firstName: issued.firstName,
              code: issued.code,
              minutes: RESET_CODE_TTL_MINUTES,
            }),
          )
          .catch((error) =>
            logger.error("Sending the reset code failed", {
              message: error instanceof Error ? error.message : String(error),
            }),
          ),
      );
    }
    return { minutes: RESET_CODE_TTL_MINUTES };
  },
});

/** "Forgot password", step 2: check the code and set the new password. */
export const resetPasswordAction = defineAction({
  public: true,
  input: resetPasswordSchema,
  handler: async ({ email, code, newPassword }) => {
    await enforceRateLimit("resetConfirm");
    await backend.auth.passwordReset.confirm({ email, code, newPassword });
    redirect(`${routes.login}?reset=1`);
  },
});
