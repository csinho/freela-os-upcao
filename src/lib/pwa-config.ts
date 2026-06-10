import { APP_DESCRIPTION, APP_NAME } from "./app-brand";
import { BRAND_COLOR_DARK, BRAND_COLOR_WHITE } from "./brand-colors";

export const PWA_THEME_COLOR = BRAND_COLOR_WHITE;
export const PWA_BACKGROUND_COLOR = BRAND_COLOR_WHITE;

export const pwaManifest = {
  name: APP_NAME,
  short_name: APP_NAME,
  description: APP_DESCRIPTION,
  lang: "pt-BR",
  dir: "ltr" as const,
  start_url: "/login",
  scope: "/",
  display: "standalone" as const,
  orientation: "portrait-primary" as const,
  theme_color: PWA_THEME_COLOR,
  background_color: PWA_BACKGROUND_COLOR,
  categories: ["business", "productivity"],
  icons: [
    {
      src: "/favicon.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/pwa-192x192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/pwa-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/pwa-512x512-maskable.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
};
