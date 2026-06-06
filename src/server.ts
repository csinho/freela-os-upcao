import "./lib/error-capture";

import { handleApiRequest } from "./lib/api/request-handlers";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { runBillingDailyJob } from "./lib/billing/billing.server";
import { getServerEnv } from "./lib/env.server";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function resolveErrorMessage(err: unknown): string | undefined {
  if (!err) return undefined;
  if (err instanceof Error) {
    if (err.cause instanceof Error && err.cause.message) return err.cause.message;
    return err.message;
  }
  return String(err);
}

function brandedErrorResponse(captured?: unknown): Response {
  const detail = resolveErrorMessage(captured);
  return new Response(renderErrorPage(detail), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  const captured = consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`);
  console.error(captured);
  return brandedErrorResponse(captured);
}

function envRecord(env: unknown): Record<string, string | undefined> | undefined {
  if (!env || typeof env !== "object") return undefined;
  return env as Record<string, string | undefined>;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const bindings = envRecord(env);
      const apiResponse = await handleApiRequest(request, bindings);
      if (apiResponse) return apiResponse;

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse(error);
    }
  },
  async scheduled(_event: unknown, env: unknown, _ctx: unknown) {
    const bindings = envRecord(env);
    const secret = getServerEnv("BILLING_CRON_SECRET", bindings);
    if (!secret) {
      console.warn("[billing-cron] BILLING_CRON_SECRET ausente — cron ignorado.");
      return;
    }
    try {
      const result = await runBillingDailyJob(bindings);
      console.info("[billing-cron] concluído", result);
    } catch (error) {
      console.error("[billing-cron] falhou", error);
    }
  },
};
