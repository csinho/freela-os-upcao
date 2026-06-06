import { getServerEnv } from "@/lib/env.server";
import { runBillingDailyJob, processWooviWebhookPayload } from "@/lib/billing/billing.server";
import { getWebhookAuthorization } from "@/lib/billing/woovi/client.server";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function resolveCronSecret(request: Request, env?: Record<string, string | undefined>): string | null {
  const expected = getServerEnv("BILLING_CRON_SECRET", env);
  if (!expected) return null;

  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("secret");
  if (fromQuery && fromQuery === expected) return expected;

  const fromHeader = request.headers.get("x-cron-secret");
  if (fromHeader && fromHeader === expected) return expected;

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ") && auth.slice(7) === expected) return expected;

  return null;
}

export async function handleWooviWebhook(
  request: Request,
  env?: Record<string, string | undefined>,
): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
  }

  const expectedAuth = getWebhookAuthorization(env);
  if (expectedAuth) {
    const received = request.headers.get("authorization") ?? "";
    if (received !== expectedAuth) {
      return jsonResponse({ ok: false, error: "unauthorized" }, 401);
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse({ ok: false, error: "invalid_json" }, 400);
  }

  try {
    const result = await processWooviWebhookPayload(payload, env);
    return jsonResponse(result);
  } catch (err) {
    console.error("[woovi-webhook]", err);
    return jsonResponse({ ok: false, error: (err as Error).message }, 500);
  }
}

export async function handleBillingCron(
  request: Request,
  env?: Record<string, string | undefined>,
): Promise<Response> {
  if (request.method !== "GET") {
    return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
  }

  if (!resolveCronSecret(request, env)) {
    return jsonResponse({ ok: false, error: "unauthorized" }, 401);
  }

  try {
    const result = await runBillingDailyJob(env);
    return jsonResponse({ ok: true, ...result });
  } catch (err) {
    console.error("[billing-cron]", err);
    return jsonResponse({ ok: false, error: (err as Error).message }, 500);
  }
}

export function matchApiRoute(pathname: string): "woovi-webhook" | "billing-cron" | null {
  if (pathname === "/api/webhooks/woovi") return "woovi-webhook";
  if (pathname === "/api/cron/billing") return "billing-cron";
  return null;
}

export async function handleApiRequest(
  request: Request,
  env?: Record<string, string | undefined>,
): Promise<Response | null> {
  const route = matchApiRoute(new URL(request.url).pathname);
  if (route === "woovi-webhook") return handleWooviWebhook(request, env);
  if (route === "billing-cron") return handleBillingCron(request, env);
  return null;
}
