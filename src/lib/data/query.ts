/**
 * Backend-agnostic list/query contract. Shared by client and server:
 * the UI builds a ListQuery, every backend adapter knows how to execute it.
 */

export const FILTER_OPERATORS = [
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "in",
  "contains",
  "startsWith",
  "isNull",
  /** Array column contains the value (e.g. a user's roleIds has X). */
  "has",
  /** Array column does NOT contain all of the value(s). */
  "notHas",
  /** Every element of the array column is among the value(s) (subset). */
  "containedBy",
] as const;

export type FilterOperator = (typeof FILTER_OPERATORS)[number];

export type FilterValue = string | number | boolean | null | Array<string | number>;

export type Filter = {
  /** Entity field name (camelCase). Adapters map it to their own column naming. */
  field: string;
  op: FilterOperator;
  value: FilterValue;
};

export type SortDirection = "asc" | "desc";

export type Sort = {
  field: string;
  direction: SortDirection;
};

export type ListQuery = {
  /** 1-based page index. */
  page?: number;
  pageSize?: number;
  /** Free-text search across the resource's `searchable` fields. */
  search?: string;
  filters?: Filter[];
  sort?: Sort[];
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export function toPaginated<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): Paginated<T> {
  return {
    items,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}
