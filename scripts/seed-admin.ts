/**
 * Create (or ensure) the first Super Admin.
 *
 *   SEED_EMAIL=… SEED_PASSWORD=… SEED_FIRST_NAME=… SEED_LAST_NAME=… pnpm seed:admin
 *   (optional: SEED_ROLE="School Admin")
 *
 * Reads SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY from .env.local.
 * Idempotent: an existing user keeps their password; only the role is ensured.
 */
import { createClient } from "@supabase/supabase-js";

import { hashPassword } from "../src/server/auth/native/password.ts";

const REQUIRED = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SEED_EMAIL",
  "SEED_PASSWORD",
  "SEED_FIRST_NAME",
  "SEED_LAST_NAME",
] as const;

async function main() {
  const env = process.env;
  const missing = REQUIRED.filter((k) => !env[k]);
  if (missing.length) throw new Error(`Missing env: ${missing.join(", ")}`);
  if (env.SEED_PASSWORD!.length < 8) throw new Error("SEED_PASSWORD must be at least 8 characters");

  const db = createClient(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const email = env.SEED_EMAIL!.trim().toLowerCase();
  const roleName = env.SEED_ROLE ?? "Super Admin";

  const role = await db
    .from("roles")
    .select("id")
    .eq("name", roleName)
    .is("deleted_at", null)
    .maybeSingle();
  if (role.error || !role.data) {
    throw new Error(
      `Role "${roleName}" not found (did you run the migration?): ${role.error?.message ?? "no row"}`,
    );
  }

  const existing = await db
    .from("users")
    .select("id")
    .eq("email", email)
    .is("deleted_at", null)
    .maybeSingle();
  if (existing.error) throw new Error(`Looking up user: ${existing.error.message}`);

  if (existing.data) {
    const updated = await db
      .from("users")
      .update({ role_id: role.data.id, status: "active" })
      .eq("id", existing.data.id);
    if (updated.error) throw new Error(`Assigning role: ${updated.error.message}`);
    console.log(
      `User ${email} already exists — password left unchanged, role "${roleName}" ensured.`,
    );
    return;
  }

  const created = await db.from("users").insert({
    email,
    first_name: env.SEED_FIRST_NAME,
    last_name: env.SEED_LAST_NAME,
    role_id: role.data.id,
    password_hash: await hashPassword(env.SEED_PASSWORD!),
    password_changed_at: new Date().toISOString(),
    status: "active",
  });
  if (created.error) throw new Error(`Creating user: ${created.error.message}`);
  console.log(`Created ${roleName} ${email}. Done.`);
}

// Let the process exit naturally (process.exit with open sockets trips a libuv assert on Windows).
main().catch((error: Error) => {
  console.error(error.message);
  process.exitCode = 1;
});
