import "server-only";

/**
 * The app uses camelCase; Postgres/FastAPI conventionally use snake_case.
 * Adapters convert at the boundary so entities look the same regardless of backend.
 */
export const toSnake = (key: string) => key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
export const toCamel = (key: string) =>
  key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" && value !== null && Object.getPrototypeOf(value) === Object.prototype
  );
}

function mapKeysDeep(value: unknown, fn: (key: string) => string): unknown {
  if (Array.isArray(value)) return value.map((v) => mapKeysDeep(v, fn));
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [fn(k), mapKeysDeep(v, fn)]));
}

export const keysToSnake = <T = unknown>(value: unknown) => mapKeysDeep(value, toSnake) as T;
export const keysToCamel = <T = unknown>(value: unknown) => mapKeysDeep(value, toCamel) as T;
