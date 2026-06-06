import { BILLING_CYCLE_DAYS, PLAN_VALUE_CENTS, REFUND_FULL_DAYS } from "./constants";
import { calendarDaysUntil } from "./dates";

export type RefundQuote = {
  refundType: "integral" | "pro_rata";
  suggestedRefundCents: number;
  daysUsed: number;
  daysRemaining: number;
};

export function getRefundQuote(paidAt: string, valueCents = PLAN_VALUE_CENTS, now?: string): RefundQuote {
  const daysUsed = calendarDaysUntil(paidAt, now) * -1 + 1;
  const clampedDaysUsed = Math.max(1, daysUsed);

  if (clampedDaysUsed <= REFUND_FULL_DAYS) {
    return {
      refundType: "integral",
      suggestedRefundCents: valueCents,
      daysUsed: clampedDaysUsed,
      daysRemaining: Math.max(0, BILLING_CYCLE_DAYS - clampedDaysUsed),
    };
  }

  const daysRemaining = Math.max(0, BILLING_CYCLE_DAYS - clampedDaysUsed);
  const perDay = valueCents / BILLING_CYCLE_DAYS;
  const suggestedRefundCents = Math.round(daysRemaining * perDay);

  return {
    refundType: "pro_rata",
    suggestedRefundCents,
    daysUsed: clampedDaysUsed,
    daysRemaining,
  };
}
