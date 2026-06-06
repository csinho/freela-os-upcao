export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/** App já aberto como PWA instalado (standalone / tela inicial). */
export function isPwaInstalled(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  if (window.matchMedia("(display-mode: fullscreen)").matches) return true;
  return (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function canShowPwaInstallUi(): boolean {
  if (typeof window === "undefined") return false;
  if (isPwaInstalled()) return false;
  if (!("serviceWorker" in navigator)) return false;
  return true;
}
