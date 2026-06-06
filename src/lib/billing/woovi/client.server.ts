import { getServerEnv } from "@/lib/env.server";
import { getWooviApiBase, resolveWooviAuthorization } from "./auth.server";

export type WooviFetchError = {
  status: number;
  message: string;
  body?: unknown;
};

export function isWooviConfigured(source?: Record<string, string | undefined>): boolean {
  return !!resolveWooviAuthorization(source);
}

export async function wooviFetch<T>(
  path: string,
  init: RequestInit = {},
  source?: Record<string, string | undefined>,
): Promise<T> {
  const auth = resolveWooviAuthorization(source);
  if (!auth) {
    throw { status: 503, message: "Pagamento PIX indisponível no momento." } satisfies WooviFetchError;
  }

  const base = getWooviApiBase(source).replace(/\/$/, "");
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(init.headers);
  headers.set("Authorization", auth);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { ...init, headers });
  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.includes("application/pdf")) {
    const buf = await res.arrayBuffer();
    if (!res.ok) {
      throw { status: res.status, message: "Não foi possível obter o comprovante." } satisfies WooviFetchError;
    }
    return buf as T;
  }

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const msg =
      typeof body === "object" && body && "error" in body
        ? String((body as { error: string }).error)
        : `Erro Woovi (${res.status})`;
    throw { status: res.status, message: msg, body } satisfies WooviFetchError;
  }

  return body as T;
}

/** Opcional: se definido, valida header Authorization do webhook Woovi. */
export function getWebhookAuthorization(source?: Record<string, string | undefined>): string | null {
  return getServerEnv("WOOVI_WEBHOOK_AUTHORIZATION", source) ?? null;
}
