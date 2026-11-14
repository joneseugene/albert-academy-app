import "server-only";
import { z } from "zod";

import { SUPER_PERMISSION } from "@/config/permissions";
import { isSuperAdmin, type CurrentUser } from "@/lib/auth/access";
import type { ListQuery } from "@/lib/data/query";
import { emptyToNull } from "@/lib/validation";
import { assertPermission } from "@/server/auth/session";
import { backend } from "@/server/backend";
import { AppError } from "@/server/core/errors";
import { defineResource } from "@/server/core/resource";
import {
  roleSchema,
  userSchema,
  type CreateUserValues,
  type EditUserValues,
  type Role,
  type User,
} from "../schemas";

/** Read model: users_view (no password hash; role joined in). */
export const usersResource = defineResource<User, never, never>({
  name: "users",
  entity: userSchema,
  searchable: ["firstName", "lastName", "email"],
  sortable: ["firstName", "lastName", "email", "status", "lastLoginAt", "createdAt"],
  filterable: ["status", "roleId"],
  defaultSort: [{ field: "createdAt", direction: "desc" }],
  softDelete: true,
  adapters: { supabase: { table: "users_view" } },
});

type UserWrite = Partial<{
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  roleId: string;
  status: User["status"];
}>;

/** Write model: the users table (returns only the id). */
const usersTable = defineResource<{ id: string }, UserWrite, UserWrite>({
  name: "users",
  entity: z.object({ id: z.string() }),
  softDelete: true,
  adapters: { supabase: { table: "users", select: "id" } },
});

const rolesResource = defineResource<Role, never, never>({
  name: "roles",
  entity: roleSchema,
  sortable: ["name"],
  defaultSort: [{ field: "name", direction: "asc" }],
  softDelete: true,
  adapters: { supabase: { select: "id, name, description, permissions" } },
});

const read = () => backend.repository(usersResource);
const write = () => backend.repository(usersTable);

async function getOrThrow(id: string) {
  const user = await read().getById(id);
  if (!user) throw AppError.notFound("User not found");
  return user;
}

function notSelf(me: CurrentUser, id: string, what: string) {
  if (me.id === id) throw AppError.forbidden(`You can't ${what} your own account here`);
}

/** Anti-escalation: you may only grant a role whose permissions you hold yourself. */
function canGrant(me: CurrentUser, role: Role) {
  if (isSuperAdmin(me)) return true;
  if (role.permissions.includes(SUPER_PERMISSION)) return false;
  return role.permissions.every((p) => me.permissions.includes(p));
}

/** Only Super Admins may manage Super Admin accounts. */
function assertCanManage(me: CurrentUser, target: User) {
  if (target.rolePermissions.includes(SUPER_PERMISSION) && !isSuperAdmin(me)) {
    throw AppError.forbidden("Only a Super Admin can change a Super Admin's account");
  }
}

async function validRole(me: CurrentUser, roleId: string) {
  const role = await backend.repository(rolesResource).getById(roleId);
  if (!role) throw AppError.validation("Invalid role", { roleId: ["That role no longer exists"] });
  if (!canGrant(me, role)) {
    throw AppError.validation("You can't grant this role", {
      roleId: ["This role has permissions you don't hold"],
    });
  }
  return role;
}

function emailConflict(error: unknown): never {
  if (error instanceof AppError && error.code === "CONFLICT") {
    throw AppError.validation("Email already in use", {
      email: ["Another user already has this email"],
    });
  }
  throw error;
}

export const usersService = {
  async list(query: ListQuery = {}) {
    await assertPermission("users.read");
    return read().list(query);
  },

  async get(id: string) {
    await assertPermission("users.read");
    return getOrThrow(id);
  },

  async count() {
    await assertPermission("users.read");
    return (await read().list({ pageSize: 1 })).total;
  },

  /** Roles this admin may assign (forms) — Super Admins see all. */
  async roleChoices() {
    const me = await assertPermission("users.read");
    const roles = await backend.repository(rolesResource).list({ pageSize: 100 });
    return roles.items.filter((r) => canGrant(me, r));
  },

  async create(values: CreateUserValues) {
    const me = await assertPermission("users.create");
    await validRole(me, values.roleId);
    const created = await write()
      .create({
        email: values.email.trim().toLowerCase(),
        firstName: values.firstName,
        lastName: values.lastName,
        phone: emptyToNull(values.phone),
        avatarUrl: emptyToNull(values.avatarUrl),
        roleId: values.roleId,
        status: values.status,
      })
      .catch(emailConflict);
    await backend.auth.admin.setPassword(created.id, values.password);
    return created;
  },

  async update(id: string, values: EditUserValues) {
    const me = await assertPermission("users.update");
    const target = await getOrThrow(id);
    assertCanManage(me, target);
    // You can't change your own role or block yourself (use Profile for your details).
    if (me.id === id && (values.roleId !== target.roleId || values.status !== target.status)) {
      throw AppError.forbidden("You can't change your own role or status");
    }
    if (values.roleId !== target.roleId) await validRole(me, values.roleId);

    await write().update(id, {
      firstName: values.firstName,
      lastName: values.lastName,
      phone: emptyToNull(values.phone),
      avatarUrl: emptyToNull(values.avatarUrl),
      roleId: values.roleId,
      status: values.status,
    });
    if (values.password) await backend.auth.admin.setPassword(id, values.password);
    // Blocking takes effect at once: end their sessions.
    if (values.status === "blocked" && target.status !== "blocked") {
      await backend.auth.admin.endSessions(id);
    }
  },

  /** Soft delete: the account is hidden and can't sign in; the row is kept. */
  async remove(id: string) {
    const me = await assertPermission("users.delete");
    notSelf(me, id, "delete");
    const target = await getOrThrow(id);
    assertCanManage(me, target);
    await write().delete(id);
    await backend.auth.admin.endSessions(id);
  },
};
