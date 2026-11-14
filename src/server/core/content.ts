import "server-only";
import { updateTag } from "next/cache";

import type { Permission, PermissionModule } from "@/config/permissions";
import { PUBLIC_CACHE_TAG } from "@/lib/cache-tags";
import type { ResourceDefinition } from "./resource";
import { createCrudService } from "./service";

/**
 * Permission-checked CRUD for a content module: `<module>.read|create|update|delete`.
 * Resources should set `softDelete: true` so deletes only stamp `deleted_at`.
 * Every write refreshes the public website's cache (writes run in server actions).
 */
export function createContentService<TEntity, TCreate, TUpdate>(
  resource: ResourceDefinition<TEntity, TCreate, TUpdate>,
  module: PermissionModule,
) {
  const p = (action: string) => `${module}.${action}` as Permission;
  const crud = createCrudService(resource, {
    read: p("read"),
    create: p("create"),
    update: p("update"),
    delete: p("delete"),
  });
  const refreshSite = <T>(result: T) => {
    updateTag(PUBLIC_CACHE_TAG);
    return result;
  };
  return {
    ...crud,
    create: (input: TCreate) => crud.create(input).then(refreshSite),
    update: (id: string, input: TUpdate) => crud.update(id, input).then(refreshSite),
    remove: (id: string) => crud.remove(id).then(refreshSite),
  };
}
