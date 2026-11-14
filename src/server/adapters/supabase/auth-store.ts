import "server-only";

import type { UserStatus } from "@/lib/auth/access";
import type { AuthStore, AuthUserRecord, SessionRecord } from "@/server/ports/auth-store";
import { getSupabaseClient } from "./client";
import { fromPostgrestError } from "./errors";

const USER_COLUMNS =
  "id, email, first_name, last_name, phone, avatar_url, password_hash, status, failed_login_attempts, locked_until";
const SESSION_COLUMNS = "id, user_id, token_hash, expires_at, revoked_at, rotated_at, persistent";

type UserRow = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  avatar_url: string | null;
  password_hash: string | null;
  status: UserStatus;
  failed_login_attempts: number;
  locked_until: string | null;
};

type SessionRow = {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  revoked_at: string | null;
  rotated_at: string | null;
  persistent: boolean;
};

const date = (v: string | null) => (v ? new Date(v) : null);
const iso = (d: Date | null | undefined) => (d ? d.toISOString() : d);

const toUser = (r: UserRow): AuthUserRecord => ({
  id: r.id,
  email: r.email,
  firstName: r.first_name,
  lastName: r.last_name,
  phone: r.phone,
  avatarUrl: r.avatar_url,
  passwordHash: r.password_hash,
  status: r.status,
  failedLoginAttempts: r.failed_login_attempts,
  lockedUntil: date(r.locked_until),
});

const toSession = (r: SessionRow, matchedHash: string): SessionRecord => ({
  id: r.id,
  userId: r.user_id,
  expiresAt: new Date(r.expires_at),
  revokedAt: date(r.revoked_at),
  rotatedAt: date(r.rotated_at),
  persistent: r.persistent,
  matchedPrevious: r.token_hash !== matchedHash,
});

type DbResult<T> = { data: T | null; error: { code?: string; message: string } | null };

function check<T>(result: DbResult<T>): T | null {
  if (result.error) throw fromPostgrestError(result.error);
  return result.data;
}

function one<T>(result: DbResult<T>): T {
  const data = check(result);
  if (data === null) throw new Error("Expected a row but got none");
  return data;
}

const rows = <T>(result: DbResult<T[]>): T[] => check(result) ?? [];

const db = () => getSupabaseClient();

/** Persists native-auth data in Supabase tables (see supabase/migrations). */
export const supabaseAuthStore: AuthStore = {
  async findUserByEmail(email) {
    const row = check(
      await db()
        .from("users")
        .select(USER_COLUMNS)
        .eq("email", email)
        .is("deleted_at", null)
        .maybeSingle<UserRow>(),
    );
    return row ? toUser(row) : null;
  },

  async findUserById(id) {
    const row = check(
      await db()
        .from("users")
        .select(USER_COLUMNS)
        .eq("id", id)
        .is("deleted_at", null)
        .maybeSingle<UserRow>(),
    );
    return row ? toUser(row) : null;
  },

  async updateUser(id, patch) {
    const row: Record<string, unknown> = {};
    if (patch.passwordHash !== undefined) row.password_hash = patch.passwordHash;
    if (patch.failedLoginAttempts !== undefined)
      row.failed_login_attempts = patch.failedLoginAttempts;
    if (patch.lockedUntil !== undefined) row.locked_until = iso(patch.lockedUntil);
    if (patch.lastLoginAt !== undefined) row.last_login_at = iso(patch.lastLoginAt);
    if (patch.passwordChangedAt !== undefined)
      row.password_changed_at = iso(patch.passwordChangedAt);
    check(await db().from("users").update(row).eq("id", id));
  },

  async getUserAccess(userId) {
    type Row = {
      roles: { name: string; permissions: string[]; deleted_at: string | null } | null;
    };
    const row = check(
      await db()
        .from("users")
        .select("roles(name, permissions, deleted_at)")
        .eq("id", userId)
        .maybeSingle<Row>(),
    );
    // A soft-deleted role grants nothing.
    const role = row?.roles && !row.roles.deleted_at ? row.roles : null;
    return { role: role?.name ?? null, permissions: role?.permissions ?? [] };
  },

  async createSession(input) {
    return one(
      await db()
        .from("auth_sessions")
        .insert({
          user_id: input.userId,
          token_hash: input.tokenHash,
          expires_at: input.expiresAt.toISOString(),
          persistent: input.persistent,
          user_agent: input.userAgent ?? null,
          ip: input.ip ?? null,
        })
        .select("id")
        .single<{ id: string }>(),
    );
  },

  async getSession(id) {
    const row = check(
      await db()
        .from("auth_sessions")
        .select(SESSION_COLUMNS)
        .eq("id", id)
        .maybeSingle<SessionRow>(),
    );
    return row ? toSession(row, row.token_hash) : null;
  },

  async findSessionByTokenHash(tokenHash) {
    // Hex-only hash, safe to interpolate into the filter.
    const row = check(
      await db()
        .from("auth_sessions")
        .select(SESSION_COLUMNS)
        .or(`token_hash.eq.${tokenHash},previous_token_hash.eq.${tokenHash}`)
        .maybeSingle<SessionRow>(),
    );
    return row ? toSession(row, tokenHash) : null;
  },

  async rotateSession(id, { currentHash, newHash, expiresAt }) {
    const now = new Date().toISOString();
    const updated = rows(
      await db()
        .from("auth_sessions")
        .update({
          token_hash: newHash,
          previous_token_hash: currentHash,
          rotated_at: now,
          last_used_at: now,
          expires_at: expiresAt.toISOString(),
        })
        .eq("id", id)
        .eq("token_hash", currentHash) // compare-and-swap
        .select("id"),
    );
    return updated.length > 0;
  },

  async revokeSession(id) {
    check(
      await db()
        .from("auth_sessions")
        .update({ revoked_at: new Date().toISOString() })
        .eq("id", id)
        .is("revoked_at", null),
    );
  },

  async revokeUserSessions(userId, options) {
    let query = db()
      .from("auth_sessions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("revoked_at", null);
    if (options?.exceptSessionId) query = query.neq("id", options.exceptSessionId);
    check(await query);
  },

  async createResetCode({ userId, codeHash, expiresAt }) {
    const now = new Date().toISOString();
    // Only the newest code works.
    check(
      await db()
        .from("password_reset_codes")
        .update({ used_at: now })
        .eq("user_id", userId)
        .is("used_at", null),
    );
    check(
      await db().from("password_reset_codes").insert({
        user_id: userId,
        code_hash: codeHash,
        expires_at: expiresAt.toISOString(),
      }),
    );
  },

  async findActiveResetCode(userId) {
    type Row = {
      id: string;
      user_id: string;
      code_hash: string;
      expires_at: string;
      attempts: number;
    };
    const row = check(
      await db()
        .from("password_reset_codes")
        .select("id, user_id, code_hash, expires_at, attempts")
        .eq("user_id", userId)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<Row>(),
    );
    return row
      ? {
          id: row.id,
          userId: row.user_id,
          codeHash: row.code_hash,
          expiresAt: new Date(row.expires_at),
          attempts: row.attempts,
        }
      : null;
  },

  async recordResetAttempt(id, attempts) {
    check(await db().from("password_reset_codes").update({ attempts }).eq("id", id));
  },

  async consumeResetCode(id) {
    const updated = rows(
      await db()
        .from("password_reset_codes")
        .update({ used_at: new Date().toISOString() })
        .eq("id", id)
        .is("used_at", null) // compare-and-swap: a code works once
        .select("id"),
    );
    return updated.length > 0;
  },
};
