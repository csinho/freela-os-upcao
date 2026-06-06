export function wooviChargeComment(raw: string): string {
  return raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .trim()
    .slice(0, 140);
}

export function wooviCustomerName(raw: string): string {
  return raw
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

export function normalizePhoneBr11(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11) return `55${digits}`;
  if (digits.length === 13 && digits.startsWith("55")) return digits;
  if (digits.length === 10) return `55${digits}`;
  return null;
}
