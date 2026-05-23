/** UUID v4 com getRandomValues (funciona sem randomUUID, ex. HTTP não seguro). */
function uuidFromRandomBytes(random: () => number): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = random() | 0;
    const v = c === "x" ? r & 0xf : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function uuidFromGetRandomValues(): string | null {
  if (typeof crypto === "undefined" || typeof crypto.getRandomValues !== "function") {
    return null;
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(id: string): boolean {
  return UUID_RE.test(id);
}

/** Corrige IDs legados gerados antes do fallback UUID (ex.: `1779545045067-abc`). */
export function ensureUuid(id: string): string {
  return isValidUuid(id) ? id : newId();
}

/** Gera UUID v4 aceito pelo Postgres/Supabase. */
export function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const fromBytes = uuidFromGetRandomValues();
  if (fromBytes) return fromBytes;
  return uuidFromRandomBytes(() => Math.floor(Math.random() * 16));
}
