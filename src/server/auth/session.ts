import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";

import type { Permission } from "@/config/permissions";
import { routes } from "@/config/routes";
import { hasAllPermissions, hasAnyPermission, type CurrentUser } from "@/lib/auth/access";
import { backend } from "@/server/backend";
import { AppError } from "@/server/core/errors";

/**
 * Data Access Layer for identity. Every authorization decision goes through
 * here. Memoized per request, so calling it from many components is free.
 *
 * Reads the session (cookies), so callers must render inside <Suspense>
 * (Cache Components).
 */
export const getCurrentUser = cache((): Promise<CurrentUser | null> =>
  backend.auth.getCurrentUser(),
);

// ---------- For services and server actions: throw AppError ----------

export async function assertUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw AppError.unauthenticated();
  return user;
}

export async function assertPermission(...permissions: Permission[]): Promise<CurrentUser> {
  const user = await assertUser();
  if (!hasAllPermissions(user, permissions)) throw AppError.forbidden();
  return user;
}

export async function assertAnyPermission(...permissions: Permission[]): Promise<CurrentUser> {
  const user = await assertUser();
  if (!hasAnyPermission(user, permissions)) throw AppError.forbidden();
  return user;
}

// ---------- For pages and layouts: redirect ----------

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(routes.login);
  return user;
}

export async function requirePermission(...permissions: Permission[]): Promise<CurrentUser> {
  const user = await requireUser();
  if (!hasAllPermissions(user, permissions)) redirect(routes.forbidden);
  return user;
}
