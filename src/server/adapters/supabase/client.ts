import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { requireEnv } from "@/server/env";

let client: SupabaseClient | undefined;

/**
 * Server-side client using the secret (service-role) key.
 *
 * Auth is native (not Supabase Auth), so there is no per-user Supabase JWT and
 * RLS cannot identify the caller. Instead: every table has RLS enabled with
 * no policies (the public/anon key can read nothing), and all access goes
 * through this server-only client after the app's own permission checks
 * (services + DAL). This module must never be imported into client code.
 */
export function getSupabaseClient(): SupabaseClient {
  client ??= createClient(
    requireEnv("SUPABASE_URL", "supabase adapter"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY", "supabase adapter"),
    {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      // Never let Next's fetch cache keep database responses: caching happens one level
      // up ("use cache" + cacheTag), where admin saves invalidate it with updateTag().
      global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
    },
  );
  return client;
}
