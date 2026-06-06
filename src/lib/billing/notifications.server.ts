import { formatDatePt } from "./dates";

export type BillingNotificationKind =
  | "trial_reminder"
  | "renewal_reminder"
  | "payment_confirmed"
  | "payment_pending";

export type BillingNotificationPayload = {
  empresaId: string;
  empresaNome: string;
  telefone?: string | null;
  kind: BillingNotificationKind;
  daysUntilDue?: number;
  nextBillingAt?: string | null;
  paymentLinkUrl?: string | null;
};

function buildMessage(payload: BillingNotificationPayload): string {
  const next = payload.nextBillingAt ? formatDatePt(payload.nextBillingAt) : "—";
  switch (payload.kind) {
    case "trial_reminder":
      return `[Freela OS] Seu trial termina em ${payload.daysUntilDue} dia(s). Acesse /plano para pagar via PIX.`;
    case "renewal_reminder":
      return `[Freela OS] Renovação do plano em ${payload.daysUntilDue} dia(s) (${next}). Pague antecipado em /plano.`;
    case "payment_confirmed":
      return `[Freela OS] Pagamento confirmado! Próxima cobrança: ${next}.`;
    case "payment_pending":
      return `[Freela OS] Pagamento pendente. Gere o PIX em /plano para continuar usando o sistema.`;
    default:
      return `[Freela OS] Atualização de plano.`;
  }
}

/** Stub: loga no servidor; conectar WhatsApp/API depois. */
export async function sendBillingNotification(payload: BillingNotificationPayload): Promise<void> {
  const message = buildMessage(payload);
  console.info("[billing-notification]", {
    channel: "whatsapp_stub",
    to: payload.telefone ?? null,
    kind: payload.kind,
    empresaId: payload.empresaId,
    message,
    paymentLinkUrl: payload.paymentLinkUrl ?? null,
  });
}
