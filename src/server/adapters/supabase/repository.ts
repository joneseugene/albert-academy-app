import "server-only";

import { toPaginated } from "@/lib/data/query";
import type { Filter } from "@/lib/data/query";
import { keysToCamel, keysToSnake, toSnake } from "@/server/core/case";
import { AppError } from "@/server/core/errors";
import { normalizeListQuery, type ResourceDefinition } from "@/server/core/resource";
import type { Repository } from "@/server/ports/repository";
import { getSupabaseClient } from "./client";
import { fromPostgrestError } from "./errors";

/*
 * PostgREST builder generics are deeply nested and table-specific; this
 * adapter is generic over any table, so the builder is typed structurally.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryBuilder = any;

/** Strip LIKE wildcards from user input so search can't widen itself. */
const sanitizeLike = (value: string) => value.replace(/[%*]/g, "");

/** Quote a value for PostgREST `or()` syntax (commas/parens would otherwise break it). */
const quote = (value: string) => `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

/** Postgres array literal with every element quoted: {"a","b"}. */
const arrayLiteral = (values: Array<string | number>) =>
  `{${values.map((v) => `"${String(v).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`).join(",")}}`;

function applyFilter(builder: QueryBuilder, filter: Filter): QueryBuilder {
  const column = toSnake(filter.field);
  const { value } = filter;

  switch (filter.op) {
    case "eq":
    case "neq":
    case "gt":
    case "gte":
    case "lt":
    case "lte":
      return builder[filter.op](column, value);
    case "in":
      return builder.in(column, Array.isArray(value) ? value : [value]);
    case "contains":
      return builder.ilike(column, `%${sanitizeLike(String(value))}%`);
    case "startsWith":
      return builder.ilike(column, `${sanitizeLike(String(value))}%`);
    case "isNull":
      return value === false ? builder.not(column, "is", null) : builder.is(column, null);
    case "has":
      return builder.contains(column, Array.isArray(value) ? value : [value]);
    case "containedBy":
      return builder.containedBy(column, Array.isArray(value) ? value : [value]);
    case "notHas":
      return builder.not(
        column,
        "cs",
        arrayLiteral(Array.isArray(value) ? value : [String(value)]),
      );
  }
}

export function createSupabaseRepository<TEntity, TCreate, TUpdate>(
  resource: ResourceDefinition<TEntity, TCreate, TUpdate>,
): Repository<TEntity, TCreate, TUpdate> {
  const options = resource.adapters?.supabase ?? {};
  const table = options.table ?? resource.name;
  const select = options.select ?? "*";
  const idColumn = toSnake(resource.idField ?? "id");

  async function from(): Promise<QueryBuilder> {
    const client = getSupabaseClient();
    return options.schema ? client.schema(options.schema).from(table) : client.from(table);
  }

  /** Hide soft-deleted rows when the resource uses soft delete. */
  const notDeleted = (builder: QueryBuilder): QueryBuilder =>
    resource.softDelete ? builder.is("deleted_at", null) : builder;

  function parse(row: unknown): TEntity {
    const result = resource.entity.safeParse(keysToCamel(row));
    if (!result.success) {
      throw AppError.internal(`Unexpected "${resource.name}" record shape`, result.error);
    }
    return result.data;
  }

  return {
    async list(query) {
      const q = normalizeListQuery(resource, query);
      let builder = notDeleted((await from()).select(select, { count: "exact" }));

      for (const filter of q.filters) builder = applyFilter(builder, filter);

      if (q.search && resource.searchable?.length) {
        const term = quote(`%${sanitizeLike(q.search)}%`);
        builder = builder.or(
          resource.searchable.map((field) => `${toSnake(field)}.ilike.${term}`).join(","),
        );
      }

      for (const sort of q.sort) {
        builder = builder.order(toSnake(sort.field), { ascending: sort.direction === "asc" });
      }

      const fromIndex = (q.page - 1) * q.pageSize;
      const { data, count, error } = await builder.range(fromIndex, fromIndex + q.pageSize - 1);

      // Requesting a page past the end returns 416 / PGRST103: treat as empty.
      if (error?.code === "PGRST103") return toPaginated([], count ?? 0, q.page, q.pageSize);
      if (error) throw fromPostgrestError(error);

      return toPaginated((data ?? []).map(parse), count ?? 0, q.page, q.pageSize);
    },

    async getById(id) {
      const { data, error } = await notDeleted(
        (await from()).select(select).eq(idColumn, id),
      ).maybeSingle();
      if (error) throw fromPostgrestError(error);
      return data ? parse(data) : null;
    },

    async create(input) {
      const { data, error } = await (
        await from()
      )
        .insert(keysToSnake(input))
        .select(select)
        .single();
      if (error) throw fromPostgrestError(error);
      return parse(data);
    },

    async createMany(inputs) {
      if (!inputs.length) return 0;
      const { error, count } = await (
        await from()
      ).insert(
        inputs.map((input) => keysToSnake(input)),
        { count: "exact" },
      );
      if (error) throw fromPostgrestError(error);
      return count ?? inputs.length;
    },

    async update(id, input) {
      // Deleted rows can't be edited: they match no row and surface as NOT_FOUND.
      const { data, error } = await notDeleted(
        (await from()).update(keysToSnake(input)).eq(idColumn, id),
      )
        .select(select)
        .single();
      if (error) throw fromPostgrestError(error);
      return parse(data);
    },

    async delete(id) {
      const { error, count } = resource.softDelete
        ? await (
            await from()
          )
            .update({ deleted_at: new Date().toISOString() }, { count: "exact" })
            .eq(idColumn, id)
            .is("deleted_at", null)
        : await (await from()).delete({ count: "exact" }).eq(idColumn, id);
      if (error) throw fromPostgrestError(error);
      if (count === 0) throw AppError.notFound();
    },
  };
}
