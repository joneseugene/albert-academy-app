import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

import { canSignIn, type CurrentUser } from "@/lib/auth/access";
import { AppError } from "@/server/core/errors";
import { logger } from "@/server/core/logger";
import { requireEnv } from "@/server/env";
import type { AuthProvider, ProxySessionHandler } from "@/server/ports/auth";
import type { AuthStore, AuthUserRecord, UserAccess } from "@/server/ports/auth-store";
import {
  ACCESS_COOKIE,
  PERSISTENT_SESSION_SECONDS,
  REFRESH_COOKIE,
  clearSessionCookies,
  writeSessionCookies,
  type IssuedTokens,
} from "./cookies";
import { burnPasswordCheck, hashPassword, verifyPassword } from "./password";
import { generateOpaqueToken, hashToken, signAccessToken, verifyAccessToken } from "./tokens";

/** Browser-session sign-ins end after 12 h even if the browser stays open. */
const TRANSIENT_SESSION_MS = 12 * 60 * 60 * 1000;
const PERSISTENT_SESSION_MS = PERSISTENT_SESSION_SECONDS * 1000;
const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
/** Parallel requests may present a just-rotated refresh token; tolerate briefly. */
const ROTATION_GRACE_MS = 30 * 1000;

const INVALID_CREDENTIALS = () => new AppError("UNAUTHENTICATED", "Invalid email or password");

/** Password-reset codes: 6 digits, 15 minutes, 5 tries. */
export const RESET_CODE_TTL_MINUTES = 15;
const RESET_CODE_MAX_ATTEMPTS = 5;
const INVALID_CODE = () =>
  AppError.validation("That code is wrong or has expired. Check the email or ask for a new code.", {
    code: ["Wrong or expired code"],
  });

/** Only an HMAC of the code is stored, bound to the user. */
const hashResetCode = (userId: string, code: string) =>
  createHmac("sha256", requireEnv("AUTH_SECRET", "password reset"))
    .update(`reset:${userId}:${code}`)
    .digest("hex");

function sameHash(a: string, b: string) {
  const x = Buffer.from(a, "hex");
  const y = Buffer.from(b, "hex");
  return x.length === y.length && timingSafeEqual(x, y);
}
const normalizeEmail = (email: string) => email.trim().toLowerCase();

