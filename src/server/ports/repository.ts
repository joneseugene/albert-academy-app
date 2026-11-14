import type { ListQuery, Paginated } from "@/lib/data/query";

/**
 * Generic CRUD contract every backend adapter implements.
 * Feature code depends on this interface only — never on Supabase/HTTP.
 *
 * Implementations must:
 *  - validate outgoing entities with the resource's `entity` schema
 *  - throw `AppError` (never vendor errors)
 */
export interface Repository<TEntity, TCreate, TUpdate> {
  list(query?: ListQuery): Promise<Paginated<TEntity>>;
  /** Returns null when the record does not exist (or is not visible). */
  getById(id: string): Promise<TEntity | null>;
  create(input: TCreate): Promise<TEntity>;
  /** Bulk insert in one round trip (imports). Returns the number of rows created. */
  createMany(inputs: TCreate[]): Promise<number>;
  update(id: string, input: TUpdate): Promise<TEntity>;
  delete(id: string): Promise<void>;
}
