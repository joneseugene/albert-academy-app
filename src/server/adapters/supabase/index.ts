import "server-only";

import { getMailer } from "@/server/adapters/mail";
import { createNativeAuth } from "@/server/auth/native/native-auth";
import type { Backend } from "@/server/ports/backend";
import { supabaseAuthStore } from "./auth-store";
import { createSupabaseRepository } from "./repository";
import { supabaseFileStore, supabaseRateLimitStore } from "./storage";

/** Supabase as the data + file store; authentication is the app's own (native). */
const nativeAuth = createNativeAuth(supabaseAuthStore);

export const supabaseBackend: Backend = {
  name: "supabase",
  auth: nativeAuth.auth,
  files: supabaseFileStore,
  // Email isn't a Supabase service; chosen from the environment (SMTP / Resend).
  get mailer() {
    return getMailer();
  },
  rateLimits: supabaseRateLimitStore,
  repository: createSupabaseRepository,
};

export const supabaseProxySession = nativeAuth.proxySession;
