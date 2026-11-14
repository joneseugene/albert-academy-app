import { createLoader, parseAsInteger, parseAsString } from "nuqs/server";

import { DEFAULT_PAGE_SIZE, type ListQuery, type Sort } from "./query";

/**
 * URL <-> ListQuery. List pages keep page/sort/search in the URL so they are
 * shareable and server-rendered. Use these parsers with `useQueryStates` on
 * the client and `loadListSearchParams` in Server Components.
 *
 * Sort format in the URL: `?sort=createdAt.desc,name.asc`
 */
export const listSearchParams = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  search: parseAsString.withDefault(""),
  sort: parseAsString.withDefault(""),
};

export const loadListSearchParams = createLoader(listSearchParams);

export function parseSort(value: string): Sort[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [field, direction] = part.split(".");
      return { field, direction: direction === "desc" ? "desc" : "asc" } as Sort;
    });
}

export function serializeSort(sort: Sort[]): string {
  return sort.map((s) => `${s.field}.${s.direction}`).join(",");
}

/**
 * Load list params plus named string filters (the ids DataView writes, e.g.
 * `?status=active&role=…`). Empty filters come back as "".
 */
export async function loadListWithFilters<K extends string>(
  searchParams: Promise<Record<string, string | string[] | undefined>>,
  filterIds: readonly K[],
) {
  const loader = createLoader({
    ...listSearchParams,
    ...Object.fromEntries(filterIds.map((id) => [id, parseAsString.withDefault("")])),
  });
  const all = (await loader(searchParams)) as Record<string, unknown>;
  const filters = Object.fromEntries(filterIds.map((id) => [id, String(all[id] ?? "")])) as Record<
    K,
    string
  >;
  return {
    list: {
      page: all.page as number,
      pageSize: all.pageSize as number,
      search: all.search as string,
      sort: all.sort as string,
    },
    filters,
  };
}

/** Build a ListQuery from parsed URL params; features append their own filters. */
export function toListQuery(
  params: { page: number; pageSize: number; search: string; sort: string },
  extra: Pick<ListQuery, "filters"> = {},
): ListQuery {
  return {
    page: params.page,
    pageSize: params.pageSize,
    search: params.search || undefined,
    sort: parseSort(params.sort),
    ...extra,
  };
}
