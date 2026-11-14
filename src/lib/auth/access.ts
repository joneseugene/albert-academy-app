import { SUPER_PERMISSION, type Permission } from "@/config/permissions";

/** The authenticated user as the app sees it — backend-agnostic and client-safe. */
export type CurrentUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  /** Role name, e.g. "Super Admin" or "School Admin". Display only — never checked. */
  role: string | null;
  /** Permissions granted by the role. May contain "*". */
  permissions: string[];
};

/** Account statuses. Only "active" accounts can sign in. */
export const USER_STATUSES = ["active", "blocked"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export function canSignIn(status: string): boolean {
  return status === "active";
}

type PermissionHolder = Pick<CurrentUser, "permissions"> | null | undefined;

export function isSuperAdmin(user: PermissionHolder): boolean {
  return Boolean(user?.permissions.includes(SUPER_PERMISSION));
}

export function hasPermission(user: PermissionHolder, permission: Permission): boolean {
  if (!user) return false;
  return user.permissions.includes(SUPER_PERMISSION) || user.permissions.includes(permission);
}

export function hasAllPermissions(user: PermissionHolder, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(user, p));
}

export function hasAnyPermission(user: PermissionHolder, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(user, p));
}

/** What a page, nav item or component requires. Omitted = no requirement. */
export type AccessRule = {
  /** All of these permissions are required. */
  permissions?: Permission[];
};

export function canAccess(user: CurrentUser | null | undefined, rule: AccessRule = {}): boolean {
  if (!user) return false;
  return hasAllPermissions(user, rule.permissions ?? []);
}
