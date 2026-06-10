import { getServerEnv } from "@/lib/env.server";

export type EvolutionQrPayload = {
  base64: string | null;
  pairingCode: string | null;
};

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

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

function pickBase64(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  // Evolution às vezes devolve o payload bruto do QR em "code" (não é imagem).
  if (trimmed.startsWith("2@") || trimmed.length < 64) return null;
  return trimmed;
}

function parseQrResponse(data: Record<string, unknown>): EvolutionQrPayload {
  const qrcode = data.qrcode as { base64?: string } | undefined;
  const base64 =
    pickBase64(data.base64) ??
    pickBase64(qrcode?.base64) ??
    pickBase64((data.instance as { qrcode?: { base64?: string } } | undefined)?.qrcode?.base64);
  const pairingCode = typeof data.pairingCode === "string" ? data.pairingCode : null;
  return { base64, pairingCode };
}

export function toEvolutionApiNumber(phone11: string): string {
  const digits = phone11.replace(/\D/g, "");
  if (digits.length === 11) return `55${digits}`;
  if (digits.length === 13 && digits.startsWith("55")) return digits;
  throw new Error("Informe o WhatsApp com 11 dígitos (DDD + número).");
}

export async function deleteEvolutionInstance(
  instanceName: string,
  env?: Record<string, string | undefined>,
): Promise<void> {
  try {
    await evolutionFetch(
      `/instance/delete/${encodeURIComponent(instanceName)}`,
      { method: "DELETE" },
      env,
    );
  } catch (e) {
    const msg = (e as Error).message ?? "";
    if (msg.includes("404") || msg.toLowerCase().includes("not found")) return;
    throw e;
  }
}

export async function ensureEvolutionInstance(
  instanceName: string,
  env?: Record<string, string | undefined>,
  opts?: { number?: string; qrcode?: boolean; recreate?: boolean },
): Promise<EvolutionQrPayload> {
  if (opts?.recreate) {
    await deleteEvolutionInstance(instanceName, env);
  }

  try {
    const data = await evolutionFetch<Record<string, unknown>>(
      "/instance/create",
      {
        method: "POST",
        body: JSON.stringify({
          instanceName,
          integration: "WHATSAPP-BAILEYS",
          qrcode: opts?.qrcode ?? true,
          ...(opts?.number ? { number: opts.number } : {}),
        }),
      },
      env,
    );
    return parseQrResponse(data);
  } catch (e) {
    const msg = (e as Error).message ?? "";
    if (
      msg.includes("already") ||
      msg.includes("403") ||
      msg.includes("409") ||
      msg.toLowerCase().includes("exists")
    ) {
      return fetchEvolutionConnectQr(instanceName, env, opts?.number);
    }
    throw e;
  }
}

export async function fetchEvolutionConnectQr(
  instanceName: string,
  env?: Record<string, string | undefined>,
  number?: string,
): Promise<EvolutionQrPayload> {
  const query = number ? `?number=${encodeURIComponent(number)}` : "";
  const data = await evolutionFetch<Record<string, unknown>>(
    `/instance/connect/${encodeURIComponent(instanceName)}${query}`,
    { method: "GET" },
    env,
  );
  const parsed = parseQrResponse(data);
  if (!parsed.base64 && !parsed.pairingCode) {
    throw new Error(
      "Evolution não retornou QR Code. Confirme URL/API key, crie a instância novamente ou verifique o painel Evolution.",
    );
  }
  return parsed;
}

export async function fetchEvolutionConnectionState(
  instanceName: string,
  env?: Record<string, string | undefined>,
): Promise<string> {
  const data = await evolutionFetch<{
    instance?: { state?: string; status?: string };
    state?: string;
    status?: string;
  }>(`/instance/connectionState/${encodeURIComponent(instanceName)}`, { method: "GET" }, env);

  return (
    data.instance?.state ??
    data.instance?.status ??
    data.state ??
    data.status ??
    "unknown"
  );
}
