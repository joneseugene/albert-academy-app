"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { Permission } from "@/config/permissions";
import { hasAllPermissions, hasAnyPermission, type CurrentUser } from "@/lib/auth/access";

const SessionContext = createContext<CurrentUser | null>(null);

/** Provided by the (admin) layout after the server has verified the session. */
export function SessionProvider({ user, children }: { user: CurrentUser; children: ReactNode }) {
  return <SessionContext value={user}>{children}</SessionContext>;
}

export function useCurrentUser(): CurrentUser {
  const user = useContext(SessionContext);
  if (!user) throw new Error("useCurrentUser must be used within <SessionProvider>");
  return user;
}

export function usePermission(...permissions: Permission[]): boolean {
  return hasAllPermissions(useCurrentUser(), permissions);
}

/**
 * Hide UI the user can't use. UX only — the server enforces permissions
 * again on every action and query.
 */
export function Can({
  permission,
  anyOf,
  fallback = null,
  children,
}: {
  permission?: Permission | Permission[];
  anyOf?: Permission[];
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const user = useCurrentUser();
  const all = permission ? (Array.isArray(permission) ? permission : [permission]) : [];
  const allowed = hasAllPermissions(user, all) && (!anyOf || hasAnyPermission(user, anyOf));
  return <>{allowed ? children : fallback}</>;
}
