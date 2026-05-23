const FAVICON_RELS = ["icon", "shortcut icon", "apple-touch-icon"] as const;

const DEFAULT_FAVICON = "/favicon.svg";

function mimeFromDataUrl(href: string): string | undefined {
  const m = href.match(/^data:(image\/[a-z+]+);/i);
  return m?.[1];
}

/** Atualiza favicon(s) no documento; aceita data URL ou URL pública. */
export function applyFavicon(href: string): void {
  const type = mimeFromDataUrl(href);
  for (const rel of FAVICON_RELS) {
    let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement("link");
      el.rel = rel;
      document.head.appendChild(el);
    }
    el.href = href;
    if (type) el.type = type;
    else el.removeAttribute("type");
  }
}

export function resetFavicon(): void {
  applyFavicon(DEFAULT_FAVICON);
}

export function syncFavicon(logoUrl?: string | null): void {
  if (logoUrl) applyFavicon(logoUrl);
  else resetFavicon();
}
