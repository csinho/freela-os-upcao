import { getSupabaseServer } from "@/integrations/supabase/server";
import { getServerEnv } from "@/lib/env.server";

const WHATSAPP_RE = /^\d{11}$/;

export function normalizeWhatsapp11(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("55")) return digits.slice(2);
  if (digits.length === 11) return digits;
  throw new Error("WhatsApp inválido — informe 11 dígitos (DDD + número).");
}

export function isValidWhatsapp11(whatsapp: string): boolean {
  return WHATSAPP_RE.test(whatsapp);
}

function parseAllowlistDigits(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim().replace(/\D/g, ""))
    .filter((s) => s.length === 11);
}

/** Números da env — bootstrap, admins extras ou emergência. */
export function getAdminAllowlistFromEnv(env?: Record<string, string | undefined>): string[] {
  const raw = getServerEnv("ADMIN_WHATSAPP_ALLOWLIST", env) ?? "";
  return parseAllowlistDigits(raw);
}

/** Número configurado na Evolution (admin/setup) — também autoriza login admin. */
export async function getAdminAllowlistFromDb(
  env?: Record<string, string | undefined>,
): Promise<string[]> {
  const sb = getSupabaseServer(env);
  const { data, error } = await sb
    .from("system_settings")
    .select("value")
    .eq("key", "evolution")
    .maybeSingle();

  if (error) throw new Error(error.message);

  const phone = ((data?.value ?? {}) as { connection_phone?: string }).connection_phone ?? "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("55")) return [digits.slice(2)];
  if (digits.length === 11) return [digits];
  return [];
}

/** Allowlist efetiva: env ∪ connection_phone do banco (sem duplicatas). */
export async function getAdminAllowlist(
  env?: Record<string, string | undefined>,
): Promise<string[]> {
  const fromEnv = getAdminAllowlistFromEnv(env);
  const fromDb = await getAdminAllowlistFromDb(env);
  return [...new Set([...fromEnv, ...fromDb])];
}

export async function isAdminWhatsappAllowed(
  whatsapp: string,
  env?: Record<string, string | undefined>,
): Promise<boolean> {
  if (!isValidWhatsapp11(whatsapp)) return false;
  const list = await getAdminAllowlist(env);
  return list.includes(whatsapp);
}

export async function assertAdminWhatsappAllowed(
  whatsapp: string,
  env?: Record<string, string | undefined>,
): Promise<void> {
  if (!(await isAdminWhatsappAllowed(whatsapp, env))) {
    throw new Error("Acesso não autorizado.");
  }
}
