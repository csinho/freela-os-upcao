import { getSupabaseServer } from "@/integrations/supabase/server";
import { PLAN_VALUE_CENTS } from "@/lib/billing/constants";
import type { AdminSettings } from "./types";

function formatPlanLabel(cents: number): string {
  const reais = (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  return `${reais}/mês`;
}

export async function getBillingPlanValueCents(
  env?: Record<string, string | undefined>,
): Promise<number> {
  const settings = await getBillingSettings(env);
  return settings.planValueCents;
}

export async function getBillingSettings(
  env?: Record<string, string | undefined>,
): Promise<AdminSettings> {
  const sb = getSupabaseServer(env);
  const { data: billingRow } = await sb
    .from("system_settings")
    .select("value")
    .eq("key", "billing")
    .maybeSingle();

  const { data: adminRow } = await sb
    .from("system_settings")
    .select("value")
    .eq("key", "admin")
    .maybeSingle();

  const { data: evolutionRow } = await sb
    .from("system_settings")
    .select("value")
    .eq("key", "evolution")
    .maybeSingle();

  const billingValue = (billingRow?.value ?? {}) as { plan_value_cents?: number | string };
  const adminValue = (adminRow?.value ?? {}) as { contact_whatsapp?: string };
  const evolutionValue = (evolutionRow?.value ?? {}) as {
    instance_name?: string;
    connection_state?: string;
    connected_at?: string | null;
  };

  const rawCents = billingValue.plan_value_cents;
  const planValueCents =
    typeof rawCents === "number"
      ? rawCents
      : typeof rawCents === "string"
        ? parseInt(rawCents, 10) || PLAN_VALUE_CENTS
        : PLAN_VALUE_CENTS;

  return {
    planValueCents,
    planLabel: formatPlanLabel(planValueCents),
    contactWhatsapp: adminValue.contact_whatsapp ?? "",
    evolutionInstanceName: evolutionValue.instance_name ?? "",
    evolutionConnectionState: evolutionValue.connection_state ?? "unknown",
    evolutionConnectedAt: evolutionValue.connected_at ?? null,
  };
}

export async function getAdminSettings(
  env?: Record<string, string | undefined>,
): Promise<AdminSettings> {
  return getBillingSettings(env);
}

export async function saveAdminBillingPlan(
  planValueReais: number,
  env?: Record<string, string | undefined>,
): Promise<AdminSettings> {
  if (!Number.isFinite(planValueReais) || planValueReais <= 0) {
    throw new Error("Valor do plano inválido.");
  }

  const newCents = Math.round(planValueReais * 100);
  const previous = await getBillingSettings(env);

  const sb = getSupabaseServer(env);
  const { error } = await sb.from("system_settings").upsert(
    {
      key: "billing",
      value: { plan_value_cents: newCents },
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );

  if (error) throw new Error(error.message);

  if (newCents !== previous.planValueCents) {
    console.info("[admin-plan-change]", {
      fromCents: previous.planValueCents,
      toCents: newCents,
    });
    // Invalida PIX pendentes — próximo "Gerar PIX" usará o novo valor.
    await sb
      .from("empresas")
      .update({
        woovi_charge_correlation_id: null,
        woovi_payment_link_url: null,
      })
      .not("woovi_charge_correlation_id", "is", null);
  }

  return getBillingSettings(env);
}

export async function saveAdminContactWhatsapp(
  contactWhatsapp: string,
  env?: Record<string, string | undefined>,
): Promise<AdminSettings> {
  const digits = contactWhatsapp.replace(/\D/g, "");

  const sb = getSupabaseServer(env);
  const { error } = await sb.from("system_settings").upsert(
    {
      key: "admin",
      value: { contact_whatsapp: digits },
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );

  if (error) throw new Error(error.message);
  return getBillingSettings(env);
}
