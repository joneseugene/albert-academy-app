import "server-only";

import type { ProxySessionHandler } from "./ports/auth";
import type { Backend } from "./ports/backend";
import { supabaseBackend, supabaseProxySession } from "./adapters/supabase";

/**
 * Composition root — the ONLY place that chooses a backend implementation.
 * To move off Supabase, implement `Backend` + `ProxySessionHandler` in
 * src/server/adapters/<name> and switch them here; nothing else changes.
 */
export const backend: Backend = supabaseBackend;
export const proxySession: ProxySessionHandler = supabaseProxySession;
