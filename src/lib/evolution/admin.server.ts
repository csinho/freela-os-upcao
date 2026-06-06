import { getSupabaseServer } from "@/integrations/supabase/server";
import type { EvolutionQrResult } from "@/lib/admin/types";
import {
  fetchEvolutionConnectionState,
  fetchEvolutionConnectQr,
  ensureEvolutionInstance,
} from "./instance-api.server";
import { resolveEvolutionInstanceName } from "./instance.server";

type EvolutionSettingsValue = {
  instance_name?: string;
  connection_state?: string;
  connected_at?: string | null;
};

async function readEvolutionSettings(
  env?: Record<string, string | undefined>,
): Promise<EvolutionSettingsValue> {
  const sb = getSupabaseServer(env);
  const { data } = await sb
    .from("system_settings")
    .select("value")
    .eq("key", "evolution")
    .maybeSingle();
  return (data?.value ?? {}) as EvolutionSettingsValue;
}

async function writeEvolutionSettings(
  patch: EvolutionSettingsValue,
  env?: Record<string, string | undefined>,
): Promise<void> {
  const current = await readEvolutionSettings(env);
  const sb = getSupabaseServer(env);
  const { error } = await sb.from("system_settings").upsert(
    {
      key: "evolution",
      value: { ...current, ...patch },
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
  if (error) throw new Error(error.message);
}

export async function getEvolutionAdminState(env?: Record<string, string | undefined>): Promise<{
  instanceName: string;
  connectionState: string;
  connectedAt: string | null;
  envFallbackInstance: string | null;
}> {
  const stored = await readEvolutionSettings(env);
  const resolved = (await resolveEvolutionInstanceName(env)) ?? "";
  return {
    instanceName: stored.instance_name ?? resolved,
    connectionState: stored.connection_state ?? "unknown",
    connectedAt: stored.connected_at ?? null,
    envFallbackInstance: stored.instance_name ? null : resolved || null,
  };
}

export async function saveEvolutionInstanceAdmin(
  instanceName: string,
  env?: Record<string, string | undefined>,
): Promise<{ instanceName: string; connectionState: string }> {
  const name = instanceName.trim();
  if (!name) throw new Error("Informe o nome da instância Evolution.");

  await ensureEvolutionInstance(name, env);
  const state = await fetchEvolutionConnectionState(name, env);

  await writeEvolutionSettings(
    {
      instance_name: name,
      connection_state: state,
      connected_at: state === "open" ? new Date().toISOString() : null,
    },
    env,
  );

  return { instanceName: name, connectionState: state };
}

export async function getEvolutionQrAdmin(
  env?: Record<string, string | undefined>,
): Promise<EvolutionQrResult> {
  const instanceName = await resolveEvolutionInstanceName(env);
  if (!instanceName) {
    throw new Error("Salve o nome da instância antes de gerar o QR Code.");
  }

  const qr = await fetchEvolutionConnectQr(instanceName, env);
  const connectionState = await fetchEvolutionConnectionState(instanceName, env);

  await writeEvolutionSettings(
    {
      instance_name: instanceName,
      connection_state: connectionState,
      connected_at: connectionState === "open" ? new Date().toISOString() : null,
    },
    env,
  );

  return {
    instanceName,
    base64: qr.base64,
    pairingCode: qr.pairingCode,
    connectionState,
  };
}

export async function refreshEvolutionConnectionAdmin(
  env?: Record<string, string | undefined>,
): Promise<{ connectionState: string; connectedAt: string | null }> {
  const instanceName = await resolveEvolutionInstanceName(env);
  if (!instanceName) throw new Error("Instância Evolution não configurada.");

  const connectionState = await fetchEvolutionConnectionState(instanceName, env);
  const connectedAt = connectionState === "open" ? new Date().toISOString() : null;

  await writeEvolutionSettings(
    { instance_name: instanceName, connection_state: connectionState, connected_at: connectedAt },
    env,
  );

  return { connectionState, connectedAt };
}