function toCurrentUser(user: AuthUserRecord, access: UserAccess): CurrentUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName} ${user.lastName}`.trim(),
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    role: access.role,
    permissions: access.permissions,
  };
}

/**
 * The app's own authentication: password login, short-lived JWT access
 * tokens (15 min) and rotating opaque refresh tokens (hashed at rest, reuse
 * detection), lockout after repeated failures, password change.
 * Storage is delegated to an AuthStore, so this works on any backend.
 */
export function createNativeAuth(store: AuthStore): {
  auth: AuthProvider;
  proxySession: ProxySessionHandler;
} {
  async function issueSession(user: AuthUserRecord, persistent: boolean): Promise<IssuedTokens> {
    const h = await headers();
    const refreshToken = generateOpaqueToken();
    const session = await store.createSession({
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      persistent,
      expiresAt: new Date(Date.now() + (persistent ? PERSISTENT_SESSION_MS : TRANSIENT_SESSION_MS)),
      userAgent: h.get("user-agent"),
      ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    });
    const accessToken = await signAccessToken({ userId: user.id, sessionId: session.id });
    return { accessToken, refreshToken, persistent };
  }

  /** Exchange a refresh token for new tokens. Null means "sign in again". */
  async function refresh(refreshToken: string): Promise<IssuedTokens | null> {
    const currentHash = hashToken(refreshToken);
    const session = await store.findSessionByTokenHash(currentHash);
    if (!session || session.revokedAt || session.expiresAt.getTime() <= Date.now()) return null;

    const user = await store.findUserById(session.userId);
    if (!user || !canSignIn(user.status)) {
      await store.revokeSession(session.id);
      return null;
    }

    if (session.matchedPrevious) {
      const sinceRotation = Date.now() - (session.rotatedAt?.getTime() ?? 0);
      if (sinceRotation > ROTATION_GRACE_MS) {
        // An old refresh token came back long after rotation: likely stolen.
        logger.warn("Refresh token reuse detected; revoking session", { sessionId: session.id });
        await store.revokeSession(session.id);
        return null;
      }
      // Concurrent request raced a rotation: new access token, keep the newer refresh cookie.
      const accessToken = await signAccessToken({ userId: user.id, sessionId: session.id });
      return { accessToken, persistent: session.persistent };
    }

    const newRefresh = generateOpaqueToken();
    const rotated = await store.rotateSession(session.id, {
      currentHash,
      newHash: hashToken(newRefresh),
      // Persistent sessions slide; browser sessions keep their absolute expiry.
      expiresAt: session.persistent
        ? new Date(Date.now() + PERSISTENT_SESSION_MS)
        : session.expiresAt,
    });
    const accessToken = await signAccessToken({ userId: user.id, sessionId: session.id });
    return rotated
      ? { accessToken, refreshToken: newRefresh, persistent: session.persistent }
      : { accessToken, persistent: session.persistent };
  }

  async function currentClaims() {
    return verifyAccessToken((await cookies()).get(ACCESS_COOKIE)?.value);
  }

  const auth: AuthProvider = {
    async signIn({ email, password, remember = false }) {
      const user = await store.findUserByEmail(normalizeEmail(email));

      if (!user || !user.passwordHash || !canSignIn(user.status)) {
        // Same time as a wrong password, so accounts can't be discovered by timing.
        await burnPasswordCheck(password);
        throw INVALID_CREDENTIALS();
      }

      if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
        const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000);
        throw new AppError(
          "RATE_LIMITED",
          `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
        );
      }

      if (!(await verifyPassword(password, user.passwordHash))) {
        const attempts = user.failedLoginAttempts + 1;
        const locked = attempts >= MAX_FAILED_LOGINS;
        await store.updateUser(user.id, {
          failedLoginAttempts: locked ? 0 : attempts,
          lockedUntil: locked ? new Date(Date.now() + LOCKOUT_MS) : user.lockedUntil,
        });
        if (locked) logger.warn("Account locked after failed logins", { userId: user.id });
        throw INVALID_CREDENTIALS();
      }

      await store.updateUser(user.id, {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      });
      writeSessionCookies(await cookies(), await issueSession(user, remember));
    },

    async signOut() {
      const jar = await cookies();
      const refreshToken = jar.get(REFRESH_COOKIE)?.value;
      if (refreshToken) {
        const session = await store.findSessionByTokenHash(hashToken(refreshToken));
        if (session) await store.revokeSession(session.id);
      }
      clearSessionCookies(jar);
    },

    async getCurrentUser() {
      const claims = await currentClaims();
      if (!claims) return null;

      const [session, user, access] = await Promise.all([
        store.getSession(claims.sessionId),
        store.findUserById(claims.userId),
        store.getUserAccess(claims.userId),
      ]);

      // Revocation, blocking and deletion take effect immediately, not at token expiry.
      if (!session || session.revokedAt || session.userId !== claims.userId) return null;
      if (session.expiresAt.getTime() <= Date.now()) return null;
      if (!user || !canSignIn(user.status)) return null;

      return toCurrentUser(user, access);
    },

    async changePassword(currentPassword, newPassword) {
      const claims = await currentClaims();
      const user = claims ? await store.findUserById(claims.userId) : null;
      if (!claims || !user || !user.passwordHash) throw AppError.unauthenticated();

      if (!(await verifyPassword(currentPassword, user.passwordHash))) {
        throw AppError.validation("Current password is incorrect", {
          currentPassword: ["Current password is incorrect"],
        });
      }

      await store.updateUser(user.id, {
        passwordHash: await hashPassword(newPassword),
        passwordChangedAt: new Date(),
      });
      await store.revokeUserSessions(user.id, { exceptSessionId: claims.sessionId });
    },

    passwordReset: {
      async request(email) {
        const user = await store.findUserByEmail(normalizeEmail(email));
        if (!user || !canSignIn(user.status)) return null;
        const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
        await store.createResetCode({
          userId: user.id,
          codeHash: hashResetCode(user.id, code),
          expiresAt: new Date(Date.now() + RESET_CODE_TTL_MINUTES * 60_000),
        });
        logger.info("Password reset code issued", { userId: user.id });
        return { email: user.email, firstName: user.firstName, code };
      },

      async confirm({ email, code, newPassword }) {
        const user = await store.findUserByEmail(normalizeEmail(email));
        if (!user || !canSignIn(user.status)) throw INVALID_CODE();
        const active = await store.findActiveResetCode(user.id);
        if (!active || active.attempts >= RESET_CODE_MAX_ATTEMPTS) throw INVALID_CODE();

        if (!sameHash(active.codeHash, hashResetCode(user.id, code))) {
          const attempts = active.attempts + 1;
          await store.recordResetAttempt(active.id, attempts);
          // Too many wrong guesses: the code stops working; ask for a new one.
          if (attempts >= RESET_CODE_MAX_ATTEMPTS) await store.consumeResetCode(active.id);
          throw INVALID_CODE();
        }
        if (!(await store.consumeResetCode(active.id))) throw INVALID_CODE();

        await store.updateUser(user.id, {
          passwordHash: await hashPassword(newPassword),
          passwordChangedAt: new Date(),
          failedLoginAttempts: 0,
          lockedUntil: null,
        });
        await store.revokeUserSessions(user.id);
        logger.info("Password reset with emailed code", { userId: user.id });
      },
    },

    admin: {
      async setPassword(userId, password) {
        await store.updateUser(userId, {
          passwordHash: await hashPassword(password),
          passwordChangedAt: new Date(),
          failedLoginAttempts: 0,
          lockedUntil: null,
        });
        await store.revokeUserSessions(userId);
      },

      async endSessions(userId) {
        await store.revokeUserSessions(userId);
      },
    },
  };

  const proxySession: ProxySessionHandler = async (request) => {
    if (await verifyAccessToken(request.cookies.get(ACCESS_COOKIE)?.value)) {
      return { response: NextResponse.next({ request }), hasSession: true };
    }

    const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
    const tokens = refreshToken ? await refresh(refreshToken).catch(() => null) : null;

    if (!tokens) {
      const response = NextResponse.next({ request });
      if (refreshToken || request.cookies.has(ACCESS_COOKIE)) clearSessionCookies(response.cookies);
      return { response, hasSession: false };
    }

    // Make the fresh tokens visible to this request's server code…
    request.cookies.set(ACCESS_COOKIE, tokens.accessToken);
    if (tokens.refreshToken) request.cookies.set(REFRESH_COOKIE, tokens.refreshToken);
    const response = NextResponse.next({ request });
    // …and persist them in the browser.
    writeSessionCookies(response.cookies, tokens);
    return { response, hasSession: true };
  };

  return { auth, proxySession };
}
