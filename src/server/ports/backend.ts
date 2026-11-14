import type { ResourceDefinition } from "../core/resource";
import type { AuthProvider } from "./auth";
import type { FileStore } from "./files";
import type { Mailer } from "./mailer";
import type { RateLimitStore } from "./rate-limits";
import type { Repository } from "./repository";

/** Everything the app needs from its backend. One implementation per adapter. */
export interface Backend {
  readonly name: string;
  auth: AuthProvider;
  files: FileStore;
  mailer: Mailer;
  rateLimits: RateLimitStore;
  repository<TEntity, TCreate, TUpdate>(
    resource: ResourceDefinition<TEntity, TCreate, TUpdate>,
  ): Repository<TEntity, TCreate, TUpdate>;
}
