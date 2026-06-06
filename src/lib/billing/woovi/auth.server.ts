import { getServerEnv } from "@/lib/env.server";

export function normalizeWooviAppId(raw: string): string {
  return raw.replace(/^Bearer\s+/i, "").replace(/^["']|["']$/g, "").trim();
}

export function buildWooviAppIdFromClientCredentials(clientId: string, clientSecret: string): string {
  const encoded =
    typeof btoa === "function"
      ? btoa(`${clientId}:${clientSecret}`)
      : Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  return normalizeWooviAppId(encoded);
}

export function resolveWooviAuthorization(source?: Record<string, string | undefined>): string | null {
  const direct = getServerEnv("WOOVI_APP_ID", source);
  if (direct) return normalizeWooviAppId(direct);

  const clientId = getServerEnv("WOOVI_CLIENT_ID", source);
  const clientSecret = getServerEnv("WOOVI_CLIENT_SECRET", source);
  if (clientId && clientSecret) {
    return buildWooviAppIdFromClientCredentials(clientId, clientSecret);
  }
  return null;
}

export function getWooviApiBase(source?: Record<string, string | undefined>): string {
  return getServerEnv("WOOVI_API_URL", source) ?? "https://api.openpix.com.br/api/v1";
}
