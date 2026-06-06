import { getServerEnv } from "@/lib/env.server";
import { isEvolutionMock } from "./instance.server";

function evolutionBaseUrl(env?: Record<string, string | undefined>): string | null {
  const url = getServerEnv("EVOLUTION_API_URL", env);
  return url?.replace(/\/$/, "") ?? null;
}

function evolutionApiKey(env?: Record<string, string | undefined>): string | null {
  return getServerEnv("EVOLUTION_API_KEY", env) ?? null;
}

async function evolutionFetch<T>(
  path: string,
  init: RequestInit,
  env?: Record<string, string | undefined>,
): Promise<T> {
  const base = evolutionBaseUrl(env);
  const key = evolutionApiKey(env);
  if (!base || !key) {
    throw new Error("Evolution API não configurada (EVOLUTION_API_URL / EVOLUTION_API_KEY).");
  }

  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Evolution API erro ${res.status}: ${text || res.statusText}`);
  }

  return (await res.json()) as T;
}

export async function ensureEvolutionInstance(
  instanceName: string,
  env?: Record<string, string | undefined>,
): Promise<void> {
  if (isEvolutionMock(env)) return;

  try {
    await evolutionFetch(
      "/instance/create",
      {
        method: "POST",
        body: JSON.stringify({
          instanceName,
          integration: "WHATSAPP-BAILEYS",
          qrcode: false,
        }),
      },
      env,
    );
  } catch (e) {
    const msg = (e as Error).message ?? "";
    if (!msg.includes("already") && !msg.includes("403") && !msg.includes("409")) {
      throw e;
    }
  }
}

export async function fetchEvolutionConnectQr(
  instanceName: string,
  env?: Record<string, string | undefined>,
): Promise<{ base64: string | null; pairingCode: string | null }> {
  if (isEvolutionMock(env)) {
    return { base64: null, pairingCode: "MOCK-PAIRING" };
  }

  const data = await evolutionFetch<{
    base64?: string;
    qrcode?: { base64?: string };
    pairingCode?: string;
    code?: string;
  }>(`/instance/connect/${encodeURIComponent(instanceName)}`, { method: "GET" }, env);

  const base64 = data.base64 ?? data.qrcode?.base64 ?? null;
  const pairingCode = data.pairingCode ?? data.code ?? null;
  return { base64, pairingCode };
}

export async function fetchEvolutionConnectionState(
  instanceName: string,
  env?: Record<string, string | undefined>,
): Promise<string> {
  if (isEvolutionMock(env)) return "open";

  const data = await evolutionFetch<{
    instance?: { state?: string };
    state?: string;
  }>(`/instance/connectionState/${encodeURIComponent(instanceName)}`, { method: "GET" }, env);

  return data.instance?.state ?? data.state ?? "unknown";
}
