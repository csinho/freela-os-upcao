import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerEnv, getSupabaseUrl, requireServerEnv } from "@/lib/env.server";

function decodeJwtRole(key: string): string | undefined {
  const parts = key.split(".");
  if (parts.length < 2) return undefined;
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))) as {
      role?: string;
    };
    return payload.role;
  } catch {
    return undefined;
  }
}

function assertServiceRoleKey(key: string): void {
  if (key.startsWith("sb_publishable_")) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY está com a chave publishable (sb_publishable_...). Use a service_role (eyJ...) do Supabase → Settings → API.",
    );
  }

  const role = decodeJwtRole(key);
  if (role !== "service_role") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY inválida: use a chave service_role do Supabase (Settings → API → service_role), não a publishable/anon.",
    );
  }
}

export function getSupabaseServer(source?: Record<string, string | undefined>): SupabaseClient {
  const key =
    getServerEnv("SUPABASE_SERVICE_ROLE_KEY", source) ??
    requireServerEnv("SUPABASE_SERVICE_ROLE_KEY", source);

  assertServiceRoleKey(key);

  return createClient(getSupabaseUrl(source), key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "public" },
  });
}
