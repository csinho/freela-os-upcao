import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerEnv, getSupabaseUrl, requireServerEnv } from "@/lib/env.server";

let cached: SupabaseClient | undefined;

export function getSupabaseServer(source?: Record<string, string | undefined>): SupabaseClient {
  if (!cached) {
    const key =
      getServerEnv("SUPABASE_SERVICE_ROLE_KEY", source) ??
      requireServerEnv("SUPABASE_SERVICE_ROLE_KEY", source);
    cached = createClient(getSupabaseUrl(source), key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
