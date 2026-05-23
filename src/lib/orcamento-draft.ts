import type { Orcamento } from "./types";

const prefix = "orcamento-draft-";

export function saveOrcamentoDraft(o: Orcamento): void {
  sessionStorage.setItem(`${prefix}${o.id}`, JSON.stringify(o));
}

export function loadOrcamentoDraft(id: string): Orcamento | null {
  try {
    const raw = sessionStorage.getItem(`${prefix}${id}`);
    if (!raw) return null;
    return JSON.parse(raw) as Orcamento;
  } catch {
    return null;
  }
}

export function clearOrcamentoDraft(id: string): void {
  sessionStorage.removeItem(`${prefix}${id}`);
}
