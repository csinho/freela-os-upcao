import { PLAN_VALUE_CENTS, TRIAL_DAYS } from "./constants";

export function parsePlanValueCents(raw: unknown, fallback = PLAN_VALUE_CENTS): number {
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    return Math.round(raw);
  }
  if (typeof raw === "string") {
    const parsed = parseInt(raw, 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return fallback;
}

export function formatPlanLabel(cents: number): string {
  const reais = (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  return `${reais}/mês`;
}

export type PublicPlanSettings = {
  planValueCents: number;
  planLabel: string;
  trialDays: number;
};

export function buildPublicPlanSettings(
  rawCents: unknown,
  fallbackCents = PLAN_VALUE_CENTS,
): PublicPlanSettings {
  const planValueCents = parsePlanValueCents(rawCents, fallbackCents);
  return {
    planValueCents,
    planLabel: formatPlanLabel(planValueCents),
    trialDays: TRIAL_DAYS,
  };
}
