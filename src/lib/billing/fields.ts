import { TRIAL_DAYS } from "./constants";
import { trialEndsAtFrom } from "./dates";

export function billingFieldsForNewEmpresa(createdAt = new Date().toISOString()) {
  const trialEnds = trialEndsAtFrom(createdAt, TRIAL_DAYS);
  return {
    billing_status: "trial" as const,
    trial_ends_at: trialEnds,
    next_billing_at: trialEnds,
    billing_period_ends_at: null,
    last_payment_at: null,
    woovi_charge_correlation_id: null,
    woovi_payment_link_url: null,
  };
}
