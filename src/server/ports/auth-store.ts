/**
 * Storage contract for the app's own (native) authentication.
 * The security logic — hashing, tokens, rotation, lockout — lives in
 * src/server/auth/native and is backend-independent; an adapter only has to
 * persist and fetch these records.
 */
import type { UserStatus } from "@/lib/auth/access";

/** Soft-deleted users are never returned by an AuthStore. */
export type AuthUserRecord = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  passwordHash: string | null;
  status: UserStatus;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
};

export type AuthUserPatch = Partial<{
  passwordHash: string;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  lastLoginAt: Date;
  passwordChangedAt: Date;
}>;

export type SessionRecord = {
  id: string;
  userId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  /** Set when the lookup matched the previous (just-rotated) token. */
  matchedPrevious: boolean;
  rotatedAt: Date | null;
  persistent: boolean;
};

export type UserAccess = { role: string | null; permissions: string[] };

export interface AuthStore {
  findUserByEmail(email: string): Promise<AuthUserRecord | null>;
  findUserById(id: string): Promise<AuthUserRecord | null>;
  updateUser(id: string, patch: AuthUserPatch): Promise<void>;
  getUserAccess(userId: string): Promise<UserAccess>;

  createSession(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    persistent: boolean;
    userAgent?: string | null;
    ip?: string | null;
  }): Promise<{ id: string }>;
  getSession(id: string): Promise<SessionRecord | null>;
  /** Matches the current OR previous token hash (for rotation grace). */
  findSessionByTokenHash(tokenHash: string): Promise<SessionRecord | null>;
  /** Atomic compare-and-swap; false if the token was already rotated. */
  rotateSession(
    id: string,
    input: { currentHash: string; newHash: string; expiresAt: Date },
  ): Promise<boolean>;
  revokeSession(id: string): Promise<void>;
  revokeUserSessions(userId: string, options?: { exceptSessionId?: string }): Promise<void>;

  /** New reset code for a user; cancels any earlier unused ones. */
  createResetCode(input: { userId: string; codeHash: string; expiresAt: Date }): Promise<void>;
  /** The user's latest unused, unexpired code. */
  findActiveResetCode(userId: string): Promise<ResetCodeRecord | null>;
  /** Count a wrong guess; returns the new number of attempts. */
  recordResetAttempt(id: string, attempts: number): Promise<void>;
  /** Mark used (atomic); false if it was already used. */
  consumeResetCode(id: string): Promise<boolean>;
}

export type ResetCodeRecord = {
  id: string;
  userId: string;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
};
