import { wooviFetch } from "./client.server";

type WooviChargeDetail = {
  charge?: {
    correlationID?: string;
    status?: string;
    paidAt?: string;
    value?: number;
    pix?: { endToEndId?: string };
    paymentLinkUrl?: string;
  };
};

export async function fetchWooviChargeMeta(
  correlationID: string,
  env?: Record<string, string | undefined>,
): Promise<{ endToEndId: string | null; paidAt: string | null; value: number | null }> {
  const data = await wooviFetch<WooviChargeDetail>(`/charge/${encodeURIComponent(correlationID)}`, {}, env);
  const charge = data.charge;
  return {
    endToEndId: charge?.pix?.endToEndId ?? null,
    paidAt: charge?.paidAt ?? null,
    value: charge?.value ?? null,
  };
}

export function extractPaymentMetaFromWebhook(payload: Record<string, unknown>): {
  correlationID: string | null;
  paidAt: string | null;
  valueCents: number | null;
  endToEndId: string | null;
  event: string | null;
} {
  const event = typeof payload.event === "string" ? payload.event : null;
  const charge = (payload.charge ?? payload.cobranca) as Record<string, unknown> | undefined;
  const pix = charge?.pix as Record<string, unknown> | undefined;

  return {
    event,
    correlationID: typeof charge?.correlationID === "string" ? charge.correlationID : null,
    paidAt: typeof charge?.paidAt === "string" ? charge.paidAt : new Date().toISOString(),
    valueCents: typeof charge?.value === "number" ? charge.value : null,
    endToEndId: typeof pix?.endToEndId === "string" ? pix.endToEndId : null,
  };
}

export function extractRefundMetaFromWebhook(payload: Record<string, unknown>): {
  event: string | null;
  endToEndId: string | null;
  refundValueCents: number | null;
} {
  const event = typeof payload.event === "string" ? payload.event : null;
  const original = (payload.originalTransaction ?? payload.pix) as Record<string, unknown> | undefined;
  const refund = payload.refund as Record<string, unknown> | undefined;

  return {
    event,
    endToEndId:
      typeof original?.endToEndId === "string"
        ? original.endToEndId
        : typeof payload.endToEndId === "string"
          ? payload.endToEndId
          : null,
    refundValueCents:
      typeof refund?.value === "number"
        ? refund.value
        : typeof payload.value === "number"
          ? payload.value
          : null,
  };
}
