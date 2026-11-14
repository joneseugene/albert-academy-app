import "server-only";
import type { z } from "zod";

import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  type Filter,
  type ListQuery,
  type Sort,
} from "@/lib/data/query";

/**
 * Declarative description of a backend resource (a table / REST collection).
 * Features describe WHAT the resource is; adapters decide HOW to fetch it.
 * Backend-specific knobs live under `adapters` so they stay in one place.
 */
export type ResourceDefinition<TEntity, TCreate = Partial<TEntity>, TUpdate = Partial<TCreate>> = {
  /** Logical name, e.g. "roles". Default table name / REST path. */
  name: string;
  /** Validates and types every record coming out of the backend. */
  entity: z.ZodType<TEntity>;
  /** Primary key field (camelCase). Default "id". */
  idField?: string;
  /** Fields used by free-text `search`. */
  searchable?: string[];
  /** Whitelist of fields clients may filter on. Anything else is dropped. */
  filterable?: string[];
  /** Whitelist of fields clients may sort by. Anything else is dropped. */
  sortable?: string[];
  defaultSort?: Sort[];
  /**
   * Soft delete (platform rule): `delete` stamps `deletedAt` instead of removing
   * the row, and list/get hide deleted rows. HTTP backends implement this server-side.
   */
  softDelete?: boolean;
  adapters?: {
    supabase?: { table?: string; schema?: string; select?: string };
    http?: { path?: string };
  };
  /** Phantom fields so create/update types flow through generics. */
  readonly __types?: { create: TCreate; update: TUpdate };
};

export function defineResource<TEntity, TCreate = Partial<TEntity>, TUpdate = Partial<TCreate>>(
  definition: ResourceDefinition<TEntity, TCreate, TUpdate>,
): ResourceDefinition<TEntity, TCreate, TUpdate> {
  return definition;
}

export type NormalizedListQuery = {
  page: number;
  pageSize: number;
  search?: string;
  filters: Filter[];
  sort: Sort[];
};

/**
 * Clamp pagination and drop filters/sorts on fields the resource doesn't
 * whitelist. Every adapter runs this first, so client input can never reach
 * arbitrary columns regardless of backend.
 */
export function normalizeListQuery(
  resource: ResourceDefinition<unknown, unknown, unknown>,
  query: ListQuery = {},
): NormalizedListQuery {
  const page = Math.max(1, Math.floor(query.page ?? 1));
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(query.pageSize ?? DEFAULT_PAGE_SIZE)),
  );
  const filterable = new Set(resource.filterable ?? []);
  const sortable = new Set(resource.sortable ?? []);

  const sort = (query.sort ?? []).filter((s) => sortable.has(s.field));

  return {
    page,
    pageSize,
    search: query.search?.trim() || undefined,
    filters: (query.filters ?? []).filter((f) => filterable.has(f.field)),
    sort: sort.length ? sort : (resource.defaultSort ?? []),
  };
}
