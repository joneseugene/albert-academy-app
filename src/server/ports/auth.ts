import type { NextRequest, NextResponse } from "next/server";

import type { CurrentUser } from "@/lib/auth/access";

export type Credentials = {
  email: string;
  password: string;
  /** Persistent session ("keep me signed in") vs browser-session only. */
  remember?: boolean;
};

/**
 * Authentication + identity contract. Authorization data (role and
 * permissions) is part of `getCurrentUser` so permission checks are
 * identical whichever implementation issues the session.
 */
export interface AuthProvider {
  signIn(credentials: Credentials): Promise<void>;
  signOut(): Promise<void>;
  /** Verified user for this request, or null. */
  getCurrentUser(): Promise<CurrentUser | null>;
  /** Signed-in user changes their password; signs out their other sessions. */
  changePassword(currentPassword: string, newPassword: string): Promise<void>;

  /** "Forgot password" with a one-time code sent by email. */
  passwordReset: {
    /**
     * Creates a code when the email belongs to an active account and returns
     * what the email needs; null otherwise. Callers must respond the same either
     * way, so accounts can't be discovered.
     */
    request(email: string): Promise<{ email: string; firstName: string; code: string } | null>;
    /** Checks the code and sets the new password; signs the user out everywhere. */
    confirm(input: { email: string; code: string; newPassword: string }): Promise<void>;
  };

  /** Administrative account management. */
  admin: {
    /** Hash and store a password set by an administrator; signs the user out everywhere. */
    setPassword(userId: string, password: string): Promise<void>;
    /** Sign the user out everywhere (e.g. after blocking or deleting them). */
    endSessions(userId: string): Promise<void>;
  };
}

/**
 * Runs inside `src/proxy.ts` on every matched request. Refreshes the session
 * when needed and reports whether a session *appears* present.
 * This is an optimistic check only — real authorization happens in the DAL.
 */
export type ProxySessionHandler = (
  request: NextRequest,
) => Promise<{ response: NextResponse; hasSession: boolean }>;
