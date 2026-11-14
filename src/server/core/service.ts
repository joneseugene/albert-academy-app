import "server-only";

import type { Permission } from "@/config/permissions";
import type { ListQuery, Paginated } from "@/lib/data/query";
import { backend } from "@/server/backend";
import { assertPermission } from "@/server/auth/session";
import { AppError } from "./errors";
import type { ResourceDefinition } from "./resource";

export type CrudPermissions = {
  read: Permission;
  create?: Permission;
  update?: Permission;
  delete?: Permission;
};

export type CrudService<TEntity, TCreate, TUpdate> = {
  list(query?: ListQuery): Promise<Paginated<TEntity>>;
  /** Throws NOT_FOUND when missing. */
  get(id: string): Promise<TEntity>;
  create(input: TCreate): Promise<TEntity>;
  update(id: string, input: TUpdate): Promise<TEntity>;
  remove(id: string): Promise<void>;
};

/**
 * Permission-checked CRUD over any resource, on whichever backend is active.
 * Features wrap/extend this with domain rules; pages and actions call the
 * service, never the repository directly.
 */
export function createCrudService<TEntity, TCreate, TUpdate>(
  resource: ResourceDefinition<TEntity, TCreate, TUpdate>,
  permissions: CrudPermissions,
): CrudService<TEntity, TCreate, TUpdate> {
  const repo = () => backend.repository(resource);

  const guard = async (permission: Permission | undefined, action: string) => {
    if (!permission) throw AppError.forbidden(`"${action}" is not enabled for ${resource.name}`);
    await assertPermission(permission);
  };

  return {
    async list(query) {
      await guard(permissions.read, "list");
      return repo().list(query);
    },
    async get(id) {
      await guard(permissions.read, "get");
      const entity = await repo().getById(id);
      if (!entity) throw AppError.notFound();
      return entity;
    },
    async create(input) {
      await guard(permissions.create, "create");
      return repo().create(input);
    },
    async update(id, input) {
      await guard(permissions.update, "update");
      return repo().update(id, input);
    },
    async remove(id) {
      await guard(permissions.delete, "delete");
      return repo().delete(id);
    },
  };
}
