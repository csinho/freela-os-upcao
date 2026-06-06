import { BILLING_CYCLE_DAYS, TIMEZONE } from "./constants";

const brDateFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function toBrCalendarDay(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return brDateFmt.format(d);
}

function parseBrDay(day: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function calendarDaysUntil(targetIso: string, nowIso?: string): number {
  const targetDay = toBrCalendarDay(targetIso);
  const nowDay = toBrCalendarDay(nowIso ? new Date(nowIso) : new Date());
  const diffMs = parseBrDay(targetDay).getTime() - parseBrDay(nowDay).getTime();
  return Math.round(diffMs / (24 * 60 * 60 * 1000));
}

export function addCalendarDays(iso: string, days: number): string {
  const base = parseBrDay(toBrCalendarDay(iso));
  base.setDate(base.getDate() + days);
  return base.toISOString();
}

export function nextBillingAfterPayment(paidAt: string, dueAt: string | null | undefined): string {
  const paidDay = toBrCalendarDay(paidAt);
  const dueDay = dueAt ? toBrCalendarDay(dueAt) : paidDay;
  const daysEarly = dueAt ? Math.max(0, calendarDaysUntil(dueAt, paidAt)) : 0;
  const base = parseBrDay(paidDay);
  base.setDate(base.getDate() + BILLING_CYCLE_DAYS + daysEarly);
  return base.toISOString();
}

export function formatDatePt(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { timeZone: TIMEZONE });
}

export function trialEndsAtFrom(createdAt: string, trialDays: number): string {
  return addCalendarDays(createdAt, trialDays);
}
